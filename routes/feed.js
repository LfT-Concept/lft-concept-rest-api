const express = require('express');

const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/posts
router.post(
  '/posts',
  [body('title').trim().isLength({ min: 7 }), body('content').trim().isLength({ min: 5 })],
  feedController.createPost);

router.post('/post/:postId', feedController.getPost);

module.exports = router;