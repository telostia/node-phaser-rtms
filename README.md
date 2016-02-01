# node-phaser-rtms
Node.js Phaser.io Real-time Multiplayer Server Example

## Summary
This is an example of an HTML5 multiplayer game framework. It consists of a server environment running [Node.js](https://nodejs.org), [Express](http://expressjs.com), and [socket.io](http://socket.io), with a [MongoDB](http://www.mongodb.com) database, using [Phaser](http://phaser.io) as the game engine.

With this framework you can, for example, match two or more players into a real-time game environment across any platform that runs HTML5 game engines, such as web browsers and mobile devices.

## Disclaimer
This is a code example pulled and modified from an existing game that I'm building. It contains basic matchmaking functions for a 2-player PvP turn-based game. Although it should work out-of-the-box, it should not be considered working software.

*Note:* There is no _interface_ whatsoever. Upon loading, starting, and connecting, you will simply see the blank Phaser game framework running.

## Requirements
* Node.js
* MongoDB
* Phaser

## Server environment
1. Clone the repository, cd to it, and update node modules:
> npm update
2. Optionally change settings in index.js such as:
  * Server name and port (default local.host:4004)
  * Database connection string and collection names
      * By default, the database is configured with two collections:
        * _authentications_ - for storing OAuth profiles
        * _players_ - for storing your players
  * Google Play ClientID and Client Secret
  * More authentication modules such as Facebook and Twitter
  * Whitelisted email addresses (e.g., your beta testers)
3. Create and start a MongoDB instance, e.g.:
> mongod --dbpath /path/to/data
4. Start the server:
> node index.js

## Client environment
1. Point a browser or device to http://your.local.host:4004
2. If not authenticated, you will be redirected to login.html until authentication.
3. If authenticated, index.html loads and begins the connection handshake process.
4. Upon completion of handshake, the client instantiates Phaser. Phaser will then execute a series of game states:
  1. _boot_ - initial low-level screen formatting
  2. _preloader_ - load all your graphics, sound files, spritesheets, etc.
  3. _authenticator_ - insert or retrieve-and-update the player's authentication profile
  4. _prestarter_ - create the player and data elements, finish the connection process, and trigger the main menu
  5. _mainmenu_ - the final stage of startup, from here you can create your main menu and other game states

## Components and what they do
* Important files
  * _index.js_ - main node server app
  * _game.server.js_ - core server functions for client communication
  * _www/game.client.js_ - core client functions for server communication
  * _www/index.html_ - browser index page / game entry point
  * _www/lib/*.js_ - library code such as Phaser and jQuery
  * _www/src/*.js_ - your JavaScript game code
* Node modules
  * _express_ - web server
  * _express-session_ - session management for express (required by OAuth)
  * _helmet_ - security for express
  * _jade_ - template language for web pages
  * _mongodb_ - node.js driver for MongoDB
  * _mongojs_ - the mongo API
  * _mongoose_ - MongoDB ODM
  * _node-uuid_ - unique ID generator
  * _passport_ - OAuth authentication
  * _passport-google_ - Google API for passport
  * _passport-google-oauth_ - Google OAuth strategies for passport
  * _socket.io_ - real-time socket connections
  * _node-gameloop_ - server game loop

## Why?
I made this to showcase my JavaScript and Node.js code for potential employers, and because I hope this example will help other independent or professional game developers.

## Who am I?

## Credits


