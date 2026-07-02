const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// A helper login route to get a token for testing
router.post('/login-test', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required (e.g. any MongoDB ObjectId string)' });
  }
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '24h' });
  res.json({ success: true, token });
});

module.exports = router;
