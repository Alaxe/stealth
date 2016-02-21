PlayState = (function() {
    var PlayState = function() {};

    PlayState.prototype.preload = function() {
        game.load.spritesheet('player', 'assets/player.png', 
                    Conf.tileSize, Conf.tileSize);

        game.load.spritesheet('guard', 'assets/enemy.png', 
                    Conf.tileSize, Conf.tileSize);
        game.load.spritesheet('objects', 'assets/objects.png',
                    Conf.tileSize, Conf.tileSize);

        game.load.image('tiles', 'assets/tiles.png');
        game.load.tilemap('map', 'assets/level1.json', null,
                Phaser.Tilemap.TILED_JSON);

        game.load.json('guard_data', 'assets/level1-guards.json');

        game.load.bitmapFont('visitor', 'assets/visitor.png', 
                             'assets/visitor.fnt');
 
     };

    function createWorld() {
        var i = 0;

        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('tiles');
        this.map.setCollision(Conf.solidTiles);

        this.mapLayer = this.map.createLayer('level');
        this.mapLayer.resizeWorld();

        console.log(this.map);

        this.lighting = new Lighting(this.map);

        this.pickups = game.add.group();
        for (i = 0;i < Conf.Score.gids.length;i++) {
            this.map.createFromObjects('objects', Conf.Score.gids[i], 'objects', 
                                       i, true, false, this.pickups);
        }
        game.physics.enable(this.pickups, Phaser.Physics.ARCADE);

        this.exits = game.add.group();
        for (i = 0;i < Conf.exitGids.length;i++) {
            this.map.createFromObjects('objects', Conf.exitGids[i], 'objects',
                                       i + Conf.Score.gids.length, true, false,
                                       this.exits);
        }
    }

    function addHumans() {
        var guard,
            guard_data,
            i;

        this.player = new Player();
        this.player.x = (parseFloat(this.map.properties.spawnX) + 0.5) *
                Conf.tileSize;
        this.player.y = (parseFloat(this.map.properties.spawnY) + 0.5) *
                Conf.tileSize;

        game.camera.follow(this.player, 
            Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
        
        this.lighting.humans = [this.player];
        this.guards = game.add.group();

        guard_data = game.cache.getJSON('guard_data');
        for (i = 0;i < guard_data.length;i++) {
            guard = new Guard(guard_data[i]);
            this.lighting.humans.push(guard);
            this.lighting.addLight(guard.light);
            this.guards.add(guard);
        }
    }

    function addText() {
        this.score = game.add.bitmapText(0, 0, Conf.Font.name);
        this.score.fontSize = Conf.Font.size;
        this.score.tint = Conf.Font.color;

        this.score.num = 0;
        this.score.text = Conf.Score.scorePrefix + this.score.num.toString();

        this.score.fixedToCamera = true;
        this.score.cameraOffset.x = Conf.Score.offset;
        this.score.cameraOffset.y = Conf.Score.offset;


        this.target = game.add.bitmapText(0, 0, Conf.Font.name);
        this.target.fontSize = Conf.Font.size;
        this.target.tint = Conf.Font.color;

        this.target.num = this.map.properties.targetGold;
        this.target.text = Conf.Score.targetPrefix + this.target.num;

        this.target.fixedToCamera = true;
        this.target.cameraOffset.x = Conf.Score.offset;
        this.target.cameraOffset.y = this.score.height + 2 * Conf.Score.offset;

        this.info = game.add.bitmapText(0, 0, Conf.Font.name);
        this.info.fontSize = Conf.Font.size;
        this.info.tint = Conf.Font.color;
        this.info.maxWidth = Conf.Info.maxWidth;
        this.info.fixedToCamera = true;
        //this.helpText.time = 0;
        //this.helpText.text = 'biai';
    }
    

    PlayState.prototype.create = function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        createWorld.call(this);
        addHumans.call(this);
        game.world.bringToTop(this.lighting.group);

        addText.call(this);
        this.action = game.input.keyboard.addKey(Conf.action);
    };
    function checkExits() {
        var i = 0,
            exits = this.exits.children;

        for (i = 0;i < exits.length;i++) {
            if (exits[i].overlap(this.player)) {
                if (this.score.num < this.target.num) {
                    setInfo.call(this, Conf.Info.moreGold, 0.5);
                } else {
                    setInfo.call(this, Conf.Info.canExit, 0.5);
                    if (this.action.isDown) {
                        game.state.start('Beaten', true, false, this.score.num);
                        console.log('GG');
                    }
                }
            }
        }
    }
    function pickupCoin(player, pickup) {
        pickup.kill();
        this.score.num += Conf.Score.points[pickup.frame];
        this.score.text = Conf.Score.scorePrefix + this.score.num.toString();
        if (this.score.num >= this.target.num) {
            this.score.tint = this.target.tint = Conf.Score.colorReached;
        }

    }
    function handleCollisions() {
        game.physics.arcade.collide(this.player, this.mapLayer);
        game.physics.arcade.collide(this.player, this.guards);

        game.physics.arcade.collide(this.player, this.pickups, pickupCoin, null,
                                    this);
    }
    function setInfo(text, time) {
        if (time === null) {
            this.info.time = Infinity;
        } else {
            this.info.time = time * 1000;
        } 
        this.info.visible = true;
        this.info.text = text;
        this.info.cameraOffset.y = Conf.gameH - this.info.height - 
                Conf.Font.margin.bottom;
        this.info.cameraOffset.x = (Conf.gameW - this.info.width) * 0.5;
    }
    function updateHud() {
        this.info.time -= game.time.physicsElapsedMS;
        if (this.info.time < 0) {
            this.info.text = '';
        }
    }
    
    PlayState.prototype.update = function() {
        handleCollisions.call(this);
        checkExits.call(this);
        updateHud.call(this);

        this.lighting.update();
    };

    return PlayState;
}());
