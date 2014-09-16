/*global io */
(function() {
  'use strict';

  function Game() {
    this.background = null;
    this.platforms = null;
    this.player = null;
    this.bullets = null;
    this.enemies = null;
    this.enemyNames = null;
    this.firerate = 100;
    this.nextFire = 0;
    this.socket = null;

    this.playerController = null;
  }

  Game.prototype = {

    create: function () {

      // Connect to socket.io
      this.setSocket();

      // Set physics
      this.physics.startSystem(Phaser.Physics.ARCADE);

      // Background
      this.stage.backgroundColor = 0xFFFFFF;
      //this.background = this.add.sprite(0, 0, 'white');
      //this.background.scale.setTo(this.world.width, this.world.height);

      // Platforms group
      this.platforms = this.add.group();
      this.platforms.enableBody = true;

      // The ground
      var ground = this.platforms.create(0, this.world.height - 10, 'black');
      ground.scale.setTo(64, 1);
      ground.body.immovable = true;

      // Some ledges to jump on
      var ledge = this.platforms.create(400, 250, 'black');
      ledge.scale.setTo(10, 1);
      ledge.body.immovable = true;

      ledge = this.platforms.create(0, 300, 'black');
      ledge.scale.setTo(10, 1);
      ledge.body.immovable = true;

      ledge = this.platforms.create(200, 150, 'black');
      ledge.scale.setTo(10, 1);
      ledge.body.immovable = true;

      // Create the player
      var player;
      this.playerController = new window['blockz'].Player(this);
      player = this.playerController.create(this);
      this.player = player.player;
      this.playerName = player.playerName;

      //console.log(this.game.Player);
      //this.game.Player.create();

      // Bullets
      this.bullets = this.add.group();
      this.bullets.enableBody = true;
      this.bullets.createMultiple(50, 'black');
      this.bullets.setAll('checkWorldBounds', true);
      this.bullets.setAll('outOfBoundsKill', true);

      // Enemies
      this.enemies = this.add.group();
      this.enemies.enableBody = true;

      // EnemyNames
      this.enemyNames = this.add.group();

    },

    update: function () {

      this.playerController.update();

      // Shoot!
      if (this.input.activePointer.isDown) {
        this.shoot();
      }

      // Kill bullets when they hit platforms
      this.physics.arcade.overlap(this.bullets, this.platforms, function (bullet) {
        bullet.kill();
      }, null, null);

      // Kill enemies when show
      this.physics.arcade.overlap(this.bullets, this.enemies, this.enemyShot, null, null);

    },

    shoot: function () {

      var bullet;

      // If shooting is allowed, SHOOT!
      if (this.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.time.now + this.firerate;

        bullet = this.bullets.getFirstDead();
        bullet.reset(this.player.x, this.player.y);
        this.physics.arcade.moveToPointer(bullet, 300);
      }

    },

    enemyShot: function (bullet, enemy) {

      // Decrease health
      enemy.health -= 20;

      // Kill the bullet
      bullet.kill();

      // If there's no health left, kill the enemy
      if (enemy.health <= 0) {
        enemy.kill();
      }

    },

    setSocket: function () {

      var self = this;

      this.socket = io.connect('http://localhost:62130');

      this.socket.on('connect', this.onSocketConnected);

      this.socket.on('new player', function (data) {
        self.onNewPlayer(data, self);
      });

      this.socket.on('moved player', function (data) {
        self.onPlayerMove(data, self);
      });

      this.socket.on('remove player', function (data) {
        self.removePlayer(data, self);
      });
    },

    onSocketConnected: function (data) {
      console.log('Connected to socket server!');
      console.log(data);
    },

    onNewPlayer: function (data, self) {

      if (data.id === self.socket.io.engine.id) {
      	return;
      }

      // Create the enemy
      var enemy = self.enemies.create(data.x, data.y, 'player');
      enemy.scale.setTo(0.25, 0.25);
      enemy.health = 100;
      enemy.id = data.id;
      enemy.body.collideWorldBounds = true;
      enemy.body.immovable = true;

      // Display enemy name
      var enemyName = this.add.text(data.x, data.y - 50, data.name, {
      	font: '12px Arial', fill: '#000000', align: 'center'
      }, this.enemyNames);

      enemyName.id = data.id;
      enemyName.x = enemy.x + (enemy.width / 2) - (enemy.width / 2);
      enemyName.y = enemy.y - 20;

    },

    onPlayerMove: function (data, self) {

      var i, enemy, enemyName;

      // Move the enemy
      for (i = 0; i < self.enemies.children.length; i++) {
        enemy = self.enemies.children[i];
        if (enemy.id === data.id) {
          self.add.tween(enemy).to({ x: data.x, y: data.y }, 15, Phaser.Easing.Linear.None, true);
          break;
        }
      }

      // Move the enemy name
      for (i = 0; i < self.enemyNames.children.length; i++) {
        enemyName = self.enemyNames.children[i];
        if (enemyName.id === data.id) {
          self.add.tween(enemyName).to({
            x: enemy.x + (enemy.width / 2) - (enemy.width / 2),
            y: enemy.y - 20
          }, 15, Phaser.Easing.Linear.None, true);
          break;
        }
      }

    },

    removePlayer: function (data, self) {

      var i, enemy;
      for (i = 0; i < self.enemies.children.length; i++) {
        enemy = self.enemies.children[i];
        if (enemy.id === data.id) {
          enemy.kill();
        }
      }
    }

  };

  window['blockz'] = window['blockz'] || {};
  window['blockz'].Game = Game;

}());
