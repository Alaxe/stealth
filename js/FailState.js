FailState = (function() {
    var FailState = function() {};

    FailState.prototype.preload = function() {
        game.stage.backgroundColor = Conf.FailState.bgColor;

        game.load.bitmapFont('visitor', 'assets/visitor.png', 
                             'assets/visitor.fnt');
    };
    FailState.prototype.create = function() {
        this.text = game.add.bitmapText(0, 0, 'visitor', '', 48);
        this.text.text = Conf.FailState.text;
        this.text.fontSize = Conf.Font.size;

        this.text.x = (Conf.gameW - this.text.width) * 0.5;
        this.text.y = (Conf.gameH - this.text.height) * 0.4;
        this.text.tint = Conf.FailState.textColor;

        this.key = game.input.keyboard.addKey(Conf.action);
        this.key.onDown.add(function() {
            game.state.start('Play');
        });
    };

    return FailState;
}) ();

