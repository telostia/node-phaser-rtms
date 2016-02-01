/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

var ScreenPrestarter = {};

Screen.Prestarter = function(game) {

	this.game = game;
	this.cardsloaded = false;
	this.decksloaded = false;
	this.docs = {};

	ScreenPrestarter = this;
};

Screen.Prestarter.prototype.preload = function() {
	//console.log('prestarter.preload');
};

Screen.Prestarter.prototype.create = function() {

	playerState.gameState = 'Prestarter';

	// report back to server that player has finished connecting and loading all assets
	gameCore.socket.emit('playerConnected', { player: player.dataStore.player });

	player.create();

	this.poststarter();
};

Screen.Prestarter.prototype.poststarter = function() {
	//console.log('prestarter.poststarter');
	this.game.state.start('mainmenu');
};
