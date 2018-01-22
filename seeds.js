var mongoose = require("mongoose");
var Blogdemo = require("./models/blogdemo");
var Comment = require("./models/comment");

var data = [
	{
	 title :"Tokyo Ghoul", 
     image : "http://s1.picswalls.com/wallpapers/2015/11/22/tokyo-ghoul-background_095916173_290.jpg",
     body : "Tokyo Ghoul (Japanese: 東京喰種トーキョーグール Hepburn: Tōkyō Gūru?) is a Japanese dark fantasy manga series by Sui Ishida. It was serialized in Shueisha's seinen manga magazine Weekly Young Jump between September 2011 and September 2014 and has been collected in fourteen tankōbon volumes as of August 2014. A sequel titled Tokyo Ghoul:re began serialization in the same magazine in October 2014 and a prequel titled Tokyo Ghoul Jack ran online on Jump Live."
     },

     {
	 title :"One Punch Man", 
     image : "http://bentobyte.co/wp-content/uploads/2015/10/VXWafGv.jpg?x99393",
     body : "One Punch Man (Japanese: 東京喰種トーキョーグール Hepburn: Tōkyō Gūru?) is a Japanese dark fantasy manga series by Sui Ishida. It was serialized in Shueisha's seinen manga magazine Weekly Young Jump between September 2011 and September 2014 and has been collected in fourteen tankōbon volumes as of August 2014. A sequel titled Tokyo Ghoul:re began serialization in the same magazine in October 2014 and a prequel titled Tokyo Ghoul Jack ran online on Jump Live."
     },

     {
	 title :"Naruto Shippuden", 
     image : "http://wallpapercave.com/wp/wc1257630.jpg",
     body : "Naruto Shippuden (Japanese: 東京喰種トーキョーグール Hepburn: Tōkyō Gūru?) is a Japanese dark fantasy manga series by Sui Ishida. It was serialized in Shueisha's seinen manga magazine Weekly Young Jump between September 2011 and September 2014 and has been collected in fourteen tankōbon volumes as of August 2014. A sequel titled Tokyo Ghoul:re began serialization in the same magazine in October 2014 and a prequel titled Tokyo Ghoul Jack ran online on Jump Live."
     }
];

function seedDB(){
   //Remove all campgrounds
   Blogdemo.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("Removed blogs!");
         //add a few campgrounds
        data.forEach(function(seed){
            Blogdemo.create(seed, function(err, blog){
                if(err){
                    console.log(err)
                } else {
                    console.log("Added a blog");
                    //create a comment
                    Comment.create(
                        {
                            text: "Awesome post!",
                            author: "Hodor"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                blog.comments.push(comment);
                                blog.save();
                                console.log("Created new comment");
                            }
                        });
                }
            });
        });
    }); 
    //add a few comments
}

module.exports = seedDB;