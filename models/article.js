var mongoose = require("mongoose");

var ArticleSchema = new mongoose.Schema({
    nanoId : String,
    referenceId : {
        type : mongoose.Schema.Types.ObjectId
    },
    postType : String, //To store News or Reviews
    image : {
      src : String,
      alt : String,
      credit : String
   },
    title : String,
    body : String,
    rating : String,
    intro : String,
    author : String,
    date: String,
    featured : String,
    tags: [String],
    titleURL : String,
        created : {type : Date, default : Date.now()}
});

module.exports = mongoose.model("Article", ArticleSchema);





