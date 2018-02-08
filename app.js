var express = require("express");
var expressSanitizer = require("express-sanitizer");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var path = require("path");
var multer = require("multer");

var generate = require("nanoid/generate");
var alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

var fs = require('fs');
var passport = require("passport");
var localStrategy = require("passport-local");
var FacebookStrategy = require('passport-facebook').Strategy;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


var marked = require('marked');

var moment = require("moment");
var now  = moment();
var currentDateTime = new moment();

var methodOverride = require("method-override");

var Blog = require("./models/blog");
var User = require("./models/user");
var Review = require("./models/review");
var Revisited = require("./models/revisited");
var News = require("./models/news");
var Article = require("./models/article");
var Comment = require("./models/comment");
var config = require('./oauth.js');

var Image = require("./models/image");

//PASSPORT CONFIG
app.use(require("express-session")({
	secret : "Once again Rusty wins",
	resave : false,
	saveUninitialized :false
}));

app.use(passport.initialize());
app.use(passport.session());

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// config
passport.use(new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.facebook.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

// //local
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/otakuport");

// app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

app.use(function(req,res,next) {
	fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	res.locals.currentUser = req.user;
	// console.log(req.user);
	// console.log("=============");
	// console.log(res.locals.currentUser);
	res.locals.fullUrl = fullUrl;
	next();
})

var storage = multer.diskStorage({
	destination : "./public/uploads",
	filename : function(req,file,cb) {
		cb(null,file.fieldname + "-" + "-" + Date.now() + path.extname(file.originalname));
	}
})

var upload = multer({
	storage : storage
}).single("OtakuPort");

//IMAGE UPLOAD API
app.get("/api", function(req,res) {
        res.render("imageUpload", {title: "OtakuPort - The Base of Anime Culture", imageName : "File name", meta_desc : "OtakuPort Image API" });
})

app.post("/api", function (req,res) {
        upload(req,res,(err) => {
                    if (err) {
                        res.render("imageUpload", {
                                msg : err
                        });
                    } else {
                        console.log(req.file);
                        var imgDate = Date.now();
                        var d = generate(alphabet,8);
                        fs.rename("./public/uploads/" + req.file.filename, "./public/uploads/" + req.body.name + "-" +  d + path.extname(req.file.originalname), function(err) {
                                if(err) {
                                        console.log(err);
                                }
                                else {
                                        console.log("Renamed completely");
                                        console.log("File uploaded successfully!");
                                        console.log(req.file.filename);
                                        console.log(req.body.name);
                                        res.render("imageUpload", {title: "OtakuPort - The Base of Anime Culture", meta_desc : "OtakuPort - The Base of Anime Culture" , imageName : req.body.name + "-" +  d + path.extname(req.file.originalname)})
                                }
                        })
                    }
        })
})



//LANDING PAGE
app.get('/', function (req, res,next) {
  Article.find({}).sort([['_id', -1]]).limit(5).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.latest = allArticle
			res.locals.title = "OtakuPort | The Base of Anime Culture";
            res.locals.meta_desc = "OtakuPort is your one stop for anime culture. We strive to provide you the hottest and the latest in the anime world. We cover anime news, opinions, reviews and revisit your favourite anime series. Our audience ranges from 15 - 49 and are hardcore anime fans. Our team of influential and expert writers provide in-depth reviews/opinions about your favourite anime.";

            next();
		}
	})
}, function(req,res,next) {
  Blog.find({featured : "no"}).sort([['_id', -1]]).limit(6).exec(function(err,allBlogs) { //finds the latest blog posts (upto 6)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.blog = allBlogs;
			next();
			}
	})
},function(req,res,next) {
  Blog.find({featured : "yes"}).sort([['_id', -1]]).limit(1).exec(function(err,featuredBlogs) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.featuredBlogs = featuredBlogs;
			next();
		}

	})
},function (req, res,next) {
  Review.find({featured : "no"}).sort([['_id', -1]]).limit(6).exec(function(err,allReviews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.review = allReviews;
					next();
				}	
	})
},function (req, res,next) {
  Review.find({featured : "yes"}).sort([['_id', -1]]).limit(1).exec(function(err,featuredReviews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.featuredReviews = featuredReviews;
					next();
				}	
	})
},function (req, res,next) {
  News.find({featured : "no"}).sort([['_id', -1]]).limit(4).exec(function(err,allNews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.news = allNews;
					next();
				}	
	})
},function (req, res,next) {
  News.find({featured : "yes"}).sort([['_id', -1]]).limit(2).exec(function(err,featuredNews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.featuredNews = featuredNews;
					next();
				}	
	})
},function (req, res,next) {
  News.find({featured : "no"}).sort([['_id', -1]]).limit(6).exec(function(err,allNews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.allNews = allNews;
					next();
				}	
	})
},function (req, res) {
  Revisited.find({}).sort([['_id', -1]]).limit(6).exec(function(err,allRevisited) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.revisited = allRevisited;
					res.render("landing", res.locals);
				}	
	})
})

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){});
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
});

