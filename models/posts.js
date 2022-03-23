const mongoose = require('mongoose');
const postsSchema = mongoose.Schema({
	title: String,
	text: String,
});
module.exports = mongoose.model('posts', postsSchema);
