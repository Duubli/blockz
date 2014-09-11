(function() {
  'use strict';

  function Game() {
    this.player = null;
    this.background = null;
    this.platforms = null;
    this.bullets = null;
    this.enemies = null;
    this.firerate = 100;
    this.nextFire = 0;
    this.socket = null;
  }

  Game.prototype = {

    create: function () {

    	this.setSocket();

      // Set physics
      this.physics.startSystem(Phaser.Physics.ARCADE);

      // Background
      this.background = this.add.sprite(0, 0, 'white');
      this.background.scale.setTo(this.world.width, this.world.height);

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

      // Create the player
      this.player = this.add.sprite(420, 0, 'player');
      this.player.scale.setTo(0.25, 0.25);
      this.game.physics.arcade.enable(this.player);

      this.player.body.bounce.y = 0.2;
      this.player.body.gravity.y = 1000;
      this.player.body.collideWorldBounds = true;

      this.player.lastMovement = this.time.totalElapsedSeconds();

      this.socket.emit("new player", { x: this.player.x, y: this.player.y });

      // Bullets
      this.bullets = this.add.group();
      this.bullets.enableBody = true;
      this.bullets.createMultiple(50, 'black');
      this.bullets.setAll('checkWorldBounds', true);
      this.bullets.setAll('outOfBoundsKill', true);

      // Enemies
      this.enemies = this.add.group();
      this.enemies.enableBody = true;

    },

    update: function () {

      // Move the player
      this.movePlayer();

      // Shoot!
      if (this.input.activePointer.isDown) {
        this.shoot();
      }

      // Kill bullets when they hit platforms
      this.physics.arcade.overlap(this.bullets, this.platforms, function (bullet, platform) {
        bullet.kill();
      }, null, null);

      // Kill enemies when show
      this.physics.arcade.overlap(this.bullets, this.enemies, this.enemyShot, null, null);

    },

    movePlayer: function () {

      var leftKey = Phaser.Keyboard.A,
      rightKey = Phaser.Keyboard.D,
      upKey = Phaser.Keyboard.W;

      // Collide with platforms
      this.physics.arcade.collide(this.player, this.platforms);

      // Collied with enemies
      this.physics.arcade.collide(this.player, this.enemies);

      // Reset velocity
      this.player.body.velocity.x = 0;

      // Move left
      if (this.input.keyboard.isDown(leftKey)) {
        this.player.body.velocity.x = -150;
      }
      // Move right
      else if (this.input.keyboard.isDown(rightKey)) {
        this.player.body.velocity.x = 150;
      }

      // Jump!
      // console.log(this.player.body.touching.down);
      if (this.input.keyboard.isDown(upKey) && this.player.body.touching.down) {
        this.player.body.velocity.y = -600;
      }

      if (this.time.totalElapsedSeconds() - this.player.lastMovement >= 0.1) {
        this.socket.emit("move player", { x: this.player.x, y: this.player.y });
        this.player.lastMovement = this.time.totalElapsedSeconds();
      }

      this.player.prevX = this.player.x;
      this.player.prevY = this.player.y;

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
    },

    onNewPlayer: function (data, self) {

      if (data.id === self.socket.io.engine.id) {
      	return;
      }
      var enemy = self.enemies.create(data.x, data.y, 'player');
      enemy.scale.setTo(0.25, 0.25);
      enemy.health = 100;
      enemy.id = data.id;
      enemy.body.collideWorldBounds = true;
      enemy.body.immovable = true;

    },

    onPlayerMove: function (data, self) {

      var i, enemy;

      for (i = 0; i < self.enemies.children.length; i++) {
        enemy = self.enemies.children[i];
        if (enemy.id == data.id) {
          self.add.tween(enemy).to({ x: data.x, y: data.y }, 100, Phaser.Easing.Linear.None, true);
          return;
        }
      }

    },

    removePlayer: function (data, self) {

      var i, enemy;
      for (i = 0; i < self.enemies.children.length; i++) {
        enemy = self.enemies.children[i];
        if (enemy.id == data.id) {
          enemy.kill();
        }
      }
    }

  };

  window['blockz'] = window['blockz'] || {};
  window['blockz'].Game = Game;

}());
