const WIDTH = 640;
const HEIGHT = 800;
const GRAVITATION = 500;
const VELOCITY_Y = GRAVITATION - 130;
const VELOCITY_X = 180;

const hardK = 0.85;

const timeFlyToTop = VELOCITY_Y / GRAVITATION;
const fullTimeFly = timeFlyToTop * 2;

const MAX_JUMP_Y = (VELOCITY_Y ** 2 / (2 * GRAVITATION)) * hardK;
const MAX_JUMP_X = fullTimeFly * VELOCITY_X;

const MAX_GAP_X = 0;

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
        this.lastPlatformY = HEIGHT - 100;
        this.lastPlatformX = WIDTH / 2;

        //Добавил фон setScrollFactor(0) привязывает фон к камере
        this.add.image(0, 0, "bgGame").setOrigin(0, 0).setScrollFactor(0);

        //Создал группу платформ
        this.platforms = this.physics.add.staticGroup();

        //Создал игрока
        this.player = this.physics.add.sprite(WIDTH / 2, HEIGHT - 100 - 80, "playerRight");

        //Установил hits игрока
        this.player.setSize(35, 50);
        this.player.setOffset(13.5, 10);

        //Создал порог выше которого камера будет подниматься 800 * 0,35 = 280
        this.cameraTrashold = HEIGHT * 0.35;

        //collider - создаёт столкновение между игроком и платформой.
        this.physics.add.collider(this.player, this.platforms, this.infinityJumpHandler, this.checkJumpDirection, this);

        //создание объекта кнопок
        this.button = this.input.keyboard.createCursorKeys();

        this.randomGeneratePlatforms(15);
    }

    update() {
        this.handlePlayerInput();
        this.teleportPlayer();
        this.updateCamera();
        this.transferPlatforms();
    }

    teleportPlayer() {
        const halfWidthPlayer = this.player.width / 2;

        if (this.player.x - halfWidthPlayer > WIDTH) {
            this.player.setPosition(-halfWidthPlayer, this.player.y);
        } else if (this.player.x + halfWidthPlayer < 0) {
            this.player.setPosition(WIDTH + halfWidthPlayer, this.player.y);
        }
    }

    updateCamera() {
        const camera = this.cameras.main;
        //Координаты игрока - координаты игрового окна
        const playerScreenY = this.player.y - camera.scrollY;

        // Игрок поднялся выше 35% экрана - cameraTrashold
        if (playerScreenY < this.cameraTrashold) {
            const targetScrollY = this.player.y - this.cameraTrashold;

            camera.scrollY = Phaser.Math.Linear(camera.scrollY, targetScrollY, 0.1);
        }
    }

    handlePlayerInput() {
        if (this.button.left.isDown) {
            this.player.setFlipX(true);
            this.player.setVelocityX(-VELOCITY_X);
        } else if (this.button.right.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocityX(VELOCITY_X);
        } else if (Phaser.Input.Keyboard.JustDown(this.button.up) && !this.isShooting) {
            this.shootingHandler();
        } else {
            this.player.setVelocityX(0);
        }
        if (!this.isShooting) {
            this.player.setTexture("playerRight");
        }
    }

    checkJumpDirection(player, platform) {
        return (
            player.body.velocity.y > 0 &&
            player.body.right > platform.body.left &&
            player.body.left < platform.body.right
        );
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

    createPlatform(x, y) {
        const firstPlatform = this.platforms.create(x, y, "staticTile");
        firstPlatform.body.checkCollision.right = false;
        firstPlatform.body.checkCollision.down = false;
        firstPlatform.body.checkCollision.left = false;
        firstPlatform.refreshBody();
    }

    randomGeneratePlatforms(count) {
        this.createPlatform(this.lastPlatformX, this.lastPlatformY);

        for (let i = 0; i < count; i++) {
            this.generateNextPlatformCoords();
            this.createPlatform(this.lastPlatformX, this.lastPlatformY);
        }
    }

    generateNextPlatformCoords() {
        const y = this.lastPlatformY - Phaser.Math.Between(60, MAX_JUMP_Y);
        const offsetX = Phaser.Math.Between(-MAX_JUMP_X, MAX_JUMP_X);

        let x = this.lastPlatformX + offsetX;

        const padding = 50;

        if (x < padding) {
            x = padding + (padding - x); // отодвинули платформу от левой границы
        } else if (x > WIDTH - padding) {
            x = WIDTH - padding - (x - (WIDTH - padding)); // отодвинули платформу от правой границы
        }

        this.lastPlatformX = x;
        this.lastPlatformY = y;
    }

    transferPlatforms() {
        const camera = this.cameras.main;

        this.platforms.getChildren().forEach((platform) => {
            // Проверяем, ушла ли платформа ниже видимой границы экрана + 50 пикселей запаса
            if (platform.y > camera.scrollY + HEIGHT + 50) {
                this.generateNextPlatformCoords();
                // Телепортируем существующую платформу наверх
                platform.setPosition(this.lastPlatformX, this.lastPlatformY);
                platform.refreshBody();
            }
        });
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
