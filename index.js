/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

// core vars and node modules
var	gameport	= process.env.PORT || 4004,
	path		= require('path'),
	express		= require('express'),
	session		= require('express-session'),
	UUID		= require('node-uuid'),
	passport	= require('passport'),
	GoogleStrategy	= require('passport-google-oauth').OAuth2Strategy,
	verbose		= false,
	http		= require('http'),
	GoogleProfile	= {},
	databaseURI	= 'localhost:27017/FreeSpirits',
	collections	= [
		'authentications',
		'players',
		// add your MongoDB collections
	];
;

var cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override');

// connect to the db
var mongojs = require('mongojs');
var db = mongojs(databaseURI, collections)
//var db = require('mongojs').connect(databaseURI, collections);

// Import the 'path' module (packaged with Node.js)
//var path = require('path');

// Create a new instance of Express
var app = express();

// Create a simple Express application
	// Turn down the logging activity
	//app.use(express.logger('dev'));

	app.use(cookieParser());
	app.use(bodyParser());
	app.use(session({secret:'changeme'})); // change your session secret
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(methodOverride());
	//app.use(app.router);

	// Serve static html, js, css, and image files from the 'www' directory
	app.use(express.static(path.join(__dirname,'www')));


// routes for google auth and the callback
app.get('/auth/google', passport.authenticate('google',{scope: 'https://www.googleapis.com/auth/plus.login email'}));
app.get('/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/login'
	})
);


/*
app.get('/auth/google', passport.authenticate('google', { scope: ['email profile'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Authenticated successfully
    res.redirect('/');
  });
*/

// routes for login, deny, and logout
app.get('/login', function (req, res) {
	res.sendFile('login.html', { root: __dirname + '/www' });
});

app.get('/deny', function (req, res) {
	res.sendFile('deny.html', { root: __dirname + '/www' });
});

app.get('/logout', function (req, res) {
	req.logOut();
	res.redirect('/');
});

// create the Google passport strategy
passport.use(new GoogleStrategy({
		clientID: 'CLIENT_ID',
		clientSecret: 'CLIENT_SECRET',
		callbackURL: 'http://localhost:4004/auth/google/callback'
	},
	function (accessToken, refreshToken, profile, callback) {
		callback(null, profile);
	}
));

// override passport serialization functions
passport.serializeUser(function(user, callback){
	callback(null, user);
});

passport.deserializeUser(function(user, callback){
	callback(null, user);
});

// the ensureAuthenticated callback function for testing OAuth
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login');
}

// the main route, which ensures an active OAuth session
app.get( '/', ensureAuthenticated, function( req, res ){

	// whitelisted emails
	var approvedEmails = [
		'pheryx@gmail.com',
		'xyreph@gmail.com',
	];

	GoogleProfile = req.user;
	var profileEmail = GoogleProfile.emails[0].value;

	// check for whitelisted email
	if (approvedEmails.indexOf(profileEmail) < 0)
		res.sendFile( 'deny.html' , { root: __dirname + '/www' });
	else
		res.sendFile( 'index.html' , { root: __dirname + '/www' });
});

// wildcard for all other root files like css and images
app.get( '/*' , function( req, res, next ) {

	var file = req.params[0];

	if(verbose) console.log('\t :: Express :: file requested : ' + file);

	res.sendFile( __dirname + '/www/' + file );

});

// Create a Node.js based http server on port 4004
var server = http.createServer(app).listen(gameport);
server.authorization = function (handshakeData, callback) {
	callback(null, true); // error first callback style
};

console.log('\t :: Express :: Listening on port ' + gameport );

// Create a Socket.IO server and attach it to the http server
var io = require('socket.io')(server);

// load the core server functions
var gameServer = require('./game.server');

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.on('connection', function (socket) {
	//console.log('client connected');
	gameServer.playerConnect(db, io, socket, UUID, GoogleProfile);
});

var gameloop = require('node-gameloop'); // require the game loop module
 
// start the loop at 30 fps (1000/30ms per frame) and grab its id 
var frameCount = 0;
var loopId = gameloop.setGameLoop(function(delta) {
	// `delta` is the delta time from the last frame 
	//console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
	gameServer.serverLoop(frameCount++, delta);
}, 1000 / 30);

// stop the loop 2 seconds later 
/* setTimeout(function() {
	console.log('2000ms passed, stopping the game loop');
	gameloop.clearGameLoop(loopId);
}, 2000); */
