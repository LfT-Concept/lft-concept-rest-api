const { validationResult } = require('express-validator/check');
const Post = require('../models/posts');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({ message: `Found ${posts.length} post(s)`, posts: posts });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 404;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error; // to be handled by express error handling middleware
  }

  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: 'Syed' },
  });

  post
    .save()
    .then(result => { // then is a Promise like object
      // Create a post in db
      res.status(201).json({
        message: 'Post created successfully',
        post: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err); // Go to next error handling middleware - that takes error as first parameter
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error(`Could not find post by id ${postId}`);
        error.statusCode = 404;
        throw error; // this will be caught in the catch block which will pass it on to next error handling middleware using next(err)
      }

      res.status(200).json({ message: 'Post fetched.', post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        err.message = `Failed to get post id ${postId}`;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.body.image;
  if (req.file) {
    // a new file uploaded on edit
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error(`Could not find post by id ${postId}`);
        error.statusCode = 404;
        throw error;
      }

      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;

      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post updated', post: result })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

};