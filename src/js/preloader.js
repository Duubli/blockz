(function() {
	'use strict';

	function Preloader() {
		this.asset = null;
		this.ready = false;
	}

	Preloader.prototype = {

		preload: function () {

			// Create the preload prite
			this.asset = this.add.sprite(320, 240, 'preloader');
			this.asset.anchor.setTo(0.5, 0.5);

			// The loaded event
			this.load.onLoadComplete.addOnce(this.onLoadComplete, this);

			// Set preload sprite
			this.load.setPreloadSprite(this.asset);

			// Load all other images
			this.load.image('player', 'assets/player.png');
			this.load.image('black', 'assets/black.png');
			this.load.image('white', 'assets/white.png');

			// The font
			this.load.bitmapFont('minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml');
		},

		create: function () {
			this.asset.cropEnabled = false;
		},

		update: function () {
			// Go to the "menu" when loaded
			if (!!this.ready) {
				this.game.state.start('menu');
			}
		},

		onLoadComplete: function () {
			this.ready = true;
		}
	};

	window['blockz'] = window['blockz'] || {};
	window['blockz'].Preloader = Preloader;

}());
