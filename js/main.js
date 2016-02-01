(function() {
    this.game = new Phaser.Game(Conf.gameW, Conf.gameH, Phaser.AUTO, '');

    game.state.add('PlayState', new PlayState());
    game.state.add('FailState', new FailState());
    game.state.start('PlayState');
})();
