var mongoose = require("mongoose");

//SCHEMA SETUP
var imageSchema = new mongoose.Schema({
	   referenceId : {
        	type : mongoose.Schema.Types.ObjectId
       },	
	   title : String,
	   nanoId : String,
	   image : {
	   	src : String,
   	   	alt : String,
   	   	credit : String	
	   },
	   tags : [String],
   	   date : String,
	   created : {type : Date, default : Date.now()},

})

module.exports = mongoose.model("image", imageSchema);

