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

## Installation
1. Clone the repository, cd to it, and update node modules:
> npm update

2. Optionally change settings in index.js such as:
  * Server name and port (default local.host:4004)
  * Database connection string and collection names
      * By default, the database is configured with two collections:
        * *authentications* - for storing OAuth profiles
        * *players* - for storing your players
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
  1. *boot* - initial low-level screen formatting
  2. *preloader* - load all your graphics, sound files, spritesheets, etc.
  3. *authenticator* - insert or retrieve-and-update the player's authentication profile
  4. *prestarter* - create the player and data elements, finish the connection process, and trigger the main menu
  5. *mainmenu* - the final stage of startup, from here you can create your main menu and other game states

## Components and what they do
* Important files
  * *index.js* - main node server app
  * *game.server.js* - core server functions for client communication
  * *www/game.client.js* - core client functions for server communication
  * *www/index.html* - browser index page / game entry point
  * *www/lib/*.js* - library code such as Phaser and jQuery
  * *www/src/*.js* - your JavaScript game code
* Node modules
  * *express* - web server
  * *express-session* - session management for express (required by OAuth)
  * *helmet* - security for express
  * *jade* - template language for web pages
  * *mongodb* - node.js driver for MongoDB
  * *mongojs* - the mongo API
  * *mongoose* - MongoDB ODM
  * *node-uuid* - unique ID generator
  * *passport* - OAuth authentication
  * *passport-google* - Google API for passport
  * *passport-google-oauth* - Google OAuth strategies for passport
  * *socket.io* - real-time socket connections
  * *node-gameloop* - server game loop

## Why?
I made this to showcase my JavaScript and Node.js code for potential employers, and because I hope this example will help other independent or professional game developers.

## Contact
Author: Jeffrey "pheryx" Milling
E-mail: pheryx@gmail.com
Homepage: http://www.jeffreymilling.com

## Credits
These tutorials served as inspiration for helping me understand the Node.js environment:
* [Real Time Multiplayer in HTML5](http://buildnewgames.com/real-time-multiplayer/)
* [Building Multiplayer Games with Node.js and Socket.IO](http://modernweb.com/2013/09/30/building-multiplayer-games-with-node-js-and-socket-io/)

