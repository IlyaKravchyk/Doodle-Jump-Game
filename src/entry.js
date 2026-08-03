const WIDTH = 640;
const HEIGHT = 800;
const GRAVITATION = 500;
const VELOCITY_Y = GRAVITATION - 130;

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
        this.isShooting = false;
        this.dynamicHeightPlatform = HEIGHT - 100;

        //Добавил фон
        this.add.image(0, 0, "bgGame").setOrigin(0, 0);

        //Создал группу платформ
        this.platforms = this.physics.add.staticGroup();

        //Создал игрока
        this.player = this.physics.add.sprite(WIDTH / 2, HEIGHT / 2 - 80, "playerRight");
        //Установка габаритов игровой модели
        this.player.setSize(40, 50);
        this.player.setOffset(0, 10);
        this.player.setCollideWorldBounds(true);

        //collider - создаёт столкновение между игроком и платформой.
        this.physics.add.collider(this.player, this.platforms, this.infinityJumpHandler, this.checkJumpDirection, this);

        //создание объекта кнопок
        this.button = this.input.keyboard.createCursorKeys();

        this.createFirstPlatform();
        this.randomGeneratePlatforms();
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
        } else if (Phaser.Input.Keyboard.JustDown(this.button.up) && !this.isShooting) {
            this.shootingHandler();
        } else {
            this.player.setVelocityX(0);
        }
        if (!this.isShooting) {
            this.player.setTexture("playerRight");
        }
    }

    checkJumpDirection(player, platforms) {
        return player.body.velocity.y > 0;
    }

    infinityJumpHandler(player, platform) {
        if (player.y < platform.y) {
            player.setVelocityY(-VELOCITY_Y);
        }
    }

    shootingHandler() {
        this.isShooting = true;
        this.player.setTexture("playerShoot");
        this.time.delayedCall(200, () => {
            this.isShooting = false;
        });
    }

    createFirstPlatform() {
        const firstPlatform = this.platforms.create(WIDTH / 2, HEIGHT / 2, "staticTile");
        firstPlatform.body.checkCollision.right = false;
        firstPlatform.body.checkCollision.down = false;
        firstPlatform.body.checkCollision.left = false;
        firstPlatform.refreshBody();
    }

    randomGeneratePlatforms() {
        for (let i = 10; i >= 0; i--) {
            const x = Phaser.Math.Between(50, WIDTH - 50);
            this.dynamicHeightPlatform -= Phaser.Math.Between(50, 130);
            const platform = this.platforms.create(x, this.dynamicHeightPlatform, "staticTile");
            platform.body.checkCollision.right = false;
            platform.body.checkCollision.down = false;
            platform.body.checkCollision.left = false;
            platform.refreshBody();
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