// ================
// BLOG
// ================

// BLOG PAGE
app.get("/blog", function(req,res) {
	// console.log(moment().format("MMM Do YYY"));
	Blog.find({}).sort([['_id', -1]]).exec(function(err,allBlogs) {
		if(err) {
			console.log(err);
		} else {
			res.render("blog", {blog : allBlogs, moment : now, title:'Blog | OtakuPort', meta_desc : "OtakuPort Blog offers you detailed analysis of the latest episodes of the trending anime shows." });
		}
	})
})

//NEW BLOG - FORM
app.get("/blog/new", isLoggedIn, function(req,res) {
	res.render("newBlog", { title : "New Blog | OtakuPort", meta_desc : "New Blog"} );
})


//NEW BLOG - CREATE
app.post("/blog", isLoggedIn, function(req,res) {
        // req.body.blog.body = req.sanitize(req.body.blog.body);

        req.body.blog.tags = req.body.blog.tags.split(",");

         var newlyCreated = req.body.blog;
        // newlyCreated.author = req.user;
        newlyCreated.author = {
                id : req.user._id,
        username : req.user.username,
        profilePic : req.user.profilePic,
        bio : req.user.bio
        }
        // var articleAuthor = newlyCreated.author.username;

    Blog.create(newlyCreated,function(err,newBlog) {

                if(err) {
                        res.render("newBlog");
                } else {
                Article.create({
                        referenceId : newBlog._id,
                        nanoId : newBlog.nanoId,
                        postType : "blog",
                        title : newBlog.title,
                        intro : newBlog.intro,
                        image : newBlog.image,
                        body : newBlog.body,
                        featured : newBlog.featured,
                        tags : newBlog.tags,
                        date : newBlog.date,
                        titleURL : newBlog.titleURL,
                        author : newBlog.author.username,
                        created : newBlog.created
                });
                Image.create({
                        referenceId : newBlog._id,
                        nanoId : newBlog.nanoId,
                        title : newBlog.title,
                        image : newBlog.image,
                        tags : newBlog.tags,
                        date : newBlog.date,
                        created : newBlog.created
                });
                res.redirect("/blog"); //success response

                }
        })
})



// PARTICULAR BLOG
app.get("/blog/:id/:titleURL", function(req,res,next) {
	Blog.findById(req.params.id,function(err,foundBlog) {
		if(err) {
			// next();
			res.redirect("/blog");
			next();
		} else {
			// next();
		  res.locals.blog = foundBlog;
          res.locals.title = foundBlog.title + " | OtakuPort";
          res.locals.meta_desc = foundBlog.body.split('. ',10);
		  res.locals.blog.body = marked( foundBlog.body );
		  next();
		}
	})

},function(req,res,next) {
    Article.find({postType : "news"}).sort([['_id', -1]]).limit(5).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
		if(err) {
			next();
			console.log(err);
		} else {
			next();
			res.locals.trending = allArticle;
		}
	})

 },function(req,res) {
    Article.find({postType:"review"}).sort([['_id', -1]]).limit(6).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.more = allArticle;
			res.render("showBlog", res.locals);
		}
	})
 }
)

