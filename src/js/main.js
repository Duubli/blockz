window.onload = function () {
  'use strict';

  var game,
      ns = window['blockz'],
      w = window.innerWidth, h = window.innerHeight;

  game = new Phaser.Game(w, h, Phaser.AUTO, 'blockz-game');

  game.state.add('boot', ns.Boot);
  game.state.add('preloader', ns.Preloader);
  game.state.add('menu', ns.Menu);
  game.state.add('game', ns.Game);

  game.state.start('boot');
};
