
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

        // Hat sich der Modus geändert?
        if (this.bossShiftActive !== this.lastBossShiftActive) {
            this.lastBossShiftActive = this.bossShiftActive;
            // Ziel für neuen Modus einmal fix berechnen
            const target = this.bossShiftActive
                ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
                : (-this.character.x + this.CAM_LEFT_OFFSET);

            this.camTransitionFrom = this.camera_x;
            this.camTransitionTo = target;
            this.camTransitionStart = performance.now();
            this.camTransitionActive = true;
        }

        if (this.camTransitionActive) {
            const now = performance.now();
            let t = (now - this.camTransitionStart) / this.CAM_TRANSITION_DURATION;
            if (t >= 1) {
                t = 1;
                this.camTransitionActive = false;
            }
            // Smoothstep-Easing
            const eased = t * t * (3 - 2 * t);
            this.camera_x = this.camTransitionFrom + (this.camTransitionTo - this.camTransitionFrom) * eased;
        } else {
            // Fester Modus: sofort anheften (kein dauerhaftes Nach-Lerpen -> kein Zittern)
            this.camera_x = this.bossShiftActive
                ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
                : (-this.character.x + this.CAM_LEFT_OFFSET);
        }

        // Ganzzahlen gegen Flimmern
        this.camera_x = Math.round(this.camera_x);
    }



    evaluateBossCamera() {
        const now = performance.now();
        // Aktiven (lebenden) Endboss suchen
        const boss = this.enemies.find(e => e instanceof ChickenEndboss && !e.isDead);
        if (!boss) {
            this.bossShiftActive = false;
            return;
        }

        const dx = this.character.x - boss.x; // positiv: Boss ist links vom Character
        const absDx = Math.abs(dx);

        // Aktivieren: Boss links & nicht zu weit entfernt
        if (!this.bossShiftActive &&
            dx > this.BOSS_SHIFT_ACTIVATE_DELTA &&
            absDx < this.BOSS_SHIFT_MAX_DISTANCE) {
            this.bossShiftActive = true;
            this.bossShiftMinHoldUntil = now + this.BOSS_SHIFT_MIN_HOLD;
            return;
        }

        // Deaktivieren: Mindesthaltezeit vorbei UND Boss nicht mehr klar links
        if (this.bossShiftActive) {
            const holdDone = now >= this.bossShiftMinHoldUntil;
            const bossNoLongerLeft = dx < this.BOSS_SHIFT_DEACTIVATE_DELTA;
            const tooFar = absDx >= this.BOSS_SHIFT_MAX_DISTANCE;
            if (holdDone && (bossNoLongerLeft || tooFar)) {
                this.bossShiftActive = false;
            }
        }
    }

    checkCollisions() {
        if (this.paused === false) {
            this.checkChickenStomp();
            this.checkEnemyCollision();
            this.checkCollectableCollision();
            this.checkEnemyBottleCollision();
            this.checkMiniChickenStomp();
        }

    }

    checkMiniChickenStomp() {
        this.enemies.forEach((enemy) => {
            if (
                (enemy instanceof MiniChicken) &&
                !this.character.isDead() &&
                this.character.isColliding(enemy) &&
                enemy.energy > 0

            ) {
                this.characterKnockbackActive = true;
                if (enemy.x < this.character.x) {
                    let interval = setInterval(() => {
                        this.character.jump(10);
                        this.character.moveRight();
                        enemy.energy = 0;
                        setTimeout(() => {
                            enemy.markedForRemoval = true;
                            // bottle.markedForRemoval = true;
                        }, 500);
                    }, 16);
                    setTimeout(() => {
                        clearInterval(interval);
                        this.characterKnockbackActive = false;
                    }, 1500);
                } else {
                    this.characterKnockbackActive = true;
                    let interval = setInterval(() => {
                        this.character.jump(10);
                        this.character.moveLeft();
                        enemy.energy = 0;
                        setTimeout(() => {
                            enemy.markedForRemoval = true;
                            // bottle.markedForRemoval = true;
                        }, 500);
                    }, 16);
                    setTimeout(() => {
                        clearInterval(interval);
                        this.characterKnockbackActive = false;
                    }, 1500);
                }
                this.character.hit(); // Optional: Schaden zufügen
                this.statusBar.setPercentage(this.character.energy);
            }
        });
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
                this.character.jump(20);
                enemy.animateDeath();
                setTimeout(() => {
                    enemy.markedForRemoval = true;
                }, 1000);
            }
        });
        this.enemies = this.enemies.filter(enemy => !(enemy.markedForRemoval));
    }

    checkEnemyBottleCollision() {
        this.throwableObjects.forEach(bottle => {
            if (bottle.markedForRemoval) return;
            this.enemies.forEach(enemy => {
                if (enemy.energy > 0 && bottle.isColliding(enemy)) {
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
            });
        });

        this.enemies = this.enemies.filter(e => !e.markedForRemoval);
        this.throwableObjects = this.throwableObjects.filter(b => !b.markedForRemoval);
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

    draw() {
        this.updateCamera();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Hintergründe (eigene Parallax-Berechnung, kein globales translate)
        this.backgroundObjects.forEach(bg => {
            if (bg instanceof BackgroundObject) {
                bg.draw(this.ctx, this.camera_x);
            }
        });

        // 2. Welt verschieben für restliche Objekte
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.clouds);                // Falls Clouds kein Parallax haben
        this.addObjectsToMap(this.level.collectableObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.enemies);
        this.addObjectsToMap(this.throwableObjects);

        const now = performance.now();
        if (this.enableRain) {
            this.spawnRain(now);
        }
        // updateRain zeichnet die Tropfen (Positionssystem = Weltkoordinaten)
        this.raindrops = this.raindrops.filter(r => r.update());
        this.raindrops.forEach(r => r.draw(this.ctx));


        this.ctx.restore(); // zurück für HUD

        // 3. HUD (fix)
        this.addToMap(this.statusBar);
        this.addToMap(this.coinStatusBar);
        this.addToMap(this.bottleStatusBar);

        if (this.enableRain) { // oder ein anderes Flag für "dunkel"
        this.ctx.save();
        this.ctx.globalAlpha = 0.25; // 0.0 = durchsichtig, 1.0 = komplett schwarz
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

        requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        // BackgroundObjects sind schon gezeichnet -> überspringen
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
        // Alte entfernen
        this.raindrops = this.raindrops.filter(r => r.update());
        // Zeichnen (nach Hintergründen, vor Vorder-Objekten)
        this.raindrops.forEach(r => r.draw(this.ctx));
    }

    spawnRain(now) {
        if (now - this.lastRainSpawn < 80) return;
        this.lastRainSpawn = now;
        if (!this.clouds || !this.clouds.length) return;
        // 2–4 Wolken wählen
        const count = 5 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const cloud = this.clouds[Math.floor(Math.random() * this.clouds.length)];
            this.raindrops.push(new Raindrop(cloud.x + 250, cloud.y + 80));
        }
    }
}

