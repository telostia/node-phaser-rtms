var db;
var io;
var gameSocket;
var UUID;

var playersConnected = {};
var lookingForMatch = {};
var lfmTimeout = 30;

var waitingOnMatch = {};

var gamesInProgress = {};

var nowMuTime = new Date().getTime();
var nowTime = Math.round(nowMuTime / 1000);

/**
 * playerConnect is called by index.js to connect the player and initialize a new game instance.
 *
 * @param sdb The MondoDB connection
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client
 * @param sUUID The node-uuid library
 * @param profile the JSON data of the authenticated player
 */
exports.playerConnect = function(sdb, sio, socket, sUUID, profile){
	db = sdb;
	io = sio;
	gameSocket = socket;
	UUID = sUUID;

	// emit the 'onconnected' event to the client
	gameSocket.emit('onconnected', { profile: profile });

	// create other listener events

	// generic event for the response from a client initiating a database query
	gameSocket.on('dbQuery', dbQuery);

	// after the client is connected it reports back with the 'playerConnected' event
	// from here the server now knows the player is connected
	gameSocket.on('playerConnected', playerConnected);

	// further listeners for specifics events in your game
	// in this case we create a generic PvP match finding system
	gameSocket.on('findMatchStart', findMatchStart);
	gameSocket.on('findMatchCancel', findMatchCancel);
	gameSocket.on('joinHostGame', joinHostGame);
	gameSocket.on('joinExistingGame', joinExistingGame);
}

/**
 * serverLoop is iterated by index.js. The server loop is what makes this a real time server.
 *
 * @param frameCount The current frame
 * @param delta The delta time from the last frame
 */
exports.serverLoop = function(frameCount, delta) {

	// update the time and microtime
	nowMuTime = new Date().getTime();
	nowTime = Math.round(nowMuTime / 1000);

	// if any players are currently looking for a match, run the findMatch function
	if (lookingForMatch != {}) {
		serverLoop_findMatch();
	}

	// other server loop-based directives can go here
}

/**
 * playerConnected is called by the listener event, triggered when a client reports back that they have connected
 *
 * @param data The data object sent by the client upon connection completion
 */
function playerConnected(data) {
	var player = data.player;
	var playerId = player._id;
	console.log('player connected : ' + playerId);

	player.socketId = gameSocket.id;
	player.connectMuTime = nowMuTime;
	player.connectTime = nowTime;
	player.lastPingTime = nowTime;

	// add to the playersConnected array
	playersConnected[playerId] = player;
}

function serverLoop_findMatch() {
	for (var playerId in lookingForMatch) {

		var lfm = lookingForMatch[playerId];

		// be prepared to timeout the player if no matches found
		if (nowTime > (lfm.startTime + lfmTimeout)) {
			findMatchTimeout(playerId);
			continue;
		}

		// it is possible that the players can get matched a few microseconds before the server completes
		// the match, so we instantly set and test the matchFound flag to prevent multiple matches
		if (lfm.matchFound) { continue; }
		else {

			for (var opponent_id in lookingForMatch) {
				if (!lookingForMatch[opponent_id]) { continue; }

				var lfmother = lookingForMatch[opponent_id];

				// We treat the 'host' player as the player who first initiated the findMatch,
				// so the 'join' player must always come later in time.
				// We also ensure that the two players have selected the same game modes.
				// You can do other things here like match your players by their MMR.
				if (lfmother.startMuTime < lfm.startMuTime
					&& lfmother.matchFound == false
					&& lfmother.playMode == lfm.playMode
					&& lfmother.subMode == lfm.subMode) {

					lfm.matchFound = true;
					lfmother.matchFound = true;

					// match found, trigger it
					playerMatchFound(lfmother, lfm);

				}
				
			}

		}

	}
}

/**
 * dbResultHandler emits a dbResult back to the client for any db query (including empty result or non-result)
 *
 * @param err The MongoDB error (if any)
 * @param dbid A custom name that we assign to the query so the client knows how to interpret it
 * @param dbResult The actual array of results (i.e. rows)
 * @param extra A custom parameter for passing in and handling wonky db patterns that don't fit globally
 */
