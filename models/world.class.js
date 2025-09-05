
class World {
    paused = true;
    character = new Character();
    level = [];
    enemies = [];
    clouds = [];
    backgroundObjects = [];
    raindrops = [];
    lastRainSpawn = 0;


    ctx;
    canvas;
    keyboard;
    camera_x = 0;

    // Für weichen Übergang:
    bossShiftActive = false;
    lastBossShiftActive = false;
    camTransitionActive = false;
    camTransitionStart = 0;
    camTransitionFrom = 0;
    camTransitionTo = 0;
    CAM_TRANSITION_DURATION = 450; // ms
    CAM_LEFT_OFFSET = 100; // dein Standard links
    CAM_RIGHT_OFFSET_EXTRA = 100; // der -100 Teil aus deiner rechten Formel


    bossShiftMinHoldUntil = 2000; // Mindest-Haltedauer (ms) der Boss-Perspektive
    cameraSmoothFactor = 0.12;   // 0.05 langsamer, 0.2 schneller
    cameraSnapThreshold = 1.0;

    // Konfiguration
    BOSS_SHIFT_MAX_DISTANCE = 1200;   // weiter weg? -> nicht verschieben
    BOSS_SHIFT_ACTIVATE_DELTA = 60;   // Boss so viel links vom Character -> aktivieren
    BOSS_SHIFT_DEACTIVATE_DELTA = 20; // Boss kommt wieder näher / rechts -> deaktivieren
    BOSS_SHIFT_MIN_HOLD = 500;        // mindestens so lange halten (ms)

    statusBar = new StatusBar();
    coinStatusBar = new CoinStatusBar();
    bottleStatusBar = new BottleStatusBar();
    throwableObjects = [];
    collectedBottles = 0;
    collectedCoins = 0;
    cameraMode = 'char';

    characterKnockbackActive = false;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

        this.level = level1;

        this.enemies = level1.enemies;
        this.clouds = level1.clouds;
        this.backgroundObjects = level1.backgroundObjects;

