var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');//This is required for running postman
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var secret = require('./config/secret');
var User = require('./models/user');
var Category = require('./models/category');

var cartLength = require('./middlewares/middlewares');


var app = express();

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);



mongoose.connect(secret.database,function(err){
	if(err){
		console.log(err);
	}
	else
	{
	   console.log('connected to the database');	
	}
});

//Middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json()); /*this is for useing postman ext4esntion in chrome*/
app.use(bodyParser.urlencoded({ extended: true })); /*this is for useing postman ext4esntion in chrome*/

app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.database, autoReconnect: true})
}));
app.use(flash());

app.use(passport.initialize()); //location to write these lines matters
app.use(passport.session());
app.use(function(req,res,next){
   res.locals.user = req.user;
   next();
});

app.use(cartLength);

app.use(function(req,res,next){
  Category.find({}, function(err,categories){
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

app.use('ejs',engine);
app.set('view engine','ejs');


var mainRoutes   = require('./routes/main');
var userRoutes   = require('./routes/user');
var adminRoutes  = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);





app.listen(secret.port, function(err) {
  if (err) throw err;
  console.log("Server is Running on port:" + secret.port);
});