//EDIT BLOG - FORM
app.get("/blog/:id/:titleURL/edit", function(req,res) {
	  if(req.isAuthenticated()) {

	  	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blog");
		} else {
			// console.log(foundBlog.author);
			// console.log(req.user.username);
			if( (req.user.username == "Eknoorpreet Singh") || (foundBlog.author.username == req.user.username) ) {
				res.render("editBlog", {blog : foundBlog, title: "Edit Blog", meta_desc : "Edit Blog"});
			} else {
				res.send( "YOU DO NOT HAVE PERMISSION TO DO THAT!");
			}
		}
	})

	  } else {
	  	res.send("YOU NEED TO BE LOGGED IN TO DO THAT!");
	  }
	
})

//UPDATE BLOG
app.put("/blog/:id/:titleURL", function(req,res) {
        // req.body.blog.body = req.sanitize(req.body.blog.body);
        // var id = req.params.id;
        Blog.findByIdAndUpdate(req.params.id, req.body.blog,{new: true}, function(err,updatedBlog) {
                if(err) {
                        res.redirect("/blog");
                } else {
                        Article.findOne({referenceId : req.params.id}, function(err,updatedArticle) {
                                if(!err) {
                                  // console.log(updatedBlog);
                                  	updatedArticle.referenceId = updatedBlog._id;
                                  	updatedArticle.nanoId = updatedBlog.nanoId;
                          			updatedArticle.postType = "blog";
                          			updatedArticle.image = updatedBlog.image;
                          			updatedArticle.title = updatedBlog.title;
                          			updatedArticle.body = updatedBlog.body;
                          			updatedArticle.intro = updatedBlog.intro;
                          			updatedArticle.tags = updatedBlog.tags;
                                  	updatedArticle.author = updatedBlog.author.username;
                                  	updatedArticle.date = updatedBlog.date;
                      				updatedArticle.created = updatedBlog.created;
                      				updatedArticle.featured = updatedBlog.featured;
                      				updatedArticle.titleURL = updatedBlog.titleURL;
                      				updatedArticle.save();
                                }
                        })

                        Image.findOne({referenceId : req.params.id}, function(err,updatedImage) {
                                if(!err) {
                                  	updatedImage.referenceId = updatedBlog._id;
                                  	updatedImage.nanoId = updatedBlog.nanoId;
                          			updatedImage.image = updatedBlog.image;
                          			updatedImage.title = updatedBlog.title;
                          			updatedImage.tags = updatedBlog.tags;
                                  	updatedImage.date = updatedBlog.date;
                      				updatedImage.created = updatedBlog.created;
                      				updatedImage.save();
                                }
                        })
                        res.redirect("/blog/" + req.params.id + "/" + req.params.titleURL);
                }
        })
})


//DELETE BLOG
app.delete("/blog/:id/:titleURL", function(req,res) {
	Blog.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/blog");
		} else {
			Article.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/blog");
				}
			})
		}
	})
})

// =================
// REVIEW 
// =================

// REVIEW PAGE
app.get("/review" , function(req,res) {
	Review.find({}).sort([['_id', -1]]).exec(function(err,allReviews) {
		if(err) {
			console.log(err);
		} else {
			res.render("review", {review : allReviews, title : "Reviews | OtakuPort", meta_desc  : "OtakuPort reviews the trending anime in the industry. Our anime reviews consist of not only the in-depth analysis of the show, but also the fans' opinions of the same."});
		}
	})
})

//NEW REVIEW - FORM
app.get("/review/new", isLoggedIn, function(req,res) {
        res.render("newReview", { title : "New Review | OtakuPort", meta_desc  : "New review" });
})

