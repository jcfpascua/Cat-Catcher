const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update,
        resize
    }
};

const game = new Phaser.Game(config);

let player;
let cats;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;
let bg;

function preload() {
    this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    });
    this.load.image('cat', 'cat.png');
}

function create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Add background image and scale it
    bg = this.add.tileSprite(0, 0, width, height, 'bg').setOrigin(0, 0);
    bg.setScrollFactor(0);

    // Create player
    player = this.physics.add.sprite(width / 2, height - 50, 'player').setCollideWorldBounds(true);

    // Create group for falling cats
    cats = this.physics.add.group({
        defaultKey: 'cat',
        bounceY: 0.2,  // Can be set to 0 if you want no bounce
        collideWorldBounds: true
    });

    // Initial cat spawn
    spawnCat(this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    scoreText.setScrollFactor(0);

    // Detect overlap between player and cats
    this.physics.add.overlap(player, cats, catchCat, null, this);

    // Player animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Set world bounds and player boundaries
    this.physics.world.setBounds(0, 0, width, height - 50);
    player.body.setBoundsRectangle(0, 0, width, height - 50);

    // Set up resize event listener
    this.scale.on('resize', resize, this);

    // Destroy cat when it reaches the bottom
    this.physics.world.on('worldbounds', function(body, up, down, left, right) {
        if (body.gameObject.texture.key === 'cat' && down) {
            body.gameObject.destroy();
        }
    });
}

function update() {
    if (gameOver) {
        return;
    }

    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    // Spawn new cats randomly
    if (Phaser.Math.Between(0, 100) < 2) {
        spawnCat(this);
    }
}

function spawnCat(scene) {
    const x = Phaser.Math.Between(50, scene.scale.width - 50);
    const cat = cats.create(x, 0, 'cat');
    cat.setVelocityY(Phaser.Math.Between(100, 200)); // Set the fall speed of the cats
    cat.setCollideWorldBounds(true);
    cat.body.onWorldBounds = true; // Enable world bounds check for this cat
    cat.setScale(0.1);
}

function catchCat(player, cat) {
    cat.destroy();
    score += 1;
    scoreText.setText('Score: ' + score);

    if (score >= 10 && !gameOver) {
        gameOver = true;
        this.physics.pause();
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'YOU WIN!', {
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }
}

function resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    if (bg) {
        bg.setSize(width, height); // Resize background to fit screen
    }

    if (player) {
        player.setPosition(width / 2, height - 50);
        this.physics.world.setBounds(0, 0, width, height - 50);
        player.body.setBoundsRectangle(0, 0, width, height - 50);
    }

    if (this.scene.isActive()) {
        const winText = this.scene.children.list.find(obj => obj.text === 'YOU WIN!');
        if (winText) {
            winText.setPosition(width / 2, height / 2); // Adjust "YOU WIN!" text position on resize
        }
    }
}
