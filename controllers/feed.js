const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');
const Post = require('../models/posts');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  try {
    const postCount = Post.find().countDocuments();
    const filteredPosts = Post.find().skip((currentPage - 1) * perPage).limit(perPage);
    // Parallel processing
    const [totalItems, posts] = await Promise.all([postCount, filteredPosts]);

    res.status(200).json({
      message: `Found ${posts} post(s)`,
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
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
    creator: req.userId // added by auth middleware to req
  });

  try {
    post.save(); // think no need to wait on this request but what happens if it errors / fails / takes too long? Rollback? 
    const user = await User.findById(req.userId);
    user.posts.push(post);

    await user.save();
    res.status(201).json({
      message: 'Post created successfully',
      post: post,
      creator: { _id: user.id, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err); // Go to next error handling middleware - that takes error as first parameter
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error(`Could not find post by id ${postId}`);
      error.statusCode = 404;
      throw error; // this will be caught in the catch block which will pass it on to next error handling middleware using next(err)
    }
    res.status(200).json({ message: 'Post fetched.', post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = `Failed to get post id ${postId}`;
    }
    next(err);
  }
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
  let imageUrl = req.body.image;
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

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Unauthorised to update this post');
        error.statusCode = 403;
        throw error;
      }

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

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error(`Post not found ${postId}`);
        error.statusCode = 404;
        throw error;
      }
      if (post.creator !== req.userId) {
        const error = new Error('Unauthorised to delete this item');
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId)
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      const message = `Post successfully deleted ${postId}`;
      res.status(200).json({ message: message });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => { console.log(err) });
};