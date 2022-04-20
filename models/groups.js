const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    creator: String,
    users: Array,
    title: String,
    desc: {type :String, default: 'Отсутствует'}, 
    date: String,
    id: String,
    groupicon: String,
    chat: Array
})
module.exports = mongoose.model('groups', userSchema);