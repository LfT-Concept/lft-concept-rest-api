const express = require('express');
const { body } = require('express-validator/check');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Minify images
var mininfyImages = async (req, res, next) => {
  const files = await imagemin([`${req.file.path}`], 'images', { plugins: [imageminJpegtran(), imageminPngquant({ quality: '65-80' })] });
  next();
};

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/posts
router.post(
  '/posts',
  isAuth,
  [ // array of middlewares
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
    mininfyImages
  ],
  feedController.createPost);

// GET /feed/post/:postId
router.get('/post/:postId', isAuth, feedController.getPost);

// PUT /feed/post/:postId
router.put(
  '/post/:postId',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);
module.exports = router;
