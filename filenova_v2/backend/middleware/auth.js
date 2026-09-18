'use strict';

/**
 * Anonymous session fingerprint validation.
 * Client sends `x-session-fingerprint` (or `fingerprint` in JSON body):
 *   browser-fingerprint + timestamp, 16–128 chars, [A-Za-z0-9-_: .].
 * Server stores only the SHA-256 hash (see utils/crypto.js).
 */

const { hashFingerprint } = require('../utils/crypto');

const FP_RE = /^[A-Za-z0-9\-_:.\s]{16,128}$/;

function extractRaw(req) {
  const fromHeader = req.get('x-session-fingerprint');
  if (fromHeader && fromHeader.trim()) return fromHeader.trim();
  const fromBody = req.body && req.body.fingerprint;
  if (typeof fromBody === 'string' && fromBody.trim()) return fromBody.trim();
  return '';
}

function fingerprintRequired(req, res, next) {
  const raw = extractRaw(req);
  if (!raw) {
    return res.status(401).json({
      error: 'missing_fingerprint',
      message: 'Session fingerprint is required.',
      howToFix: 'Send header x-session-fingerprint: <browser-fingerprint>-<timestamp>.',
    });
  }
  if (!FP_RE.test(raw)) {
    return res.status(401).json({
      error: 'invalid_fingerprint',
      message: 'Session fingerprint format is invalid.',
      howToFix: 'Use 16–128 chars of letters, numbers, dashes, underscores, colons, dots.',
    });
  }
  req.fingerprint = raw;
  req.fingerprintHash = hashFingerprint(raw);
  return next();
}

/** Optional variant for GET /status — fingerprint improves abuse tracking but isn't mandatory. */
function fingerprintOptional(req, res, next) {
  const raw = extractRaw(req);
  if (raw && FP_RE.test(raw)) {
    req.fingerprint = raw;
    req.fingerprintHash = hashFingerprint(raw);
  }
  return next();
}

module.exports = { fingerprintRequired, fingerprintOptional };