//NEW REVIEW - CREATE
app.post("/review", isLoggedIn, function(req,res) {

        req.body.review.tags = req.body.review.tags.split(",");

        var newlyCreated = req.body.review;
        // newlyCreated.author = req.user;
        newlyCreated.author = {
        	id : req.user._id,
        	username : req.user.username,
        	profilePic : req.user.profilePic,
        	bio : req.user.bio
        }
        // var articleAuthor = newlyCreated.author.username;

        Review.create(newlyCreated, function(err,newReview) {
                if(err) {
                        res.render("newReview");
                } else {
                        Article.create({
                        referenceId : newReview._id,
                        nanoId : newReview.nanoId,
                        postType : "review",
                        title : newReview.title,
                        intro : newReview.intro,
                        image : newReview.image,
                        body : newReview.body,
                        rating : newReview.rating,
                        featured : newReview.featured,
                        tags : newReview.tags,
                        date : newReview.date,
                        titleURL : newReview.titleURL,
                        author : newReview.author.username,
                        created : newReview.created
                });
                Image.create({
                        referenceId : newReview._id,
                        nanoId : newReview.nanoId,
                        title : newReview.title,
                        image : newReview.image,
                        tags : newReview.tags,
                        date : newReview.date,
                        created : newReview.created
                });
                        res.redirect("/review");
                        // console.log(newReview.author);
                }
        })
})


//PARTICULAR REVIEW
app.get("/review/:id/:titleURL", function(req,res,next) {
	Review.findById(req.params.id).populate("comments").exec(function(err,foundReview) {
		if(err) {
			// next();
			res.redirect("/review");
			next();
		} else {
			// next();
		  res.locals.review = foundReview;
          res.locals.title = foundReview.title + " | OtakuPort";
          res.locals.meta_desc = foundReview.body.split('. ',10);
		  res.locals.review.body = marked( foundReview.body );
		  next();
		}
	})

},function(req,res,next) {
    Article.find({postType:"news"}).sort([['_id', -1]]).limit(5).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.trending = allArticle;
			next();
		}
	})
},function(req,res) {
    Article.find({postType:"blog"}).sort([['_id', -1]]).limit(6).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.more = allArticle;
			res.render("showReview", res.locals);
		}
	})
 }
)

//EDIT REVIEW
app.get("/review/:id/:titleURL/edit", function(req,res) {

	if(req.isAuthenticated()) {

	  	Review.findById(req.params.id, function(err, foundReview) {
		if(err) {
			res.redirect("/review");
		} else {
			// console.log(foundReview.author);
			// console.log(req.user.username);
			if( (req.user.username == "Eknoorpreet Singh") || (foundReview.author.username == req.user.username) ) {
				res.render("editReview", {review : foundReview, title: "Edit Review", meta_desc : "Edit Review"});
			} else {
				res.send( "YOU DO NOT HAVE PERMISSION TO DO THAT!");
			}
		}
	})

	  } else {
	  	res.send("YOU NEED TO BE LOGGED IN TO DO THAT!");
	  }
})	  

//UPDATE REVIEW
app.put("/review/:id/:titleURL", function(req,res) {
        // req.body.review.body = req.sanitize(req.body.review.body);
        Review.findByIdAndUpdate(req.params.id, req.body.review,{new: true}, function(err,updatedReview) {
                if(err) {
                        res.redirect("/review");
                } else {
                        Article.findOne({referenceId : req.params.id}, function(err,updatedArticle) {
                                if(!err) {
                                	updatedArticle.referenceId = updatedReview._id;
                                	updatedArticle.nanoId = updatedReview.nanoId;
                        			updatedArticle.postType = "review";
                        			updatedArticle.image = updatedReview.image;
                        			updatedArticle.title = updatedReview.title;
                        			updatedArticle.body = updatedReview.body;
                        			updatedArticle.intro = updatedReview.intro;
                        			updatedArticle.tags = updatedReview.tags;
                                	updatedArticle.author = updatedReview.author;
                                	updatedArticle.date = updatedReview.date;
                        			updatedArticle.rating = updatedReview.rating;
                    				updatedArticle.created = updatedReview.created;
                    				updatedArticle.featured = updatedReview.featured;
                    				updatedArticle.save();
                                }
                        })
                        Image.findOne({referenceId : req.params.id}, function(err,updatedImage) {
                                if(!err) {
                                  	updatedImage.referenceId = updatedReview._id;
                                  	updatedImage.nanoId = updatedReview.nanoId;
			                        updatedImage.image = updatedReview.image;
			                        updatedImage.title = updatedReview.title;
			                        updatedImage.tags = updatedReview.tags;
                                    updatedImage.date = updatedReview.date;
                      				updatedImage.created = updatedReview.created;
                      				updatedImage.save();
                                }
                        })
                        res.redirect("/review/" + req.params.id + "/" + req.params.titleURL);
                }
        })
})


