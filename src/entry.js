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

        this.createFirstPlatform();
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
            this.player.setVelocityX(-180);
        } else if (this.button.right.isDown) {
            this.player.setFlipX(false);
            this.player.setVelocityX(180);
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

    createFirstPlatform() {
        const firstPlatform = this.platforms.create(WIDTH / 2, HEIGHT - 100, "staticTile");
        firstPlatform.body.checkCollision.right = false;
        firstPlatform.body.checkCollision.down = false;
        firstPlatform.body.checkCollision.left = false;
        firstPlatform.refreshBody();
    }

    randomGeneratePlatforms(count) {
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(50, WIDTH - 50);
            this.dynamicHeightPlatform -= Phaser.Math.Between(60, 100);
            const platform = this.platforms.create(x, this.dynamicHeightPlatform, "staticTile");
            platform.body.checkCollision.right = false;
            platform.body.checkCollision.down = false;
            platform.body.checkCollision.left = false;
            platform.refreshBody();
        }
    }

    transferPlatforms() {
        const camera = this.cameras.main;

        this.platforms.getChildren().forEach((platform) => {
            // Проверяем, ушла ли платформа ниже видимой границы экрана + 50 пикселей запаса
            if (platform.y > camera.scrollY + HEIGHT + 50) {
                // Вычисляем новую координату Y еще выше текущей верхней точки
                this.dynamicHeightPlatform -= Phaser.Math.Between(60, 100);
                const newX = Phaser.Math.Between(50, WIDTH - 50);

                // Телепортируем существующий спрайт наверх
                platform.setPosition(newX, this.dynamicHeightPlatform);

                // ВАЖНО: Пересчитываем физическое тело под новые координаты спрайта
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
