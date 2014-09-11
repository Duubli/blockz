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
	}

	Game.prototype = {

		create: function () {
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

			// Bullets
			this.bullets = this.add.group();
			this.bullets.enableBody = true;
			this.bullets.createMultiple(50, 'black');
			this.bullets.setAll('checkWorldBounds', true);
			this.bullets.setAll('outOfBoundsKill', true);

			// Enemies
			this.enemies = this.add.group();
			this.enemies.enableBody = true;

			var enemy = this.enemies.create(20, 275, 'player');
			enemy.scale.setTo(0.2, 0.2);
			enemy.health = 100;
			enemy.body.immovable = true;

			enemy = this.enemies.create(200, 445, 'player');
			enemy.scale.setTo(0.2, 0.2);
			enemy.health = 100;
			enemy.body.immovable = true;



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

		}

	};

	window['blockz'] = window['blockz'] || {};
	window['blockz'].Game = Game;

}());
