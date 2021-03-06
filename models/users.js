const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
	login: String,
	username:String,
	password: String,
	Roles: {type: String, default: 'USER'},
	user_id: String,
	about: {type: String, default: 'Отсутствует'},
	secret_id: String,
	color: Array,
	dateRegist: {type: Date, default: Date.now()},
	alreadyLiked: Array,
	newchats: Array,
	image_url: {type: String, default: 'https://images-ext-1.discordapp.net/external/5bGWfr6UHbV89H_FJ-GvXmk-OzxRUpYsAwmpo_ZzdRg/https/www.imgonline.com.ua/examples/bee-on-daisy.jpg?width=1035&height=677'}
})
module.exports = mongoose.model('usersSite', userSchema);
