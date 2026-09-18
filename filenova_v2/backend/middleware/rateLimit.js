'use strict';

/**
 * Rate limiters (abuse prevention).
 * - Room creation is strict (prevent code farming).
 * - Join attempts are strict-ish (prevent code brute-force).
 * - Status polling is lenient (sender + receiver poll during transfer).
 */

const rateLimit = require('express-rate-limit');

function jsonMessage(message) {
  return { error: 'rate_limited', message };
}

const createRoomLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many rooms created. Please wait 15 minutes and try again.'),
});

const joinLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many join attempts. Please wait 10 minutes and try again.'),
});

const statusLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many status checks. Please slow down.'),
});

const initLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many upload starts. Please wait a few minutes.'),
});

const chunkLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 1200, // chunks are small (1 MiB); a 1 GB file needs ~1024 posts
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Uploading too fast. Please wait and resume.'),
});

const fileReadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many download requests. Please slow down.'),
});

const textLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many text snippets. Please wait a few minutes.'),
});

module.exports = { createRoomLimiter, joinLimiter, statusLimiter, initLimiter, chunkLimiter, fileReadLimiter, textLimiter };
