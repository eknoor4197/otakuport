var mongoose = require("mongoose");

//SCHEMA SETUP
var reviewSchema = new mongoose.Schema({
	title : String,
   intro : String,
   image : String,
   imageCredit : String,
   body : String,
   author : {
   id : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
      },
   username : String
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

