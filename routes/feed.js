const express = require('express');
const { body } = require('express-validator/check');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const feedController = require('../controllers/feed');

const router = express.Router();

// Minify images
var mininfyImages = async (req, res, next) => {
  const files = await imagemin([`${req.file.path}`], 'images', { plugins: [imageminJpegtran(), imageminPngquant({ quality: '65-80' })] });
  console.log('Minified files', files);
  next();
};

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/posts
router.post(
  '/posts',
  [ // array of middlewares
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
    mininfyImages
  ],
  feedController.createPost);

// GET /feed/post/:postId
router.get('/post/:postId', feedController.getPost);

// PUT /feed/post/:postId
router.put(
  '/post/:postId',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  feedController.updatePost);

router.delete('/post/:postId', feedController.deletePost);
module.exports = router;
