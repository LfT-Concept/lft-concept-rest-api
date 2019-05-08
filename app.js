const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const compression = require('compression');

const feedRoutes = require('./routes/feed');

const app = express();

// File upload using multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || 
  file.mimetype === 'image/jpg' || 
  file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Load env config
require('dotenv').config();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded </form>
app.use(bodyParser.json()); // Content-Type: application/json
// Compress responses - This module adds a res.flush() method to force the partially-compressed response to be flushed to the client eg. with websockets / server-sent events.
app.use(compression({filter: (req, res) => {
  if (req.headers['x-no-compression']) { return false; }
  else { return compression.filter(req, res) }
}}));
// File upload using multer
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

// General error handling middleware
// It will be called when an error is thrown or when next(err) is invoked
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message;
  res.status(error.statusCode).json({ message: message });
});

app.use('/', (req, res, next) => {
  res.status(200).send("<h1>Lft Concept REST API</h1>").end();
});

mongoose
  .connect(process.env.MONGODB_CONN_STR)
  .then(result => {
    app.listen(process.env.PORT || 8080);
  })
  .catch(err => console.log(err));