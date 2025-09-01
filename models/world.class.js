class World {
    character = new Character();
    level = level1
    enemies = level1.enemies
    clouds = level1.clouds
    backgroundObjects = level1.backgroundObjects

    ctx;
    canvas;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    coinStatusBar = new CoinStatusBar();
    bottleStatusBar = new BottleStatusBar();
    throwableObjects = [];
    collectedBottles = 0;
    collectedCoins = 0;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.checkCollisions();
        this.run();
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            // this.checkThrowObjects();
        }, 200);
    }

    checkCollisions() {
        this.checkChickenStomp();
        this.checkEnemyCollision();
        this.checkCollectableCollision();
        this.checkEnemyBottleCollision();
    }

    checkEnemyCollision() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy) && enemy.energy > 0) {
                this.character.hit();
                this.statusBar.setPercentage(this.character.energy);
            }
        });
    }

    checkChickenStomp() {
        this.enemies.forEach((enemy) => {
            if (
                enemy instanceof Chicken &&
                this.character.isAboveGround() &&
                this.character.isColliding(enemy)
            ) {
                enemy.energy = 0;
                this.character.jump();
                enemy.animateDeath();
                enemy.markedForRemoval = true;
            }
        });
        this.enemies = this.enemies.filter(enemy => !(enemy.markedForRemoval));
    }

    checkEnemyBottleCollision() {
    this.throwableObjects.forEach((bottle) => {
        this.enemies.forEach((enemy) => {
            if (bottle.isColliding(enemy) && enemy.energy > 0) {
                enemy.energy = 0;
                enemy.animateDeath();
                enemy.markedForRemoval = true;
                bottle.markedForRemoval = true;
            }
        });
    });
    this.enemies = this.enemies.filter(enemy => !enemy.markedForRemoval);
    this.throwableObjects = this.throwableObjects.filter(bottle => !bottle.markedForRemoval);
}

    checkCollectableCollision() {
        this.level.collectableObjects = this.level.collectableObjects.filter(obj => {
            if (this.character.isColliding(obj)) {
                if (obj instanceof CollectableCoin) {
                    this.collectedCoins++;
                    this.coinStatusBar.setPercentage(this.collectedCoins / 12 * 100);
                }
                if (obj instanceof CollectableBottle) {
                    this.collectedBottles++;
                    this.bottleStatusBar.setPercentage(this.collectedBottles / 10 * 100);
                }
                return false;
            }
            return true;
        });
    }


    checkThrowObjects() {

        if (this.keyboard.D && this.collectedBottles > 0) {
            let bottle = new ThrowableObject(
                this.character.x + 40,
                this.character.y + 140
            );
            this.throwableObjects.push(bottle);
            this.collectedBottles--;
            this.bottleStatusBar.setPercentage(this.collectedBottles / 10 * 100)
        }


    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.backgroundObjects);
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.level.collectableObjects);
        this.addToMap(this.character);


        /////////////////////////////////////
        this.ctx.translate(-this.camera_x, 0);
        // Screen Fixed Objects Here
        this.addToMap(this.statusBar);
        this.addToMap(this.coinStatusBar);
        this.addToMap(this.bottleStatusBar);
        this.ctx.translate(this.camera_x, 0);
        ///////////////////////////////////////

        this.addObjectsToMap(this.enemies);
        this.addObjectsToMap(this.throwableObjects)

        this.ctx.translate(-this.camera_x, 0);


        let self = this
        requestAnimationFrame(function () {
            self.draw();
        });

    }

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {

        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx)
        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }
    flipImageBack(mo) {
        this.ctx.restore();
        mo.x = mo.x * -1;
    }
}