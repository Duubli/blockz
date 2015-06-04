(function() {
  'use strict';

  function Player(game) {
    this.game = game;
  }

  Player.prototype = {

    create: function () {

      // Create the player
      var player = this.game.add.sprite(0, 0, 'player');
      player.animations.add('run',[7, 8, 9, 8]);
      player.animations.add('idle',[0, 1, 0, 2, 0]);
      player.animations.add('jump',[9]);
      player.animations.add('fall',[10]);
      player.animations.add('hurt',[11,12]);
      player.animations.add('die',[13,14,15,16]);
      player.animations.add('pull',[17,18,17,18,20,19,20,19,20,21]);
      player.animations.add('victory',[22,23]);

      player.anchor.set(0.5, 0.5);

      // Set some physics
      this.game.physics.arcade.enable(player);
      player.body.bounce.y = 0;
      player.body.gravity.y = 1000;
      player.body.collideWorldBounds = true;

      // Generate a name for the player
      player.name = chance.first();

      // Add weapon
      player.weapon = this.game.add.sprite(0, 0, 'player');
      player.weapon.animations.add('idle', [3]);
      player.weapon.animations.add('fire', [3, 4, 5, ,6, 3]);


      player.weapon.anchor.set(0.5, 0.5);

      player.weapon.animations.play('idle');
      player.weapon.position.x = player.position.x+4;
      player.weapon.position.y = player.position.y-1;
      // this.weapon.position = player.position;

      // Show the player name
    //   var playerName = this.game.add.text(0, -50, player.name, {
    //     font: '40px Arial', fill: '#000000'
    //   });
    //   playerName.x = player.width / 2 - playerName.width / 2;
    //   player.addChild(playerName);
      player.addChild(player.weapon);

      // Set the timestamp for the last movement
      player.lastMovement = this.game.time.totalElapsedSeconds();

      // Send the new player to the server
      this.game.socket.emit('new player', {
        x: player.x,
        y: player.y,
        name: player.name
      });

      // Scale the player to be a bit smaller
      // player.scale.setTo(0.25, 0.25);

      return player;

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
        this.game.player.animations.play('run', 10, true);
        this.game.player.scale.x = -1;
      }
      // Move right
      else if (this.game.input.keyboard.isDown(rightKey)) {
        this.game.player.body.velocity.x = 150;
        this.game.player.animations.play('run', 10, true);
        this.game.player.scale.x = 1;
      }

      // Jump!
      // console.log(this.player.body.touching.down);
      if (this.game.input.keyboard.isDown(upKey) && this.game.player.body.touching.down) {
        this.game.player.body.velocity.y = -600;
      }

      if (this.game.player.body.velocity.x == 0 && this.game.player.body.velocity.y == 0) {
          this.game.player.animations.play('idle', 10, true);
      }

      if (!this.game.player.body.touching.down) {
          this.game.player.animations.play('jump', 10, true);
      }


      if (this.game.time.totalElapsedSeconds() - this.game.player.lastMovement >= 0.015) {
        this.game.socket.emit('move player', { x: this.game.player.x, y: this.game.player.y, name: this.game.player.name });
        this.game.player.lastMovement = this.game.time.totalElapsedSeconds();
      }

      this.game.player.prevX = this.game.player.x;
      this.game.player.prevY = this.game.player.y;

    }

  };

  window['blockz'] = window['blockz'] || {};
  window['blockz'].Player = Player;

}());
