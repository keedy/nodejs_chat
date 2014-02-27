var redis = require('redis');

var datastore = module.exports = {};

datastore.init = function(config, session) {
	this.datastore = redis.createClient(config.port, config.host);
	if(config.password) {
		this.datastore.auth(config.password);
	}
	this.session = session;
	
	return this;
}

datastore.setUserData = function(userId, room, data) {
	for(var item in data) {
		this.datastore.hset('user-data-' + userId + '-' + room, item, data[item]);
	}
}

datastore.getUserData = function(userId, room, callback) {
	this.datastore.hgetall('user-data-' + userId + '-' + room, function(err, results) {
		callback(err, results);
	});
}

datastore.addUserToRoom = function(nickname, room) {
	this.datastore.sadd('room-users-' + room, nickname);
}

datastore.getUsersList = function(room, callback) {
	var self = this;

	this.datastore.smembers('room-users-' + room, function(err, members) {
		var users = [];
		var i = 0;
		var numCompleted = 0;

		var markAsCompleted = function() {
			numCompleted++;

			if(numCompleted === members.length) {
				callback(users);
			}
		};

		if(!members || members.length === 0) {
			callback([]);
		}
		else {
			var userCallback = function(err, userData) {
				users.push({
					'nickname': userData.nickname,
					'connectedAt': userData.connectedAt,
					'lastActivity': userData.lastActivity
				});
				markAsCompleted();
			};

			for(i = 0; i < members.length; ++i) {
				var userID = members[i];
				self.getUserData(userID, room, userCallback);
			}
		}
	});
}


datastore.setRoomData = function(room, data) {
	for(var item in data) {
		this.datastore.hset('room-data-' + room, item, data[item]);
	}
}

datastore.getRoomData = function(room, callback) {

}

datastore.addToRoomsList = function(room) {

}

datastore.getRoomsList = function(callback) {
	var self = this;

	this.datastore.smembers('room-list', function(err, rooms) {
		var roomsList = [];
		var i = 0;
		var numCompleted = 0;

		var markAsCompleted = function() {
			numCompleted++;

			if(numCompleted === rooms.length) {
				callback(roomsList);
			}
		};

		if(!rooms || rooms.length === 0) {
			callback([]);
		}
		else {
			var roomCallback = function(err, roomData) {
				roomsList.push({
					'name': roomData.name,
					'counter': roomData.counter
				});
				markAsCompleted();
			};

			for(i = 0; i < rooms.length; ++i) {
				var room = rooms[i];
				// self.getRoomData(room, roomCallback);
				self.datastore.hgetall('room-data-' + room, roomCallback); // FIXME
			}
		}
	});
}

datastore.incrementRoomCounter = function(room) {

}

datastore.decrementRoomCounter = function(room) {

}