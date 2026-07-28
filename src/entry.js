const WIDTH = 640;
const HEIGHT = 800;
const GRAVITATION = 500;
const VELOCITY_Y = GRAVITATION - 100;

class GameScene extends Phaser.Scene {
    preload() {
        const assets = "public/assets/images";
        this.load.image("bgGame", `${assets}/background/background_play.png`);
        this.load.image("staticTile", `${assets}/tiles/tile_static.png`);
        //player
        this.load.image("playerLeft", `${assets}/player/left.png`);
        this.load.image("playerLeftJump", `${assets}/player/left_jump.png`);
        this.load.image("playerRight", `${assets}/player/right.png`);
        this.load.image("playerRightJump", `${assets}/player/right_jump.png`);
        this.load.image("playerShoot", `${assets}/player/shoot.png`);
        this.load.image("playerShootJump", `${assets}/player/shoot_jump.png`);
    }

    create() {
        //Добавил фон
        this.add.image(0, 0, "bgGame").setOrigin(0, 0);

        //Создал платформу
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(WIDTH / 2, HEIGHT / 2, "staticTile");

        //Создал игрока
        this.player = this.physics.add.sprite(WIDTH / 2, HEIGHT / 2 - 80, "playerRight");
        //Установка габаритов игровой модели
        this.player.setSize(40, 60);

        //collider - создаёт столкновение между игроком и платформой.
        this.physics.add.collider(this.player, this.platforms, this.infinityJumpHandler);

        //создание объекта кнопок
        this.button = this.input.keyboard.createCursorKeys();
    }

    update() {
        this.handlePlayerInput();
    }

    handlePlayerInput() {
        if (this.button.left.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocityX(-160);
        } else if (this.button.right.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocityX(160);
        } else if (this.button.up.isDown) {
            this.player.setTexture("playerShoot");
        } else {
            this.player.setTexture("playerRight");
            this.player.setVelocityX(0);
        }
    }

    infinityJumpHandler(player, platform) {
        if (player.y < platform.y) {
            player.setVelocityY(-VELOCITY_Y);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: GRAVITATION},
            debug: false,
        },
    },
    scene: GameScene,
};

const game = new Phaser.Game(config);
