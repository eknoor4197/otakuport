var mongoose = require("mongoose");
var generate = require("nanoid/generate");
var alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

//SCHEMA SETUP
var reviewSchema = new mongoose.Schema({
   nanoId: {
      type: String,
      default : () => generate(alphabet,8)
   },
        title : String,
   intro : String,
   image : {
      src: String,
      alt : String,
      credit : String
   },
   body : String,
   rating : String,
   author : {
      id : {
         type : mongoose.Schema.Types.ObjectId,
         ref : "User"
      },
      username : String,
      profilePic : String,
      bio : String
   },
   featured : String,
   tags: [String],
   date : String,
   titleURL : String,
        created : {type : Date, default : Date.now()},
        comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment" //name of the model
      }
   ]
})

module.exports = mongoose.model("review", reviewSchema);



