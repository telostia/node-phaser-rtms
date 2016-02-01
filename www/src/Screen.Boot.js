/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

var Screen = {};

Screen.Boot = function(game) {
	this.game = game;
};

Screen.Boot.prototype.preload = function() {

	this.game.advancedTiming = true;

	// load helper classes
	schema = new Schema(this.game);
};

Screen.Boot.prototype.create = function() {
	this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

	this.game.scale.pageAlignHorizontally = true;
	this.game.scale.pageAlignVertically = true;

	this.game.scale.setGameSize(defaultW, defaultH);

	// start the authenticator
	this.game.state.start('authenticator');
};
