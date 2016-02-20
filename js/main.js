(function() {
    this.game = new Phaser.Game(Conf.gameW, Conf.gameH, Phaser.AUTO, '');

    game.state.add('Play', new PlayState());
    game.state.add('Beaten', new BeatenState());
    game.state.add('Fail', new FailState());
    game.state.start('Play');
})();