//DELETE REVIEW
app.delete("/review/:id/:titleURL", function(req,res) {
	Review.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/review");
		} else {
			Article.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/review");
				}
			})
		}
	})
})

// ================
// NEWS
// ================

// NEWS PAGE
app.get("/news", function(req,res) {
	News.find({}).sort([['_id', -1]]).exec(function(err,allNews) {
		if(err) {
			console.log(err);
		} else {
			res.render("news", {news : allNews, moment : now, momentNow : currentDateTime, title : "News | OtakuPort", meta_desc  : "OtakuPort offers you the latest news about your favourite anime. Keep yourself up to date with the anime community by subscribing to OtakuPort - The Base of Anime Culture."});
		}
	})
})

//NEW NEWS - FORM
app.get("/news/new", isLoggedIn , function(req,res) {
        res.render("newNews" , { title : "New News | OtakuPort", meta_desc : "New News" });
})

//NEW NEWS - CREATE
app.post("/news",isLoggedIn, function(req,res) {

        req.body.news.tags = req.body.news.tags.split(",");

        var newlyCreated = req.body.news;
        // newlyCreated.author = req.user;
        newlyCreated.author = {
                id : req.user._id,
		        username : req.user.username,
		        profilePic : req.user.profilePic,
		        bio : req.user.bio
        }
        // var articleAuthor = newlyCreated.author.username;

        News.create(newlyCreated,function(err,newNews) {
                if(err) {
                        res.render("newNews");
                } else {
                Article.create({
                        referenceId : newNews._id,
                        nanoId : newNews.nanoId,
                        postType : "news",
                        title : newNews.title,
                        intro : newNews.intro,
                        image : newNews.image,
                        body : newNews.body,
                        featured : newNews.featured,
                        tags : newNews.tags,
                        date : newNews.date,
                        titleURL : newNews.titleURL,
                        author : newNews.author.username,
                        created : newNews.created
                });
                Image.create({
                        referenceId : newNews._id,
                        nanoId : newNews.nanoId,
                        title : newNews.title,
                        image : newNews.image,
                        tags : newNews.tags,
                        date : newNews.date,
                        created : newNews.created
                });
                res.redirect("/news"); //success response
                }
        })
})


//PARTICULAR NEWS PAGE
app.get("/news/:id/:titleURL", function(req,res,next) {
	News.findById(req.params.id).populate("comments").exec(function(err,foundNews) {
		if(err) {
			next();
			res.redirect("/news");
		} else {
			next();
			res.locals.news = foundNews;
			res.locals.title = foundNews.title + " | OtakuPort";
			res.locals.meta_desc = foundNews.body.split('. ',10);
			res.locals.news.body = marked( foundNews.body );
		}
	})
},function(req,res,next) {
    Article.find({postType: "news"}).sort([['_id', -1]]).limit(5).exec(function(err,allArticle) { //finds the latest blog posts (upto 3) postType:"news"
		if(err) {
			console.log(err);
			next();
		} else {
			next();
			res.locals.trending = allArticle;
			// res.render("showNews", res.locals);
		}
	})
 },function(req,res) {
    Article.find({postType:"review"}).sort([['_id', -1]]).limit(6).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.more = allArticle;
			res.render("showNews", res.locals);
		}
	})
 }
)

//EDIT NEWS - FORM
app.get("/news/:id/:titleURL/edit", function(req,res) {

        if(req.isAuthenticated()) {

                News.findById(req.params.id, function(err, foundNews) {
                if(err) {
                        res.redirect("/news");
                } else {
                        // console.log(foundNews.author);
                        // console.log(req.user.username);
                        if( (req.user.username == "Eknoorpreet Singh") || (foundNews.author.username == req.user.username) ) {
                                res.render("editNews", {news : foundNews, title: "Edit News", meta_desc : "Edit News"});
                        } else {
                                res.send( "YOU DO NOT HAVE PERMISSION TO DO THAT!");
                        }
                }
        })

          } else {
                res.send("YOU NEED TO BE LOGGED IN TO DO THAT!");
          }
})

