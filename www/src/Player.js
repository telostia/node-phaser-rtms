/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

var Player = {};

Player = function( game ) {

	this.game = game;

	this.settings = {};

	this.nowMuTime = 0;
	this.nowTime = 0;

	this.dberr = null;
	this.dbid = null;
	this.dbResult = [];

	this.dataStore = {
		authentication: {},
		player: {},
	};
};

// stopScreens is used as a state changer to ensure the update loop stops running and player's state is reinitialized
Player.prototype.stopScreens = function (callback) {
	// stop the parent game state update loop
	ScreenMainMenu.screeninitialized = false;

	// reset the state objects
	hudCursors.reset();
	playerState.reset();

	callback();
};

Player.prototype.preload = function () {
	// create the blank player state objects
	hudCursors.init();
	playerState.init();
};

Player.prototype.create = function () {
	// initialize anything related to your connected player
};

Player.prototype.update = function () {
	// Note: player.update() is called from the parent game state update loop

	// update the time and microtime
	this.nowMuTime = new Date().getTime();
	this.nowTime = Math.round(this.nowMuTime / 1000);
};

