const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
	username: String,
	password: String,
	Roles: {type: String, default: 'USER'},
	user_id: String,
	secret_id: String,
	dateRegist: {type: Date, default: Date.now()},
});
module.exports = mongoose.model('usersSite', userSchema);
