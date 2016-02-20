BeatenState = (function() {
    var BeatenState = function() {};

    BeatenState.prototype.preload = function() {
        game.stage.backgroundColor = Conf.BeatenState.bgColor;

        game.load.bitmapFont(Conf.Font.name, 'assets/visitor.png', 
                             'assets/visitor.fnt');
    };

    BeatenState.prototype.init = function(score) {
        this.text = game.add.bitmapText(0, 0, Conf.Font.name);
        this.text.fontSize = Conf.Font.size;
        this.text.text = Conf.BeatenState.text.replace('<score>', score);
        this.text.tint = Conf.BeatenState.textColor;
        this.text.align = 'center';

        this.text.x = (Conf.gameW - this.text.width) * 0.5;
        this.text.y = (Conf.gameH - this.text.height) * 0.5;
        
        this.action = game.input.keyboard.addKey(Conf.action);
        this.action.onDown.add(function() {
            game.state.start('Play');
        });
    };

    return BeatenState;
}) ();
