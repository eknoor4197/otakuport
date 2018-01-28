var mongoose = require("mongoose");

var ArticleSchema = new mongoose.Schema({
    referenceId : {
        type : mongoose.Schema.Types.ObjectId
    },
    postType : String, //To store News or Reviews
    image : String,
    title : String,
    body : String,
    rating : String,
    imageCredit : String,
    intro : String,
    author : String,
    date: String,
    featured : String,
    tags: [String],
    titleURL : String,
	created : {type : Date, default : Date.now()}
});

module.exports = mongoose.model("Article", ArticleSchema);