/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

// origState contains two identical objects with builtin init() and reset() methods,
// for comparing the player's game state to a 'cursor' state in your update loops,
// and for resetting the player's data when switching game states

var playerState = {
	gameId: '',
	socketId: '',
	gameState: '',
	gameInProgress: {},

	mainMenu: '',
	playMode: '',
	subMode: '',
	menuAction: '',

	init: function() {
		var origValues = {};
		for (var prop in this) {
			if (this.hasOwnProperty(prop) && prop != "origValues") {
				origValues[prop] = this[prop];
			}
		}
		this.origValues = origValues;
	},

	reset: function() {
		for (var prop in this.origValues) {
			this[prop] = this.origValues[prop];
		}
	}
};

var hudCursors = {
	gameId: '',
	socketId: '',
	gameState: '',
	gameInProgress: {},

	mainMenu: '',
	playMode: '',
	subMode: '',
	menuAction: '',

	init: function() {
		var origValues = {};
		for (var prop in this) {
			if (this.hasOwnProperty(prop) && prop != "origValues") {
				origValues[prop] = this[prop];
			}
		}
		this.origValues = origValues;
	},

	reset: function() {
		for (var prop in this.origValues) {
			this[prop] = this.origValues[prop];
		}
	}
};

