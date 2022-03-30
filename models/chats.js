const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    user1:String,
    user2: String,
    messagehistory: {type:Array, default: [] },
    author: String
})
module.exports = mongoose.model('chats', userSchema);
