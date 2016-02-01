/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

var ScreenAuthenticator = {};

Screen.Authenticator = function(game) {
	this.game = game;
	ScreenAuthenticator = this;
};

Screen.Authenticator.prototype.preload = function() {
	//console.log('authenticator.preload');
	player = new Player(this.game);
	player.preload();
};

Screen.Authenticator.prototype.create = function() {
	//console.log('authenticator.create');
	playerState.gameState = 'Authenticator';
	this.initDataCreate();
};

Screen.Authenticator.prototype.poststarter = function() {
	//console.log('authenticator.poststarter');
	this.game.state.start('preloader');
};

Screen.Authenticator.prototype.initDataCreate = function() {
	//console.log('authenticator.initDataCreate');

	var profile = gameCore.player.profile;

	var authCrit = { provider: profile.provider, id: profile.id };
	var authDoc = { profile: profile };
	schema.docUpdate('authentications', authCrit, authDoc);

	var providerKey = profile.provider + 'Id';
	var playerCrit = { profileEmail: profile.emails[0].value };
	var playerDoc = {
		provider: profile.provider,
		profileEmail: profile.emails[0].value,
	};
	playerDoc[providerKey] = profile.id;
	schema.docUpdate('players', playerCrit, playerDoc);
};

Screen.Authenticator.prototype.initDataLoad = function() {

	var profile = gameCore.player.profile;

	// find the player's authentication
	var authCrit = { provider: profile.provider, id: profile.id };
	schema.docFind('authentications', authCrit);

	// find the player
	var playerCrit = { profileEmail: profile.emails[0].value };
	schema.docFind('players', playerCrit);
};