function dbResultHandler(err, dbid, dbResult, extra) {
	if (!gameSocket) { return null; }

	// special handling for some results using variables from 'extra'
	if (dbid == 'gamesFind' && dbResult.length) {
		// do something with your special handling here
	}

	gameSocket.emit('dbResult', { err: err, dbid: dbid, dbResult: dbResult });
}

/**
 * dbQuery is called by the listener event when a client triggers a query
 *
 * @param dbcmd The db query object containing the dbid, collection name, search criteria, and other params as needed
 */
function dbQuery(dbcmd){

	var emptyset = [];
	var dbid = dbcmd.id;
	var collection = dbcmd.collection;
	var criteria = dbcmd.criteria;

	var extra = {};
	if (dbcmd.extra) { extra = dbcmd.extra; }

	// we have handling for multiple types of queries, mainly find, save, and update

	switch (dbcmd.command) {
		case 'find':
			var dbCursor = db[collection].find(criteria).toArray(function(err, entities){
				dbResultHandler(err, dbid, entities, extra);
			}, this);
		break;

		case 'save':
			var entitydoc = dbcmd.entitydoc;
			//if (entitydoc._id) { entitydoc._id = db.ObjectId(entitydoc._id); }
			db[collection].save( entitydoc,
				function(err, saved){
					dbResultHandler(err, dbid, emptyset, extra);
				}, this);
		break;

		case 'update':
			var entitydoc = dbcmd.entitydoc;
			var options = { upsert: true, new: true };

			//if (entitydoc._id) { entitydoc._id = db.ObjectId(entitydoc._id); }

			db[collection].update( criteria, { $set: entitydoc }, options,
				function(err, updated){
					dbResultHandler(err, dbid, updated, extra);
				}, this);

		break;

		default: break;
	}
}

// if a findMatch has timed out, emit the timeout event to the client
function findMatchTimeout(playerId) {
	console.log(playerId + ' : match timed out');

	var gameId = lookingForMatch[playerId].gameId;
	var socketId = lookingForMatch[playerId].socketId;

	io.to(socketId).emit('findMatchTimeout');

	// remove the player from the lookingForMatch array
	delete lookingForMatch[playerId];
}

// if the client has canceled the findMatch from their end, the server receives the event and cancels it here
function findMatchCancel(data) {
	var player = data.player;
	var playerId = player._id;
	var playMode = data.playMode;
	var subMode = data.subMode;

	if (!lookingForMatch[playerId]) { return; }

	var gameId = lookingForMatch[playerId].gameId;
	this.leave(gameId);
	console.log(player._id + ' left room ' + gameId + ' : findMatchCancel | ' + playMode + ' | ' + subMode);

	// remove the player from the lookingForMatch array
	delete lookingForMatch[playerId];
}

// begin the findMatch by adding the client's player and game info to the lookingForMatch array
function findMatchStart(data) {

	var player = data.player;
	var playerId = player._id;
	var deck = data.deck;
	var playMode = data.playMode;
	var subMode = data.subMode;

	// generate a gameId
	var gameId = UUID();

	// emit to the client that the server has started looking for a match
	this.emit('findMatchStarted', { gameId: gameId });

	// Create a 'host' room for the player based on the gameId.
	// If the player ends up being the 'join' the player, they will leave this room and join the 'host' room
	this.join(gameId);

	lookingForMatch[playerId] = {
		gameId: gameId,
		startMuTime: nowMuTime,
		startTime: nowTime,
		player: player,
		matchFound: false,
		playMode: playMode,
		subMode: subMode,
		socketId: this.id,
	};

	console.log(player._id + ' joined room ' + gameId + ' : findMatchStart | ' + playMode + ' | ' + subMode);
}

