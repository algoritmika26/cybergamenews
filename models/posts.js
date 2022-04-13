const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  
  short_desc: String,
  
  date: String,

  datg: {
    type: Date,
    default: Date.now()
  },

  photo_url:{type: String},

  type:String,

  author_sid: String,

  id: String,

  photo2: String, 
  
  comments: Array
})

module.exports = mongoose.model('posts', postSchema)