//UPDATE NEWS
app.put("/news/:id/:titleURL", function(req,res) {
        // req.body.news.body = req.sanitize(req.body.news.body);
        var id = req.params.id;
        News.findByIdAndUpdate(req.params.id, req.body.news,{new: true}, function(err,updatedNews) {
                if(err) {
                        res.redirect("/news");
                } else {
                        Article.findOne({referenceId : req.params.id}, function(err,updatedArticle) {
                                if(!err) {
                                // console.log(updatedNews);
	                                updatedArticle.referenceId = updatedNews._id;
	                                updatedArticle.nanoId = updatedNews.nanoId;
			                        updatedArticle.postType = "news";
			                        updatedArticle.image = updatedNews.image;
			                        updatedArticle.title = updatedNews.title;
			                        updatedArticle.body = updatedNews.body;
			                        updatedArticle.intro = updatedNews.intro;
			                        updatedArticle.tags = updatedNews.tags;
	                                updatedArticle.author = updatedNews.author;
	                                updatedArticle.date = updatedNews.date;
				                    updatedArticle.created = updatedNews.created;
				                    updatedArticle.featured = updatedNews.featured;
				                    updatedArticle.titleURL = updatedNews.titleURL;
				                    updatedArticle.save();
                                }
                        })
                        Image.findOne({referenceId : req.params.id}, function(err,updatedImage) {
                                if(!err) {
	                                updatedImage.referenceId = updatedNews._id;
	                                updatedImage.nanoId = updatedNews.nanoId;
			                        updatedImage.image = updatedNews.image;
			                        updatedImage.title = updatedNews.title;
			                        updatedImage.tags = updatedNews.tags;
	                                updatedImage.date = updatedNews.date;
				                    updatedImage.created = updatedNews.created;
				                    updatedImage.save();
                                }
                        })
                        res.redirect("/news/" + req.params.id + "/" + req.params.titleURL);
                }
        })
})


//DELETE NEWS
app.delete("/news/:id/:titleURL", function(req,res) {
	News.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/news");
		} else {
			Article.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/news");
				}
			})
		}
	})
})

// ============
//REVISITED
// ============

// REVISITED PAGE
app.get("/revisited", function(req,res) {
	Revisited.find({}).sort([['_id', -1]]).exec(function(err,allRevisited) {
		if(err) {
			console.log(err);
		} else {
			res.render("revisited", {revisited : allRevisited, title : "Revisited | OtakuPort"});
		}
	})
})

// NEW REVISITED - FORM
app.get("/revisited/new", isLoggedIn, function(req,res) {
	res.render("newRevisited" , { title : "New Revisited" });
})

// NEW REVISITED - POST
app.post("/revisited",isLoggedIn, function(req,res) {
	// req.body.blog.body = req.sanitize(req.body.blog.body);

	req.body.revisited.tags = req.body.revisited.tags.split(",");

	var newlyCreated = req.body.revisited;
	// newlyCreated.author = req.user;
   	newlyCreated.author = {
   		id : req.user._id,
    	username : req.user.username
   	}
   	// var articleAuthor = newlyCreated.author.username;

	Revisited.create(req.body.revisited,function(err,newRevisited) {
		if(err) {
			res.render("newRevisited");
		} else {
	        Article.create({
	        	referenceId : newRevisited._id,
	        	postType : "revisited",
	        	title : newRevisited.title,
	        	intro : newRevisited.intro,
	        	image : newRevisited.image,
	        	imageCredit : newRevisited.imageCredit,
	        	body : newRevisited.body,
	        	featured : newRevisited.featured,
	        	tags : newRevisited.tags,
	        	date : newRevisited.date,
	        	titleURL : newRevisited.titleURL,
	        	author : newRevisited.author.username,
	        	created : newRevisited.created

	        });
	        res.redirect("/revisited"); //success response 
		}
	})
})

