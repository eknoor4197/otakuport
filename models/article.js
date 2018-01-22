var mongoose = require("mongoose");

var latestSchema = new mongoose.Schema({
    referenceId : {
        type : mongoose.Schema.Types.ObjectId
    },
    postType : String, //To store News or Reviews
    image : String,
    title : String,
    body : String,
    rating : String,
    imageSource : String,
    intro : String,
    author : String,
    date: String,
    featured : String,
    titleURL : String,
	created : {type : Date, default : Date.now()}
});

module.exports = mongoose.model("Article", latestSchema);