const { validationResult } = require('express-validator/check');
const Post = require('../models/posts');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      _id: '1',
      title: 'First Post',
      content: 'This is the first post!',
      imageUrl: 'images/duck.jpg',
      creator: {
        name: 'Syed'
      },
      createdAt: new Date()
    }]
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Validation failed, entered data is incorrect',
        errors: errors.array()
      })
  }

  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/duck.jpg',
    creator: { name: 'Syed' },
  });

  post
    .save()
    .then(result => { // then is a Promise like object
      console.log(result); // created post in db
      // Create a post in db
      res.status(201).json({
        message: 'Post created successfully',
        post: result
      });
    })
    .catch(err => console.log(err));


};