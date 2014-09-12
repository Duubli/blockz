/*global chance */
(function() {
  'use strict';

  function Player(game) {
    this.game = game;
  }

  Player.prototype = {

    create: function () {

      // Create the player
      var player = this.game.add.sprite(420, 0, 'player');
      player.scale.setTo(0.25, 0.25);
      this.game.physics.arcade.enable(player);

      player.body.bounce.y = 0.2;
      player.body.gravity.y = 1000;
      player.body.collideWorldBounds = true;

      player.lastMovement = this.game.time.totalElapsedSeconds();
      player.name = chance.first();

      this.game.socket.emit('new player', {
        x: player.x,
        y: player.y,
        name: player.name
      });

      // Show the player name
      var playerName = this.game.add.text(player.x, player.y - 50, player.name, {
      	font: '12px Arial', fill: '#000000', align: 'center'
      });

      return {
        player: player,
        playerName: playerName
      };

    },

    update: function () {

      // Move the player
      this.movePlayer();

    },

    movePlayer: function () {

      var leftKey = Phaser.Keyboard.A,
      rightKey = Phaser.Keyboard.D,
      upKey = Phaser.Keyboard.W;

      // Collide with platforms
      this.game.physics.arcade.collide(this.game.player, this.game.platforms);

      // Collied with enemies
      this.game.physics.arcade.collide(this.game.player, this.game.enemies);

      // Reset velocity
      this.game.player.body.velocity.x = 0;

      // Move left
      if (this.game.input.keyboard.isDown(leftKey)) {
        this.game.player.body.velocity.x = -150;
      }
      // Move right
      else if (this.game.input.keyboard.isDown(rightKey)) {
        this.game.player.body.velocity.x = 150;
      }

      // Jump!
      // console.log(this.player.body.touching.down);
      if (this.game.input.keyboard.isDown(upKey) && this.game.player.body.touching.down) {
        this.game.player.body.velocity.y = -600;
      }

      if (this.game.time.totalElapsedSeconds() - this.game.player.lastMovement >= 0.015) {
        this.game.socket.emit('move player', { x: this.game.player.x, y: this.game.player.y, name: this.game.player.name });
        this.game.player.lastMovement = this.game.time.totalElapsedSeconds();
      }

      this.game.player.prevX = this.game.player.x;
      this.game.player.prevY = this.game.player.y;

      // Move the player name
      this.game.playerName.x = this.game.player.x + (this.game.player.width / 2) - ( this.game.playerName.width / 2);
      this.game.playerName.y = this.game.player.y - 20; // - ( this.player.width / 2 ) - ( this.playerName.textWidth / 2 );

    }

  };

  window['blockz'] = window['blockz'] || {};
  window['blockz'].Player = Player;

}());
