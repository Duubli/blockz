var util = require("util"),
    io = require("socket.io"),
    Player = require("./Player").Player;

var socket,
    players;


function init () {
  players = [];
  socket = io.listen(62130);
  util.log("Server running!");
  setEventHandlers();
}


function setEventHandlers () {
  socket.sockets.on("connection", onSocketConnection);
}

function onSocketConnection (client) {
  util.log("Player connected: " + client.id);

  client.on("disconnect", onClientDisconnect);
  client.on("new player", onNewPlayer);
  client.on("move player", onMovePlayer);
}


function onClientDisconnect () {
  util.log("Player disconnected: " + this.id);

  var removePlayer = playerById(this.id);

  if (!removePlayer) {
  	util.log("Player not found: " + this.id);
  	return;
  }

  // Remove player from the array
  players.splice(players.indexOf(removePlayer), 1);

  // Send the event to connected clients
  this.broadcast.emit("remove player", { id: this.id });

}

function onNewPlayer (data) {

  // Create a new player
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = this.id;

  // Send the new player to connected clients
  this.broadcast.emit("new player", { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY() });

  // Send existing players to the new player
  var i, existingPlayer;
  for (i = 0; i < players.length; i++) {
  	this.emit("new player", { id: players[i].id, x: players[i].getX(), y: players[i].getY() });
  }

  util.log("New player created: " + this.id);

  players.push(newPlayer);

}

function onMovePlayer (data) {

  var movedPlayer = playerById(this.id);

  if (!movedPlayer) {
    util.log("Player not found: " + this.id);
    return;
  }

  movedPlayer.setX(data.x);
  movedPlayer.setY(data.y);

  this.broadcast.emit("moved player", { id: movedPlayer.id, x: movedPlayer.getX(), y: movedPlayer.getY() });

}

function playerById (id) {
  var i;
  for (i = 0; i < players.length; i++) {
    if (players[i].id == id) {
      return players[i];
    }
  }
  return false;
}

init();