/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

Screen.Preloader = function(game) {
	this.game = game;
};

Screen.Preloader.prototype.loadStart = function () {
	// do something as the load starts
};

Screen.Preloader.prototype.loadComplete = function () {
	//console.log('preloader.loadComplete');
	this.loadAfter();
};

Screen.Preloader.prototype.loadAfter = function () {
	//console.log('preloader.loadAfter');
	this.game.state.start('prestarter');
};

Screen.Preloader.prototype.preload = function() {

	// create loader events to ensure all assets are loaded

	this.game.load.onLoadStart.addOnce(this.loadStart, this);
	this.game.load.onLoadComplete.addOnce(this.loadComplete, this);

	// load assets here (see Phaser load() method)

};

Screen.Preloader.prototype.create = function() {
	// start the load, which will fire loadComplete() upon completion
	this.game.load.start();
};

