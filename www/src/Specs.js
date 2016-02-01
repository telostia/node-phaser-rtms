/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

// create all global variables

var playerprofile = {};

var defaultW = 1600;
var defaultH = 900;

var cameraX = (defaultW / 2), cameraY = (defaultH / 2);
var cameraW = defaultW, cameraH = defaultH;

var gameWorld = { x: 0, y: 0, width: defaultW, height: defaultH };

// class holders
var schema = {};
var specs = {};

var player = {};

var gui = {};
var hud = {};

// keyboard input holders
var keyboard = {};
var keys = {};

// database response holders
var serverCursor = { his: 0, cis: 0 };
var serverData = {};
var clientDbResult = {};
var clientDbid = '';
var selfIsHost = false;

var worldScale = 1; // used for scaling every game object when changing resolution

var gameDiv;
var viewRect;
var boundsPoint;

var o_mcamera;
var o_lerp = 1;

