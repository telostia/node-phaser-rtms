/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

var myGame;
var gameCore = {};
var gameCoreActive = false;

var socketClientSetup = function() { gameCore = new game_core(); };

function update() {
	// game will not begin until server reports back that connection was successful
	if (!gameCoreActive) return;
	myGame.state.start('boot');
}

function render() { }