// PARTICULAR REVISITED PAGE
app.get("/revisited/:id/:titleURL", function(req,res,next) {
	Revisited.findById(req.params.id).populate("comments").exec(function(err,foundRevisited) {
		if(err) {
			// next();
			res.redirect("/revisited");
			next();
		} else {
			// next();
		  res.locals.revisited = foundRevisited;
		   res.locals.title = foundRevisited.title + " | OtakuPort";
		  res.locals.revisited.body = marked( foundRevisited.body );
		  next();
		}
	})
},function(req,res) {
    Article.find({}).sort([['_id', -1]]).limit(3).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.article = allArticle;
			res.render("showRevisited", res.locals);
		}
	})
 }
)

//EDIT REVISITED - FORM
app.get("/revisited/:id/:titleURL/edit", function(req,res) {
	  if(req.isAuthenticated()) {
	  	Revisited.findById(req.params.id, function(err, foundRevisited) {
		if(err) {
			res.redirect("/revisited");
		} else {
			// console.log(foundRevisited.author);
			// console.log(req.user.username);
			if( (req.user.username == "Eknoorpreet Singh") || (foundRevisited.author == req.user.username) ) {
				res.render("editRevisited", {revisited : foundRevisited , title : "Edit Revisited" });
			} else {
				res.send( "YOU DO NOT HAVE PERMISSION TO DO THAT!");
			}
		}
	})
	  } else {
	  	res.send("YOU NEED TO BE LOGGED IN TO DO THAT!");
	  }
	
})

//UPDATE REVISITED
app.put("/revisited/:id/:titleURL", function(req,res) {
	// req.body.revisited.body = req.sanitize(req.body.blog.body);
	// var id = req.params.id;
	Revisited.findByIdAndUpdate(req.params.id, req.body.revisited,{new: true}, function(err,updatedRevisited) {
		if(err) {
			res.redirect("/revisited");
		} else {
			Article.findOne({referenceId : req.params.id}, function(err,updatedArticle) {
				if(!err) {
				  updatedArticle.referenceId = updatedRevisited._id;
	        	  updatedArticle.postType = "blog";
	        	  updatedArticle.image = updatedRevisited.image;
	        	  updatedArticle.title = updatedRevisited.title;
	        	  updatedArticle.body = updatedRevisited.body;
	        	  updatedArticle.intro = updatedRevisited.intro;
				  updatedArticle.author = updatedRevisited.author;
				  updatedArticle.date = updatedRevisited.date;
	              updatedArticle.created = updatedRevisited.created;
	              updatedArticle.featured = updatedRevisited.featured;
	              updatedArticle.titleURL = updatedRevisited.titleURL;
	              updatedArticle.save(); 
				} 
			})
			res.redirect("/revisited/" + req.params.id + "/" + req.params.titleURL);
		}
	})
})

//DELETE REVISITED
app.delete("/revisited/:id/:titleURL", function(req,res) {
	Revisited.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/blog");
		} else {
			Article.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/revisited");
				}
			})
		}
	})
})

//AUTH ROUTES
app.get("/register", function(req,res) {
	res.locals.title = "OtakuPort";
	res.locals.meta_desc = "Register on OtakuPort - The Base of Anime Culture";
	res.render("register",res.locals);
});

app.post("/register", function(req,res) {
	var newUser = new User({username : req.body.username, profilePic : req.body.profilePic, bio : req.body.bio});
	// var newUser = new User({username : req.body.username}); 
	User.register(newUser, req.body.password, function(err,user) {
		if(err) {
			console.log(err);
			return res.render("register");
		} else {
			passport.authenticate("local")(req,res, function() {
				res.redirect("/admin");
			})
		}
	})
})


//LOGIN FORM
app.get("/login", function(req,res) {
	res.locals.title = "OtakuPort";
	res.locals.meta_desc = "Login on OtakuPort - The Base of Anime Culture";
	res.render("login", res.locals);
})

// LOGIN LOGIC
app.post("/login", passport.authenticate("local", {
	successRedirect : "/admin",
    failureRedirect : "/login"
}), function(req,res) {

})

//LOGOUT LOGIC
app.get("/logout", function(req,res) {
	req.logout();
	res.redirect("/");
})