        this.draw();
        this.setWorld();
        this.checkCollisions();
        this.run();
    }

    start() {
        this.paused = false;
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        this.locicInterval = setInterval(() => {
            this.checkCollisions();
        }, 200);
    }
    destroy() {
        if (this.logicInterval) clearInterval(this.logicInterval);
        if (this.character && this.character.animations) clearInterval(this.character.animations);
        this.enemies.forEach(e => {
            if (e.animations) clearInterval(e.animations);
        });
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCamera() {
        this.evaluateBossCamera();
        if (this.bossShiftActive !== this.lastBossShiftActive) {
            this.startCameraTransition();
        }
        if (this.camTransitionActive) {
            this.updateCameraTransition();
        } else {
            this.setCameraTarget();
        }
        this.camera_x = Math.round(this.camera_x);
    }

    startCameraTransition() {
        this.lastBossShiftActive = this.bossShiftActive;
        const target = this.bossShiftActive
            ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
            : (-this.character.x + this.CAM_LEFT_OFFSET);
        this.camTransitionFrom = this.camera_x;
        this.camTransitionTo = target;
        this.camTransitionStart = performance.now();
        this.camTransitionActive = true;
    }

    updateCameraTransition() {
        const now = performance.now();
        let t = (now - this.camTransitionStart) / this.CAM_TRANSITION_DURATION;
        if (t >= 1) {
            t = 1;
            this.camTransitionActive = false;
        }
        const eased = t * t * (3 - 2 * t);
        this.camera_x = this.camTransitionFrom + (this.camTransitionTo - this.camTransitionFrom) * eased;
    }

    setCameraTarget() {
        this.camera_x = this.bossShiftActive
            ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
            : (-this.character.x + this.CAM_LEFT_OFFSET);
    }



    evaluateBossCamera() {
        const boss = this.enemies.find(e => e instanceof ChickenEndboss && !e.isDead);
        if (!boss) {
            this.bossShiftActive = false;
            return;
        }
        this.updateBossShiftState(boss);
    }

    updateBossShiftState(boss) {
        const now = performance.now();
        const dx = this.character.x - boss.x;
        const absDx = Math.abs(dx);

        if (this.shouldActivateBossShift(dx, absDx)) {
            this.activateBossShift(now);
            return;
        }
        if (this.bossShiftActive) {
            this.checkBossShiftDeactivate(dx, absDx, now);
        }
    }

    shouldActivateBossShift(dx, absDx) {
        return !this.bossShiftActive &&
            dx > this.BOSS_SHIFT_ACTIVATE_DELTA &&
            absDx < this.BOSS_SHIFT_MAX_DISTANCE;
    }

    activateBossShift(now) {
        this.bossShiftActive = true;
        this.bossShiftMinHoldUntil = now + this.BOSS_SHIFT_MIN_HOLD;
    }

    checkBossShiftDeactivate(dx, absDx, now) {
        const holdDone = now >= this.bossShiftMinHoldUntil;
        const bossNoLongerLeft = dx < this.BOSS_SHIFT_DEACTIVATE_DELTA;
        const tooFar = absDx >= this.BOSS_SHIFT_MAX_DISTANCE;
        if (holdDone && (bossNoLongerLeft || tooFar)) {
            this.bossShiftActive = false;
        }
    }

    checkCollisions() {
        if (this.paused) return;
        this.character.prevY = this.character.prevY ?? this.character.y;
        this.character.vy = this.character.y - this.character.prevY;
        this.checkChickenStomp();
        this.checkEnemyCollision();
        this.checkCollectableCollision();
        this.checkEnemyBottleCollision();
        this.checkMiniChickenStomp();
        this.character.prevY = this.character.y;
    }

    checkMiniChickenStomp() {
        this.enemies.forEach(enemy => {
            if (this.shouldMiniChickenStomp(enemy)) {
                this.handleMiniChickenStomp(enemy);
            }
        });
    }

    shouldMiniChickenStomp(enemy) {
        return enemy instanceof MiniChicken &&
            !this.character.isDead() &&
            this.character.isColliding(enemy) &&
            enemy.energy > 0;
    }

    handleMiniChickenStomp(enemy) {
        this.characterKnockbackActive = true;
        if (enemy.x < this.character.x) {
            this.knockbackRight(enemy);
        } else {
            this.knockbackLeft(enemy);
        }
        this.character.hit();
        this.statusBar.setPercentage(this.character.energy);
    }

    knockbackRight(enemy) {
        let interval = setInterval(() => {
            this.character.jump(10);
            this.character.moveRight();
            enemy.energy = 0;
            setTimeout(() => enemy.markedForRemoval = true, 500);
        }, 16);
        setTimeout(() => {
            clearInterval(interval);
            this.characterKnockbackActive = false;
        }, 1500);
    }

    knockbackLeft(enemy) {
        let interval = setInterval(() => {
            this.character.jump(10);
            this.character.moveLeft();
            enemy.energy = 0;
            setTimeout(() => enemy.markedForRemoval = true, 500);
        }, 16);
        setTimeout(() => {
            clearInterval(interval);
            this.characterKnockbackActive = false;
        }, 1500);
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
        this.enemies.forEach(enemy => {
            if (enemy instanceof Chicken && enemy.energy > 0 && this.character.isColliding(enemy) && this.isStompTopHit(this.character, enemy)) {
                enemy.energy = 0;
                this.character.jump(20);
                enemy.animateDeath && enemy.animateDeath();
                setTimeout(() => enemy.markedForRemoval = true, 800);
            }
        });
        this.enemies = this.enemies.filter(e => !e.markedForRemoval);
    }

    isStompTopHit(char, enemy) {
        const charPrevBottom = (char.prevY ?? char.y) + char.height;
        const charNowBottom = char.y + char.height;
        const enemyTop = enemy.y;
        const falling = char.vy > 0;
        return falling && charPrevBottom <= enemyTop && charNowBottom >= enemyTop;
    }

    checkEnemyBottleCollision() {
        this.throwableObjects.forEach(bottle => {
            if (bottle.markedForRemoval) return;
            this.enemies.forEach(enemy => {
                if (enemy.energy > 0 && bottle.isColliding(enemy)) {
                    this.handleBottleHit(enemy, bottle);
                }
            });
        });
        this.enemies = this.enemies.filter(e => !e.markedForRemoval);
        this.throwableObjects = this.throwableObjects.filter(b => !b.markedForRemoval);
    }

    handleBottleHit(enemy, bottle) {
        if (enemy instanceof Chicken || enemy instanceof MiniChicken) {
            enemy.energy = 0;
            enemy.animateDeath && enemy.animateDeath();
            setTimeout(() => {
                enemy.markedForRemoval = true;
                bottle.markedForRemoval = true;
            }, 500);
        } else if (enemy instanceof ChickenEndboss) {
            enemy.takeBottleHit();
            bottle.markedForRemoval = true;
        }
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
                    this.bottleStatusBar.setPercentage(this.collectedBottles / 20 * 100);
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
            this.bottleStatusBar.setPercentage(this.collectedBottles / 20 * 100)
        }


    }

    drawCamAndBackground() {
        this.updateCamera();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.backgroundObjects.forEach(bg => {
            if (bg instanceof BackgroundObject) {
                bg.draw(this.ctx, this.camera_x);
            }
        });
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
    }

    drawEnvoiment() {
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.level.collectableObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.enemies);
        this.addObjectsToMap(this.throwableObjects);
    }

    drawRaindrops() {
        const now = performance.now();
        if (this.enableRain) this.spawnRain(now);
        this.raindrops = this.raindrops.filter(r => r.update());
        this.raindrops.forEach(r => r.draw(this.ctx));
    }

    drawDarkOverlay() {
        if (!this.enableRain) return;
        this.ctx.save();
        this.ctx.globalAlpha = 0.25;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    drawStatusBars() {
        this.addToMap(this.statusBar);
        this.addToMap(this.coinStatusBar);
        this.addToMap(this.bottleStatusBar);
    }

    draw() {
    this.drawCamAndBackground();
    this.drawEnvoiment();
    this.drawRaindrops();
    this.ctx.restore();              
    this.drawDarkOverlay();  
    this.drawStatusBars();    
    requestAnimationFrame(() => this.draw());
}

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        if (mo instanceof BackgroundObject) return;
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
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

    updateRain() {
        this.raindrops = this.raindrops.filter(r => r.update());
        this.raindrops.forEach(r => r.draw(this.ctx));
    }

    spawnRain(now) {
        if (now - this.lastRainSpawn < 80) return;
        this.lastRainSpawn = now;
        if (!this.clouds || !this.clouds.length) return;
        const count = 5 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const cloud = this.clouds[Math.floor(Math.random() * this.clouds.length)];
            this.raindrops.push(new Raindrop(cloud.x + 250, cloud.y + 80));
        }
    }
}