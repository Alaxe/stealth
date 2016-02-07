PlayState = (function() {
    var PlayState = function() {};

    PlayState.prototype.preload = function() {
        game.load.spritesheet('player', 'assets/player.png', 
                    Conf.tileSize, Conf.tileSize);

        game.load.spritesheet('guard', 'assets/enemy.png', 
                    Conf.tileSize, Conf.tileSize);
        game.load.spritesheet('coins', 'assets/coins.png',
                    Conf.tileSize, Conf.tileSize);

        game.load.image('tiles', 'assets/tiles.png');
        game.load.tilemap('map', 'assets/map.json', null,
                Phaser.Tilemap.TILED_JSON);

        game.load.json('guard_data', 'assets/guard_paths.json');
    };

    function createWorld() {
        var i = 0;
        game.stage.backgroundColor = "00ff00";
        
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('tiles');
        this.map.setCollision(Conf.solidTiles);

        this.mapLayer = this.map.createLayer('level');
        this.mapLayer.resizeWorld();

        this.lighting = new Lighting(this.map);

        this.pickups = game.add.group();
        for (i = 0;i < Conf.Coins.gids.length;i++) {
            this.map.createFromObjects('coins', Conf.Coins.gids[i], 'coins', 
                                       i, true, false, this.pickups);
        }
        game.physics.enable(this.pickups, Phaser.Physics.ARCADE);
        console.log(this.pickups);
    }

    function addHumans() {
        var guard,
            guard_data,
            i;

        this.player = new Player();
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
    PlayState.prototype.create = function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        createWorld.call(this);
        addHumans.call(this);
        
        game.world.bringToTop(this.lighting.group);
    };

    function handleCollisions() {
        game.physics.arcade.collide(this.player, this.mapLayer);
        game.physics.arcade.collide(this.player, this.guards);

        game.physics.arcade.collide(this.player, this.pickups, function(player, pickup) {
            pickup.kill();
            console.log(Conf.Coins.score[pickup.frame]);
        });
    }
    
    PlayState.prototype.update = function() {
        handleCollisions.call(this);
        this.lighting.update();
    };

    return PlayState;
}());