// two players have been matched, the hostPlayer being the player who started their matchFind earlier in time
function playerMatchFound(hostPlayer, joinPlayer) {

	// use the gameId from the host player
	var gameId = hostPlayer.gameId;
	hostPlayer.hostPlayer = true;

	// emit the event to the joined player that tells the client to join the host player's game
	io.to(joinPlayer.socketId).emit('matchJoinGame', { gameId: gameId });

	console.log(joinPlayer.player._id + ' : sending notice to join game | ' + gameId + ' | ' + hostPlayer.playMode + ' | ' + hostPlayer.subMode);

	// create the matched game in the server space
	var theGame = {
		startMuTime: nowMuTime,
		startTime: nowTime,
		endMuTime: 0,
		endTime: 0,
		gameId: gameId,
		joinedPlayers: 1,
		maxPlayers: 2,
		playerIds: [],
		players: {},
		turns: [],
	};

	// add the host player to the game object
	theGame.players[hostPlayer.player._id] = hostPlayer;
	theGame.playerIds.push(hostPlayer.player._id);

	gamesInProgress[gameId] = theGame;

	// temporarily move the players to the waitingOnMatch array until the match is completed
	waitingOnMatch[hostPlayer.player._id] = lookingForMatch[hostPlayer.player._id];
	waitingOnMatch[joinPlayer.player._id] = lookingForMatch[joinPlayer.player._id];

	// finally, remove both players from the lookingForMatch array which stops the server loop from matching them
	delete lookingForMatch[hostPlayer.player._id];
	delete lookingForMatch[joinPlayer.player._id];
}

// the server receives a second event from the 'join' player to join the 'host' player's game
function joinHostGame(data) {
	var gameId = data.gameId;
	var playerId = data.playerId;

	var theGame = gamesInProgress[gameId];
	var joinPlayer = waitingOnMatch[playerId];

	var min = 0, max = 999999;

	this.join(gameId);

	joinPlayer.joinPlayer = true;

	theGame.players[playerId] = joinPlayer;
	theGame.playerIds.push(playerId);
	theGame.joinedPlayers += 1;

	console.log(playerId + ' joined game | ' + gameId);

	if (theGame.joinedPlayers == theGame.maxPlayers) {

		// create a quick random test to determine which player goes first (in a turn-based game)
		var firstTest = Math.floor(Math.random() * (max - min + 1)) + min;
		var firstId = theGame.playerIds[0];
		var secondId = theGame.playerIds[1];

		if (firstTest < 500000) {
			firstId = theGame.playerIds[1];
			secondId = theGame.playerIds[0];
		}

		theGame.players[firstId].goesFirst = true;
		theGame.players[secondId].goesFirst = false;

		// Save the game back to the database. This is critical because we need to detect
		// if there is a game in progress if either client reloads their browser page.
		saveGameInProgress(gameId, theGame);

		// alert both clients that the game is ready to start
		matchBeginGame(gameId, theGame);

		// the match is fully completed on the server, so remove the players from waitingOnMatch array
		delete waitingOnMatch[firstId];
		delete waitingOnMatch[secondId];
	}
}

// if the player reloads their browser and their initial connection detects a game-in-progress, the player
// is joined to their existing game. Note that this is highly customized and will be specific to your game.
function joinExistingGame(data) {

	var playerId = data.playerId;
	var theGame = data.theGame;
	var gameId = data.theGame.gameId;
	var socketId = gameSocket.id;

	console.log(playerId + ' joined existing game ' + gameId);
	this.join(gameId);

	// emit the joinedExistingGame event back to the client
	io.to(socketId).emit('joinedExistingGame', { theGame: theGame });
}

// helper function to save or update the game to the database
function saveGameInProgress(gameId, theGame) {
	gamesInProgress[gameId] = theGame;

	delete theGame._id;
	var gamesCrit = { gameId: gameId };
	dbQuery({
		id: 'gamesUpdate',
		command: 'update',
		collection: 'games',
		criteria: gamesCrit,
		entitydoc: theGame,
	});
}

// begin game function, triggered after the server completes a findMatch
function matchBeginGame(gameId, theGame) {
	// emit the begin game event to both clients
	io.to(gameId).emit('matchBeginGame', { theGame: theGame });
}

// generic listener function for handling a game turn
function gameTurnEvent(data) {
	console.log(data);
}

