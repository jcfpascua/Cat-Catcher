const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#001f3f', // dark blue base color
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
        update
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
    this.load.image('cat', 'assets/cat.png');
}

function create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Add the background image but DON'T clear backgroundColor
    bg = this.add.image(width / 2, height / 2, 'bg');
    bg.setDisplaySize(width, height);

    player = this.physics.add.sprite(width / 2, height - 50, 'player').setCollideWorldBounds(true);

    cats = this.physics.add.group({
        defaultKey: 'cat',
        collideWorldBounds: true
    });

    spawnCat(this);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    this.physics.add.overlap(player, cats, catchCat, null, this);

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

    this.physics.world.setBounds(0, 0, width, height - 50);
    player.body.setBoundsRectangle(0, 0, width, height - 50);

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

    if (Phaser.Math.Between(0, 100) < 2) {
        spawnCat(this);
    }
}

function spawnCat(scene) {
    const x = Phaser.Math.Between(50, scene.scale.width - 50);
    const cat = cats.create(x, 0, 'cat');
    cat.setVelocityY(Phaser.Math.Between(100, 200));
    cat.setCollideWorldBounds(true);
    cat.body.onWorldBounds = true;
    cat.setScale(0.1);
}

function catchCat(player, cat) {
    cat.destroy();
    score += 1;
    scoreText.setText('Score: ' + score);
    console.log('Score: ' + score);
    if (score === 10) {
        console.log('You win!');
    }

    if (score >= 10 && !gameOver) {
        gameOver = true;
        this.physics.pause();
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'YOU WIN!', {
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }
}
