Conf = ({
    gameW: 900,
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

    solidTiles: [2, 3],
    opaqueTiles: [3],

    FailState: {
        bgColor: 0x505050
    }
});
