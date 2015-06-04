(function() {
  'use strict';

  function Game() {
    this.background = null;
    this.platforms = null;
    this.player = null;
    this.bullets = null;
    this.enemies = null;
    this.firerate = 300;
    this.nextFire = 0;
    this.socket = null;

    this.playerController = null;
  }

  Game.prototype = {

    create: function () {

      // Connect to socket.io
      this.setSocket();

      // Create the game world
      this.world.setBounds(0, 0, 1920, 480);

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
      var ground = this.add.tileSprite(0, this.world.height - 10, this.world.width, 10, 'black');
      this.physics.enable(ground, Phaser.Physics.ARCADE);
      ground.body.collideWorldBounds = true;
      ground.body.immovable = true;
      this.platforms.add(ground);

      /*
      var ground = this.platforms.create(0, this.world.height - 10, 'black');
      ground.scale.setTo(64, 1);
      ground.body.immovable = true;
      */

      // Some ledges to jump on
      var ledge1 = this.add.tileSprite(400, 250, 100, 10, 'black');
      this.physics.enable(ledge1, Phaser.Physics.ARCADE);
      ledge1.body.immovable = true;

      var ledge2 = this.add.tileSprite(0, 300, 100, 10, 'black');
      this.physics.enable(ledge2, Phaser.Physics.ARCADE);
      ledge2.body.immovable = true;

      var ledge3 = this.add.tileSprite(200, 150, 100, 10, 'black');
      this.physics.enable(ledge3, Phaser.Physics.ARCADE);
      ledge3.body.immovable = true;

      this.platforms.addMultiple([ledge1, ledge2, ledge3]);

      /*
      this.platforms.add(ledge);
      var ledge = this.platforms.create(400, 250, 'black');
      ledge.scale.setTo(10, 1);
      ledge.body.immovable = true;

      var ledge = this.platforms.create(0, 300, 'black');
      ledge.scale.setTo(10, 1);
      ledge.body.immovable = true;

      ledge = this.platforms.create(200, 150, 'black');
      ledge.scale.setTo(10, 1);
      ledge.body.immovable = true;
      */

      // Create the player
      this.playerController = new window['blockz'].Player(this);
      this.player = this.playerController.create(this);
      this.camera.follow(this.player);

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

//      var bullet;

      this.player.weapon.animations.play('fire', 20, false);
      console.log(this.player);



      // If shooting is allowed, SHOOT!
    //   if (this.time.now > this.nextFire && this.bullets.countDead() > 0) {
    //     this.nextFire = this.time.now + this.firerate;
      //
    //     bullet = this.bullets.getFirstDead();
    //     bullet.reset(this.player.x, this.player.y);
    //     this.physics.arcade.moveToPointer(bullet, 300);
    //   }

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
      enemy.health = 100;
      enemy.id = data.id;
      enemy.body.collideWorldBounds = true;
      enemy.body.immovable = true;

      // Display enemy name
      var enemyName = this.add.text(0, -50, data.name, {
      	font: '40px Arial', fill: '#000000', align: 'center'
      });
      enemyName.x = enemy.width / 2 - enemyName.width / 2;
      enemy.addChild(enemyName);

      // Scale the enemy to be a bit smaller
      enemy.scale.setTo(0.25, 0.25);

    },

    onPlayerMove: function (data, self) {

      var i, enemy;

      // Move the enemy
      for (i = 0; i < self.enemies.children.length; i++) {
        enemy = self.enemies.children[i];
        if (enemy.id === data.id) {
          self.add.tween(enemy).to({ x: data.x, y: data.y }, 15, Phaser.Easing.Linear.None, true);
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
