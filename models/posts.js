const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  creator: {
    type: Object,
    required: true
  }
},
  { timestamps: true } // created at and updated at auto keys
);

// We don't export schema but a model based on that schema
// Post collection will be created on MongoDB server 
module.exports = mongoose.model('Post', postSchema);
