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

    bossShiftActive = false;
    lastBossShiftActive = false;
    camTransitionActive = false;
    camTransitionStart = 0;
    camTransitionFrom = 0;
    camTransitionTo = 0;
    CAM_TRANSITION_DURATION = 450;
    CAM_LEFT_OFFSET = 100;
    CAM_RIGHT_OFFSET_EXTRA = 100;

    bossShiftMinHoldUntil = 2000;
    cameraSmoothFactor = 0.12;
    cameraSnapThreshold = 1.0;

    BOSS_SHIFT_MAX_DISTANCE = 1200;
    BOSS_SHIFT_ACTIVATE_DELTA = 60;
    BOSS_SHIFT_DEACTIVATE_DELTA = 20;
    BOSS_SHIFT_MIN_HOLD = 500;

    statusBar = new StatusBar();
    coinStatusBar = new CoinStatusBar();
    bottleStatusBar = new BottleStatusBar();
    throwableObjects = [];
    collectedBottles = 0;
    collectedCoins = 0;
    cameraMode = 'char';
    characterKnockbackActive = false;

    lastHurtSound = 0;
    triggeredFightSound = false;

    debugHitboxes = false;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.level = level1;
        this.enemies = level1.enemies;
        this.clouds = level1.clouds;
        this.backgroundObjects = level1.backgroundObjects;

        this.collisionManager = new CollisionManager(this); // <--- NEU
        this.draw();
        this.setWorld();
        this.collisionManager.update(); // <--- statt this.checkCollisions()
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
            this.collisionManager.update(); // <--- geändert
        }, 200);
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

    triggerFightSound() {
        if (this.character.x > 5600 && this.triggeredFightSound === false) {
            AudioHub.FIGHT_FOR_ENDBOSS.play();
            this.triggeredFightSound = true;
        }
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

    update() {
        if (this.paused) return;
        this.character.prevY = this.character.prevY ?? this.character.y;
        this.character.vy = this.character.y - this.character.prevY;
        this.checkMiniChickenStomp();
        this.character.prevY = this.character.y;
    }

    checkThrowObjects() {
        if (this.canThrowBottle()) {
            const { startX, startY, facingLeft } = this.getBottleStartPosition();
            this.spawnThrowableBottle(startX, startY, facingLeft);
            this.handleBottleThrowEffects();
        }
    }

    canThrowBottle() {
        return this.keyboard.D && this.collectedBottles > 0 && !this.throwCooldown;
    }

    getBottleStartPosition() {
        const facingLeft = this.character.otherDirection;
        const startX = facingLeft
            ? this.character.x - 30
            : this.character.x + this.character.width - 30;
        const startY = this.character.y + this.character.height * 0.45;
        return { startX, startY, facingLeft };
    }

    spawnThrowableBottle(startX, startY, facingLeft) {
        const bottle = new ThrowableObject(startX, startY, facingLeft);
        this.throwableObjects.push(bottle);
        this.collectedBottles--;
        this.bottleStatusBar.setPercentage(this.collectedBottles / 20 * 100); // <-- Prozent aktualisieren!
        this.throwCooldown = true;
    }

    handleBottleThrowEffects() {
        AudioHub.THROW.currentTime = 0;
        AudioHub.THROW.volume = 0.8;
        AudioHub.THROW.play();
        setTimeout(() => this.throwCooldown = false, 300);
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
        this.bottleStatusBar.draw(this.ctx, this.collectedBottles);
    }

    drawEnbossStatusBar() {
        this.enemies.forEach(enemy => {
            if (enemy instanceof ChickenEndboss && enemy.statusBar) {
                const worldX = enemy.x + enemy.width / 2 - enemy.statusBar.width / 2;
                const worldY = enemy.y - enemy.statusBar.height - 2 + 150;
                const screenX = worldX + this.camera_x;
                const screenY = worldY;
                enemy.statusBar.x = screenX;
                enemy.statusBar.y = screenY;
                enemy.statusBar.draw(this.ctx);
            }
        });
    }

    drawHitBoxes() {
        if (!this.debugHitboxes) return;
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0); // gleiche Translation wie für Sprites
        this.character.drawHitBox(this.ctx, 'rgba(0,255,0,0.25)');
        this.enemies.forEach(e => e.drawHitBox && e.drawHitBox(this.ctx, 'rgba(255,0,0,0.25)'));
        this.throwableObjects.forEach(o => o.drawHitBox && o.drawHitBox(this.ctx, 'rgba(0,0,255,0.25)'));
        this.ctx.restore();
    }

    draw() {
        this.drawCamAndBackground();
        this.drawEnvoiment();
        this.drawRaindrops();
        this.ctx.restore();
        this.drawDarkOverlay();
        this.drawStatusBars();
        this.drawHitBoxes();
        this.drawEnbossStatusBar()
        requestAnimationFrame(() => this.draw());
        EnemySounds.updateMiniChickenSound(this);
        EnemySounds.updateChickenSound(this);
        this.triggerFightSound();
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

    spawnRain(now) {
        if (now - this.lastRainSpawn < 80) return;
        this.lastRainSpawn = now;
        if (!this.clouds || !this.clouds.length) return;
        const count = 8 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const cloud = this.clouds[Math.floor(Math.random() * this.clouds.length)];
            this.raindrops.push(new Raindrop(cloud.x + 250, cloud.y + 80));
        }
    }
}