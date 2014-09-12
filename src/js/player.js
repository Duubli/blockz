/*global chance */
(function() {
  'use strict';

  function Player(game) {
    this.game = game;
    this.player = null;
    this.playerName = null;
  }

  Player.prototype = {

    create: function () {

      // Create the player
      this.player = this.game.add.sprite(420, 0, 'player');
      this.player.scale.setTo(0.25, 0.25);
      this.game.physics.arcade.enable(this.player);

      this.player.body.bounce.y = 0.2;
      this.player.body.gravity.y = 1000;
      this.player.body.collideWorldBounds = true;

      this.player.lastMovement = this.game.time.totalElapsedSeconds();
      this.player.name = chance.first();

      this.game.socket.emit('new player', {
        x: this.player.x,
        y: this.player.y,
        name: this.player.name
      });

      // Show the player name
      this.playerName = this.game.add.text(this.player.x, this.player.y - 50, this.player.name, {
      	font: '12px Arial', fill: '#000000', align: 'center'
      });

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
      this.game.physics.arcade.collide(this.player, this.game.platforms);

      // Collied with enemies
      this.game.physics.arcade.collide(this.player, this.game.enemies);

      // Reset velocity
      this.player.body.velocity.x = 0;

      // Move left
      if (this.game.input.keyboard.isDown(leftKey)) {
        this.player.body.velocity.x = -150;
      }
      // Move right
      else if (this.game.input.keyboard.isDown(rightKey)) {
        this.player.body.velocity.x = 150;
      }

      // Jump!
      // console.log(this.player.body.touching.down);
      if (this.game.input.keyboard.isDown(upKey) && this.player.body.touching.down) {
        this.player.body.velocity.y = -600;
      }

      if (this.game.time.totalElapsedSeconds() - this.player.lastMovement >= 0.015) {
        this.game.socket.emit('move player', { x: this.player.x, y: this.player.y, name: this.player.name });
        this.player.lastMovement = this.game.time.totalElapsedSeconds();
      }

      this.player.prevX = this.player.x;
      this.player.prevY = this.player.y;

      // Move the player name
      this.playerName.x = this.player.x + (this.player.width / 2) - ( this.playerName.width / 2);
      this.playerName.y = this.player.y - 20; // - ( this.player.width / 2 ) - ( this.playerName.textWidth / 2 );

    }

  };

  window['blockz'] = window['blockz'] || {};
  window['blockz'].Player = Player;

}());
