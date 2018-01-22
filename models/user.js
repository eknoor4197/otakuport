var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var validator = require('validator');
var bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	profilePic : String,
	bio : String
})
 
// validator.isEmail('foo@bar.com');

// var UserSchema = new mongoose.Schema({
// 	oauthID: Number,
// 	username : String,
// 	email : {
// 		type : String,
// 		required : true,
// 		trim : true,
// 		minlength : 1,
// 		unique : true,
// 		validate : {
// 			validator : validator.isEmail,
//             message : '{VALUE} is not a valid email!'
// 		}
// 	},
// 	password  : {
// 		type : String,
// 		required : true,
// 		minlength : 6,
// 	},	
// 	tokens : [{
// 		access : {
// 			type : String,
// 			required : true
// 		},
// 		token : {
// 			type : String,
// 			required : true
// 		}
// 	}]
// });

UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", UserSchema);

// UserSchema.pre('save', function(next) {
// 	var user = this;
// 	if(!user.isModified('password')) return next();
// 	bcrypt.hash(user.password,10).then(function(hashedPassword) {
// 		user.password = hashedPassword
// 		next();
// 	}, function(err) {
// 		return next(err);
// 	})
// })

// UserSchema.methods.comparePassword = function(candidatePassword,next) {
// 	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
// 		if(err) return next(err);
// 		next(null, isMatch)
// 	})
// }