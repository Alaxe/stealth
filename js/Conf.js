Conf = ({
    gameW: 800,
    gameH: 450,
    tileSize: 32,

    Human: {
        speed: 300,
        size: 0.9
    },
    Guard: {
        speed: 200,
        fov: Math.PI * 0.5,
        range: 5,
        Light: {
            okColor: 0x505050,
            warnColor: 0x606000,
            dangColor: 0xA00000
        },
        spotTime: 0.5,
        forgetTime: 2
    },
    Lighting: {
        lightColor: 0x444444,
        shadowColor: 0xAAAAAA
    },
    Score: {
        targetPrefix: 'needed: ',
        scorePrefix: 'gold: ',
        colorReached: 0x00FF00,
        offset: 5,
        gids: [6, 7],
        points: [1, 5]
    },
    Font: {
        name: 'visitor',
        size: 30,
        color: 0xFFFFFF,
        margin: {
            bottom: 50
        }
    },
    Info: {
        moreGold: 'You need to steal more gold before leaving',
        canExit: 'Press SPACE to exit the level, or try to steal more',
        maxWidth: 500
    },
    action: Phaser.KeyCode.SPACEBAR,

    exitGids: [8],
    solidTiles: [2, 3],
    opaqueTiles: [3],

    FailState: {
        text: 'You have been spotted!\n\n' + 
              'Press space to restart',
        textColor: 0xFF2020,
        bgColor: 0x505050
    },
    BeatenState: {
        text: 'You have passed the level successfully\n' +
              'Gold stolen: <score>\n' +   
              'Press SPACE to restart',
        textColor: 0x20FF20,
        bgColor: 0x505050
    }

});
