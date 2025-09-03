
class World {
    paused = true;
    character = new Character();
    // level = level1;
    // enemies = level1.enemies;
    // clouds = level1.clouds;
    // backgroundObjects = level1.backgroundObjects
    level = [];
    enemies = [];
    clouds = [];
    backgroundObjects = [];



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


    bossShiftMinHoldUntil = 0; // Mindest-Haltedauer (ms) der Boss-Perspektive
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
        setInterval(() => {
            this.checkCollisions();
        }, 200);
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
    // ...existing code...


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
                    if (enemy instanceof Chicken) {
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
        this.updateCamera()
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