//PARTICULAR AUTHOR
// app.get("/author/:name", function(req,res) {
// 	Article.find({author:req.params.name}).sort([['_id', -1]]).exec(function(err,allArticle) {
// 		if(err) {
// 			console.log(err);
// 		} else {
// 			User.find({username : req.params.name},(function(err,user) {
// 				if(err) {
// 					console.log(err);
// 				} else {
// 					console.log(user);
// 					console.log(user[0]["username"]);
// 					res.render("showAuthor", { article : allArticle , name : req.params.name, user : user[0], title : req.params.name + " | OtakuPort"});
// 				}
				
// 			})
// 					// res.render("showAuthor", { article : allArticle , name : req.params.name,displayPic : user.profilePic, title : req.params.name + " | OtakuPort"});
// 				)
// 		}
// 	})
// })

app.get("/author/:name", function(req,res,next) {
	Article.find({ author : req.params.name}).sort([['_id', -1]]).exec(function(err,allArticle) {
		if(err) {
			console.log(err);
			next();	
		} else {
			res.locals.article = allArticle;
			next();				
		}
	})
}, function(req,res,next) {
	User.find({username : req.params.name}, function(err,user) {
		if(err) {
			console.log(err);
			next();
		} else {
			// console.log(user);
			// console.log(user[0]["username"]);
			res.locals.name = req.params.name;
			res.locals.user = user[0];
			res.locals.title = req.params.name + " | OtakuPort";
			res.locals.meta_desc = req.params.name + "| OtakuPort - The Base of Anime Culture";
			res.locals.user.bio = marked( user[0].bio );
			res.render("showAuthor", res.locals);

		}
	})
})	

// app.get("/author/:name", function(req,res,next) {
// 	User.find({username : req.params.name}, function(err,user) {
// 		if(err) {
// 			console.log(err);
// 			next();
// 		} else {
// 			console.log(user);
// 			// console.log(user[0]["username"]);
// 			res.locals.name = req.params.name;
// 			res.locals.user = user[0];
// 			res.locals.title = req.params.name + " | OtakuPort";

// 			Article.find({ author : req.params.name}).sort([['_id', -1]]).exec(function(err,allArticle) {
// 				if(err) {
// 					console.log(err);
// 					next();	
// 				} else {
// 					next();
// 					res.locals.article = allArticle;
// 					res.render("showAuthor", res.locals);

// 				}
// 			})
// 		}
// 	})
// })	

// ABOUT
app.get("/about",function(req,res) {
        res.render("about",{title : "About Us | OtakuPort", meta_desc : "OtakuPort is your one stop for anime culture. We strive to provide you the hottest and the latest in the anime community. We cover anime news, opinions, reviews and revisit your favourite anime series. Our audience ranges from 15 - 49 and are hardcore anime fans. Our team of influential and expert writers provide in-depth reviews/opinions about your favourite anime."});
})

// CONTACT
app.get("/contact",function(req,res) {
        res.render("contact",{title : "Contact Us | OtakuPort", meta_desc: "Contact Us | OtakuPort - The Base of Anime Culture"});
})

app.get("/privacy", function(req,res) {
        res.render("tc-privacy-cookie",{title : "Terms & Conditions, Privacy & Cookie Policy", meta_desc : "Terms & Conditions, Privacy & Cookie Policy | OtakuPort - The Base of Anime Culture"})
})

app.get("/admin", isLoggedIn,  function(req,res) {
        // console.log(req.user.username);
        Article.find({author:req.user.username}).sort([['_id', -1]]).exec(function(err,allArticle) { //finds the latest blog posts (upto 3)
                if(err) {
                        console.log(err);
                } else {
                        res.locals.article = allArticle;
                        res.locals.title = "OtakuPort - The Base of Anime Culture";
                        res.locals.meta_desc = "OtakuPort Admin gives access to the writers at OtakuPort to present their work to the anime community."
                        res.render("admin", res.locals);
                }
        })
})

app.post("/blog/:id/comments", function(req,res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
		console.log(err);
	} else {
		Comment.create(req.body.comment, function(err, comment) {
			if(err) {
				console.log(err);
			} else {
				foundBlog.comments.push(comment);
				foundBlog.save();
				res.redirect("/blog/" + foundBlog._id);
			}
		})
	}
	})
	
})

function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()) {
		return next();
	} 
	res.redirect("/login");
}

app.listen(3000,function() {
	console.log("OtakuPort has started!");
});

