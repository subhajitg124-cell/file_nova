'use strict';

const assert = require('assert');
const http = require('http');
const crypto = require('crypto');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { app, server } = require('./server');

const TEST_PORT = 3199;

async function runTests() {
  console.log('--- Starting FileNova v2 Verification Tests ---');

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`Test server running on port ${TEST_PORT}`);

  const baseUrl = `http://localhost:${TEST_PORT}`;
  const fp = 'test-browser-fingerprint-12345678';

  async function request(urlPath, options = {}) {
    return new Promise((resolve, reject) => {
      const u = new URL(urlPath, baseUrl);
      const headers = options.headers || {};
      if (options.body && typeof options.body === 'object' && !(options.body instanceof Buffer)) {
        headers['Content-Type'] = 'application/json';
      }
      headers['x-session-fingerprint'] = fp;

      const req = http.request(u, {
        method: options.method || 'GET',
        headers,
      }, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const bodyBuffer = Buffer.concat(chunks);
          let json = null;
          try {
            json = JSON.parse(bodyBuffer.toString('utf8'));
          } catch {
            // not json
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json || bodyBuffer.toString('utf8'),
            raw: bodyBuffer,
          });
        });
      });

      req.on('error', reject);
      if (options.body) {
        if (typeof options.body === 'object' && !(options.body instanceof Buffer)) {
          req.write(JSON.stringify(options.body));
        } else {
          req.write(options.body);
        }
      }
      req.end();
    });
  }

  // 1. Health check
  console.log('1. Testing /api/health...');
  const healthRes = await request('/api/health');
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  assert.strictEqual(healthRes.body.ok, true, 'Health check ok should be true');
  console.log('✓ Health check passed');

  // 2. Create room
  console.log('2. Testing POST /api/rooms (Room Creation)...');
  const createRes = await request('/api/rooms', {
    method: 'POST',
    body: { expiresIn: '30m', pin: '4321' },
  });
  assert.strictEqual(createRes.status, 201, 'Create room should return 201');
  assert.ok(createRes.body.roomId, 'Should return roomId');
  assert.ok(createRes.body.code, 'Should return room code');
  assert.ok(createRes.body.salt, 'Should return salt');
  assert.strictEqual(createRes.body.hasPin, true, 'hasPin should be true');
  const roomId = createRes.body.roomId;
  const roomCode = createRes.body.code;
  console.log(`✓ Room created successfully: ID=${roomId}, Code=${roomCode}`);

  // 3. Room status
  console.log('3. Testing GET /api/rooms/:id/status...');
  const statusRes = await request(`/api/rooms/${roomId}/status`);
  assert.strictEqual(statusRes.status, 200, 'Status check should return 200');
  assert.strictEqual(statusRes.body.status, 'waiting', 'Status should be waiting');
  console.log('✓ Room status verified');

  // 4. Join room (Wrong PIN)
  console.log('4. Testing POST /api/rooms/join (Wrong PIN rejection)...');
  const badJoinRes = await request('/api/rooms/join', {
    method: 'POST',
    body: { code: roomCode, pin: '0000' },
  });
  assert.strictEqual(badJoinRes.status, 403, 'Wrong PIN should return 403');
  console.log('✓ Wrong PIN correctly rejected');

  // 5. Join room (Correct PIN)
  console.log('5. Testing POST /api/rooms/join (Correct PIN)...');
  const joinRes = await request('/api/rooms/join', {
    method: 'POST',
    body: { code: roomCode, pin: '4321' },
  });
  assert.strictEqual(joinRes.status, 200, 'Join should return 200');
  assert.strictEqual(joinRes.body.receiverJoined, true, 'receiverJoined should be true');
  console.log('✓ Join room passed');

  // 6. Text Snippet API
  console.log('6. Testing POST /api/texts (Encrypted snippet)...');
  const textPostRes = await request('/api/texts', {
    method: 'POST',
    body: {
      roomId,
      iv: 'dGVzdGl2MTIzNDU2',
      data: 'ZW5jcnlwdGVkX3RleHRfc25pcHBldA==',
      language: 'javascript',
      title: 'main.js',
    },
  });
  assert.strictEqual(textPostRes.status, 201, 'Text creation should return 201');
  assert.ok(textPostRes.body.id, 'Text snippet ID returned');

  const textListRes = await request(`/api/texts?roomId=${roomId}`);
  assert.strictEqual(textListRes.status, 200, 'Text list should return 200');
  assert.strictEqual(textListRes.body.texts.length, 1, 'Should list 1 text snippet');
  console.log('✓ Text snippet created and retrieved');

  // 7. File Upload Init
  console.log('7. Testing File Upload Flow...');
  const fileInitRes = await request('/api/upload/init', {
    method: 'POST',
    body: {
      roomId,
      totalChunks: 1,
      encName: { iv: 'aXYxMjM0NTY3OA==', data: 'ZW5jTmFtZQ==' },
      encSize: { iv: 'aXYxMjM0NTY3OA==', data: 'ZW5jU2l6ZQ==' },
      encMime: { iv: 'aXYxMjM0NTY3OA==', data: 'ZW5jTWltZQ==' },
    },
  });
  assert.strictEqual(fileInitRes.status, 201, 'Upload init should return 201');
  const fileId = fileInitRes.body.fileId;
  assert.ok(fileId, 'fileId returned');

  // Chunk upload multipart
  const chunkBoundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const ivB64 = 'MTIzNDU2Nzg5MDEy'; // 12 bytes
  const chunkData = Buffer.from('TEST_ENCRYPTED_CHUNK_BYTES');

  const multipartBody = Buffer.concat([
    Buffer.from(`--${chunkBoundary}\r\nContent-Disposition: form-data; name="roomId"\r\n\r\n${roomId}\r\n`),
    Buffer.from(`--${chunkBoundary}\r\nContent-Disposition: form-data; name="fileId"\r\n\r\n${fileId}\r\n`),
    Buffer.from(`--${chunkBoundary}\r\nContent-Disposition: form-data; name="index"\r\n\r\n0\r\n`),
    Buffer.from(`--${chunkBoundary}\r\nContent-Disposition: form-data; name="iv"\r\n\r\n${ivB64}\r\n`),
    Buffer.from(`--${chunkBoundary}\r\nContent-Disposition: form-data; name="chunk"; filename="chunk.bin"\r\nContent-Type: application/octet-stream\r\n\r\n`),
    chunkData,
    Buffer.from(`\r\n--${chunkBoundary}--\r\n`),
  ]);

  const chunkRes = await request('/api/upload/chunk', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${chunkBoundary}`,
    },
    body: multipartBody,
  });
  assert.strictEqual(chunkRes.status, 200, 'Chunk upload should return 200');
  assert.strictEqual(chunkRes.body.receivedChunks, 1, 'Chunk received count should be 1');

  // Complete upload
  const compRes = await request('/api/upload/complete', {
    method: 'POST',
    body: { roomId, fileId },
  });
  assert.strictEqual(compRes.status, 200, 'Complete upload should return 200');
  assert.strictEqual(compRes.body.complete, true, 'File should be marked complete');
  console.log('✓ File uploaded and completed successfully');

  // 8. List & Download files
  console.log('8. Testing File Download...');
  const listFilesRes = await request(`/api/files?roomId=${roomId}`);
  assert.strictEqual(listFilesRes.status, 200, 'List files should return 200');
  assert.strictEqual(listFilesRes.body.files.length, 1, 'Should have 1 file');

  const dlRes = await request(`/api/files/${fileId}/download?roomId=${roomId}`);
  assert.strictEqual(dlRes.status, 200, 'Download should return 200');
  assert.ok(dlRes.raw.length > 0, 'Should download non-empty binary blob');
  console.log('✓ File listed and downloaded successfully');

  // 9. Static Frontend Serving
  console.log('9. Testing Static Frontend Delivery...');
  const indexHtml = await request('/');
  assert.strictEqual(indexHtml.status, 200, 'index.html should be served');
  assert.ok(indexHtml.body.includes('FileNova'), 'HTML should contain FileNova');

  const roomHtml = await request('/room.html');
  assert.strictEqual(roomHtml.status, 200, 'room.html should be served');

  const joinHtml = await request('/join.html');
  assert.strictEqual(joinHtml.status, 200, 'join.html should be served');

  const receiveHtml = await request('/receive.html');
  assert.strictEqual(receiveHtml.status, 200, 'receive.html should be served');
  console.log('✓ All frontend pages served properly');

  server.close();
  console.log('\nALL 9 TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
