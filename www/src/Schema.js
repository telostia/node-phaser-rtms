/**
 * @author       Jeffrey "pheryx" Milling <pheryx@gmail.com>
 * @copyright    2016 Archstorm LLC
 * @license      {@link https://github.com/pheryx/node-phaser-rtms/blob/master/LICENSE|MIT License}
 */

var Schema = {};

Schema = function( game ) {
	this.game = game;
};

Schema.prototype.documents = function(collection) {

	if (collection == 'players') return {
		profileEmail: '',
		profileUsername: '',
		settings: {},
		statistics: {},
	};

};

Schema.prototype.dbQuery = function(theQuery) {
	gameCore.socket.emit('dbQuery', theQuery);
};

Schema.prototype.docFind = function(collection, criteria, extra) {
	var collQueryName = collection + 'Find';
	var collQuery = {
		id: collQueryName,
		command: 'find',
		collection: collection,
		criteria: criteria,
		entitydoc: {},
	}

	if (extra) { collQuery.extra = extra; }

	schema.dbQuery(collQuery);
};

Schema.prototype.docSave = function(collection, collDoc) {
	var collQueryName = collection + 'Save';
	var collQuery = {
		id: collQueryName,
		command: 'save',
		collection: collection,
		criteria: {},
		entitydoc: collDoc
	}
	schema.dbQuery(collQuery);
};

Schema.prototype.docUpdate = function(collection, criteria, collDoc) {
	var collQueryName = collection + 'Update';
	var collQuery = {
		id: collQueryName,
		command: 'update',
		collection: collection,
		criteria: criteria,
		entitydoc: collDoc
	}
	schema.dbQuery(collQuery);
};
