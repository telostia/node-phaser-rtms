/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

// Base64 encoder/decoder for sending json objects between client and server
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

var game_player = function( game_instance ) {
	this.game = game_instance;
	this.state = 'not-connected';
};

var game_core = function() {
	this.player = new game_player(this);
	this.client_create_configuration();
	this.client_connect_to_server();
};

game_core.prototype.client_create_configuration = function() {

	this.net_latency = 0.001;	  //the latency between the client and the server (ping/2)
	this.net_ping = 0.001;			//The round trip time from here to the server,and back
	this.last_ping_time = 0.001;		//The time we last sent a ping
	this.fake_lag = 0;		  //If we are simulating lag, this applies only to the input client (not others)
	this.fake_lag_time = 0;

	this.net_offset = 100;			//100 ms latency between server and client interpolation for other clients
	this.buffer_size = 2;			  //The size of the server history to keep for rewinding/interpolating.
	this.target_time = 0.01;		//the time where we want to be in the server timeline
	this.oldest_tick = 0.01;		//the last time tick we have available in the buffer

	this.client_time = 0.01;		//Our local 'clock' based on server time - client interpolation(net_offset).
	this.server_time = 0.01;		//The time the server reported it was at, last we heard from it

	this.dt = 0.016;				//The time that the last frame took to run
	this.fps = 0;					  //The current instantaneous fps (1/this.dt)
	this.fps_avg_count = 0;		  //The number of samples we have taken for fps_avg
	this.fps_avg = 0;			  //The current average fps displayed in the debug UI
	this.fps_avg_acc = 0;			  //The accumulation of the last avgcount fps samples

	this.lit = 0;
	this.llt = new Date().getTime();
};

game_core.prototype.client_refresh_fps = function() {
	this.fps = 1/this.dt;
	this.fps_avg_acc += this.fps;
	this.fps_avg_count++;

	if(this.fps_avg_count >= 10) {
		this.fps_avg = this.fps_avg_acc/10;
		this.fps_avg_count = 1;
		this.fps_avg_acc = this.fps;
	} //reached 10 frames
};

game_core.prototype.client_connect_to_server = function() {

	this.socket = io.connect();

	this.socket.on('onconnected', this.client_onconnected.bind(this));
	this.socket.on('disconnect', this.client_ondisconnect.bind(this));
	this.socket.on('error', this.client_ondisconnect.bind(this));

	this.socket.on('dbResult', this.client_dbResult.bind(this));

	this.socket.on('findMatchStarted', this.client_findMatchStarted.bind(this));
	this.socket.on('findMatchTimeout', this.client_findMatchTimeout.bind(this));

	this.socket.on('matchJoinGame', this.client_matchJoinGame.bind(this));
	this.socket.on('matchBeginGame', this.client_matchBeginGame.bind(this));
	this.socket.on('joinedExistingGame', this.client_joinedExistingGame.bind(this));

};

game_core.prototype.client_onconnected = function(data) {
	//console.log(data);

	this.player.profile = data.profile;
	this.player.state = 'connected';
	this.player.online = true;

	gameCoreActive = true;
	//console.log(this.player.profile);
};

game_core.prototype.client_ondisconnect = function(data) {
	this.player.state = 'not-connected';
	this.player.online = false;
};

game_core.prototype.client_dbResult = function(data) {
	//console.log('core.dbResult');

	switch (data.dbid) {

		case 'authenticationsFind':
			//console.log(data.dbResult[0]);
			player.dataStore.authentication = data.dbResult[0];
		break;

		case 'decksFind':
			player.dataStore.decks = data.dbResult;
			//console.log(player.dataStore.decks);
			if (playerState.gameState == 'Prestarter') {
				ScreenPrestarter.poststarter();
			}
		break;

		case 'decksUpdate':
		break;

		case 'gamesFind':
			//console.log(data);

			if (data.dbResult.length) {
				//console.log('it seems we found a game in progress');
				//console.log(data.dbResult);

				var gameInProgress = data.dbResult[0];
				ScreenPrestarter.existingGame(gameInProgress);
			} else {
				if (playerState.gameState == 'Prestarter') {
					ScreenPrestarter.findDecks();
				}
			}
		break;

		case 'gamesUpdate':
		break;

		case 'playersFind':
			//console.log(data.dbResult[0]);
			player.dataStore.player = data.dbResult[0];
			if (playerState.gameState == 'Authenticator') {
				ScreenAuthenticator.poststarter();
			}
		break;

		case 'playersUpdate':
			if (playerState.gameState == 'Authenticator') {
				ScreenAuthenticator.initDataLoad();
			}
		break;

		default: break;
	}
};

game_core.prototype.client_findMatchTimeout = function(data) {
	console.log('core.findMatchTimeout');
	playerState.findMatchCmd = 'timeout';
};

game_core.prototype.client_findMatchStarted = function(data) {
	//console.log(data);
	playerState.gameId = data.gameId;
	//playerState.socketId = data.mySocketId;
};

game_core.prototype.client_matchJoinGame = function(data) {
	console.log('core.matchJoinGame');
	//console.log(data);
	this.socket.emit('joinHostGame', { gameId: data.gameId, playerId: player.dataStore.player._id });
};

game_core.prototype.client_joinedExistingGame = function(data) {
	//console.log('core.joinedExistingGame');
	var theGame = data.theGame;
	var playerId = player.dataStore.player._id;

	player.stopScreens(function(){
		effects.sfx[effects.sfxLabels.stateOpen].play();
		myGame.state.start('playgame', true, false, {
			theGame: theGame,
			deckSelf: theGame.players[playerId].deck,
		});
	});

	//console.log(data);
	//this.socket.emit('joinHostGame', { gameId: data.gameId, joinPlayer: data.myPlayer });
};

game_core.prototype.client_matchBeginGame = function(data) {
	console.log('core.matchBeginGame');
	//console.log(data);

	var deckSelf = playerState.deckSelf;

	player.stopScreens(function(){
		effects.sfx[effects.sfxLabels.stateOpen].play();
		myGame.state.start('playgame', true, false, {
			theGame: data.theGame,
			deckSelf: deckSelf,
		});
	});
};

