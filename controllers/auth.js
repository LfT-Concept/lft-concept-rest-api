const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });

    const savedUser = await user.save();
    res.status(201).json({ message: 'User created!', userId: savedUser._id });

  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error(`User not found with email ${email}`)
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({
      email: user.email,
      userId: user._id.toString()
    },
      process.env.SECRET_PRIVATE_KEY,
      { expiresIn: '1h' });
    res.status(200).json({ token: token, userId: user._id.toString() });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};