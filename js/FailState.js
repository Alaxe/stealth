FailState = (function() {
    var FailState = function() {};

    FailState.prototype.preload = function() {
        game.stage.backgroundColor = Conf.FailState.bgColor;

        game.load.bitmapFont('visitor', 'assets/visitor.png', 
                             'assets/visitor.fnt');
    };
    FailState.prototype.create = function() {
        this.text = game.add.bitmapText(0, 0, 'visitor', '', 48);
        this.text.setText('You have been spotted!\n\n' + 
                          'Press space to restart');
        this.text.align = 'center';

        this.text.x = (Conf.gameW - this.text.width) * 0.5;
        this.text.y = (Conf.gameH - this.text.height) * 0.4;
        this.text.tint = 0xFF2020;

        this.key = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        this.key.onDown.add(function() {
            game.state.start('PlayState');
        });
    };




    return FailState;
}) ();

