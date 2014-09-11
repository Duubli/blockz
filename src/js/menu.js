(function() {

	'use strict';

	function Menu() {
		this.titleTxt = null;
		this.startTxt = null;
	}

	Menu.prototype = {

		create: function () {

			var x = this.game.width / 2,
					y = this.game.height / 2;

			// Title text
			this.titleTxt = this.add.bitmapText(x, y, 'minecraftia', 'BLOCKZ!!1' );
			this.titleTxt.align = 'center';
			this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;

			// Start button
			y = y + this.titleTxt.height + 5;
			this.startTxt = this.add.bitmapText(x, y, 'minecraftia', 'JOIN');
			this.startTxt.align = 'center';
			this.startTxt.x = this.game.width / 2 - this.startTxt.textWidth / 2;

			// Add click event to start the game
			this.input.onDown.add(this.onDown, this);
		},

		update: function () {

		},

		onDown: function () {
			// It's a GO!
			this.game.state.start('game');
		}
	};

	window['blockz'] = window['blockz'] || {};
	window['blockz'].Menu = Menu;

}());
