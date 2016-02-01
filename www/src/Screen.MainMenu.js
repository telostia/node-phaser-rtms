/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

var ScreenMainMenu = {};

Screen.MainMenu = function(game) {
	ScreenMainMenu = this;
	this.game = game;
	this.screeninitialized = false;
};

Screen.MainMenu.prototype.preload = function() {
};

Screen.MainMenu.prototype.create = function() {

	playerState.gameState = 'MainMenu';

	ScreenMainMenu.screeninitialized = true;
	console.log('MainMenu started');
};

Screen.MainMenu.prototype.update = function() {
	if (!this.screeninitialized) { return; }
	player.update();
};

Screen.MainMenu.prototype.render = function() {
};
