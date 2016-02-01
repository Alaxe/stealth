Human = (function () {
    var Human = function (pSpriteKey, pX, pY) {
        var x = pX || 0;
        var y = pY || 0;

        //calling the Sprite constructor

        Phaser.Sprite.call(this, game, x, y, pSpriteKey);

        this.animations.add('walk', [0, 1, 2, 3], 10, true);
        this.anchor.setTo(0.5, 0.5);

        game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.collideWorldBounds = true;

        this.body.setSize(this.width * Conf.Human.size, 
                this.height * Conf.Human.size, 0, 0);

        this.speed = Conf.Human.speed;

        game.add.existing(this);
    };

    Human.prototype = Object.create(Phaser.Sprite.prototype);
    Human.prototype.constructor = Human;

    Human.prototype.walk = function(x, y) {
        var vel;
        this.animations.play('walk');

        if (x instanceof Phaser.Point) {
            vel = new Phaser.Point(x.x, x.y);
        } else {
            vel = new Phaser.Point(x, y);
        }

        vel.normalize().multiply(this.speed, this.speed);

        this.body.velocity.setTo(vel.x, vel.y);
        this.rotation = Math.atan2(vel.y, vel.x);
    };
    Human.prototype.stop = function () {
        this.animations.play('walk');

        this.body.velocity.setTo(0, 0);
        this.animations.stop();
        this.frame = 0;
    };

    Human.prototype.getBodyCorners = function() {
        return [
            new Phaser.Point(this.body.x, this.body.y),
            new Phaser.Point(this.body.x + this.body.width, this.body.y),
            new Phaser.Point(this.body.x, this.body.y + this.body.height),
            new Phaser.Point(this.body.x + this.body.width,
                             this.body.y + this.body.height)
        ];
    };
    Human.prototype.getSpriteCorners = function() {
        return [
            new Phaser.Point(this.x - this.width * 0.5,
                             this.y - this.height * 0.5),
            new Phaser.Point(this.x + this.width * 0.5,
                             this.y - this.height * 0.5),
            new Phaser.Point(this.x - this.width * 0.5,
                             this.y + this.height * 0.5),
            new Phaser.Point(this.x + this.width * 0.5,
                             this.y + this.height * 0.5)
        ];
    };

    Human.prototype.getBodySides = function() {
        var cor = this.getBodyCorners();
        return [
            new Phaser.Line(cor[0].x, cor[0].y, cor[1].x, cor[1].y),
            new Phaser.Line(cor[2].x, cor[2].y, cor[3].x, cor[3].y),
            new Phaser.Line(cor[0].x, cor[0].y, cor[2].x, cor[2].y),
            new Phaser.Line(cor[1].x, cor[1].y, cor[3].x, cor[3].y)
        ];
    };

    return Human;
}());

Player = (function() {
    var Player = function (pSpriteKey) {
        var spriteKey = pSpriteKey || 'player';

        Human.call(this, spriteKey);

        this.cursors = game.input.keyboard.createCursorKeys();
        this.x = this.y = 300;
    };
    
    Player.prototype = Object.create(Human.prototype);
    Player.constructor = Player;

    Player.prototype.update = function () {
        if(this.cursors.up.isDown) {
            this.walk(0, -1);
        } else if(this.cursors.down.isDown) {
            this.walk(0, 1);
        } else if(this.cursors.left.isDown) {
            this.walk(-1, 0);
        } else if(this.cursors.right.isDown) {
            this.walk(1, 0);
        } else {
            this.stop();
        }
    };

    return Player;
}());

Guard = (function() {
    var Guard = function (conf) {
        Human.call(this, 'guard');

        this.path = conf.path;
        for(var i = 0;i < this.path.length;i++) {
            this.path[i].pos = new Phaser.Point(this.path[i].pos.x, 
                                this.path[i].pos.y);

            this.path[i].pos.add(0.5, 0.5);
            this.path[i].pos.multiply(Conf.tileSize, Conf.tileSize);

            this.path[i].wait = this.path[i].wait || 0;
        }

        this.x = this.path[0].pos.x;
        this.y = this.path[0].pos.y;

        this.lastPoint = 0;
        this.waitTime = this.path[0].wait;
        
        this.speed = Conf.Guard.speed;
        this.body.immovable = true;

        this.light = new Light(this.x, this.y, Conf.Guard.fov, 
                               Conf.Guard.range, 0.5);
        this.spotted = 0;
    };

    Guard.prototype = Object.create(Human.prototype);
    Guard.prototype.constructor = Guard;

    function followPath() {
        var nextPoint = this.lastPoint + 1,
            deltaT = game.time.elapsedMS * 0.001,
            curDist = deltaT * this.speed,
            nextPos,
            delta,
            step = new Phaser.Point();

        if (nextPoint == this.path.length) {
            nextPoint = 0;
        }

        if (nextPoint == this.lastPoint) {
            this.stop();
            if (this.path[nextPoint].rotation !== undefined) {
                this.rotation = this.path[nextPoint].rotation * Math.PI;
            }
        } else if (this.waitTime > 0) {
            this.stop();
            this.waitTime -= deltaT;
        } else {
            nextPos = this.path[nextPoint].pos.clone();
            delta = nextPos.clone().subtract(this.x, this.y);

            if (delta.getMagnitude() < curDist) {
                this.x = nextPos.x;
                this.y = nextPos.y;

                this.stop();

                //this.velocity.setTo(0, 0);

                this.lastPoint = nextPoint;
                this.waitTime = this.path[nextPoint].wait;

                if (this.path[nextPoint].rotation !== undefined) {
                    this.rotation = this.path[nextPoint].rotation * Math.PI;
                }
            } else {
                this.walk(delta);
            }
        }
    }
    function getLightColor() {
        var awns = 0x000000,
            mask = 0xFF,
            curComp = 0,
            i = 0;


        if (this.spotted <= 0) {
            this.spotted = 0;
            return Conf.Guard.Light.okColor;
        }


        for (i = 0;i < 3;i++) {
            mask = (0xFF) << (i * 8);

            curComp = (Conf.Guard.Light.warnColor & mask) >> (i * 8);
            curComp *= (1 - this.spotted);
            curComp = curComp << (i * 8);
            awns += curComp;

            curComp = (Conf.Guard.Light.dangColor & mask) >> (i * 8);
            curComp *= this.spotted;
            curComp = curComp << (i * 8);
            awns += curComp;
        }

        return awns;
    }
    function updateLight() {
        var playerCorners = game.state.getCurrentState().player
                            .getSpriteCorners(),
            i = 0,
            deltaT = game.time.physicsElapsed,
            color = 0x000000;
            playerVisible = false;

        this.light.x = this.x + this.body.deltaX();
        this.light.y = this.y + this.body.deltaY();
        this.light.rotation = this.rotation;

        this.light.cast();
        
        for (i = 0;i < playerCorners.length;i++) {
            if (this.light.pointVisible(playerCorners[i])) {
                playerVisible = true;
                break;
            }
        }

        if (playerVisible) {
            this.spotted += deltaT / Conf.Guard.spotTime;
        } else {
            this.spotted -= deltaT / Conf.Guard.forgetTime;
        }

        if (this.spotted >= 1) {
            game.state.start('FailState');
        }

        this.light.lightArea.tint = getLightColor.call(this);
    }



    Guard.prototype.update = function() {
        followPath.call(this);
        updateLight.call(this);
    };

    return Guard;
}());
