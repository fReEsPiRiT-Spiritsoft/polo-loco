class ChickenEndboss extends MoveableObject {

    y = 150;
    groundY = 150;
    height = 300;
    width = 300;
    baseSpeed = 9;
    speed = 9;


    alerted = false;
    isJumping = false;
    isAttacking = false;
    isDead = false;
    isHurt = false;
    energy = 100;


    alertStartedAt = 0;
    nextJumpAt = 0;
    nextAttackAt = 0;
    hurtUntil = 0;


    ALERT_DURATION = 600;
    JUMP_COOLDOWN = 1800;
    ATTACK_COOLDOWN = 600;
    ATTACK_DISTANCE = 110;
    JUMP_DISTANCE_MIN = 220;
    JUMP_DISTANCE_MAX = 1200;

    // Jump-Physik
    jumpVy = 0;
    jumpStartVy = 24;
    gravity = 1.2;

    // Animation-Sets
    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/g1.png',
        'img/4_enemie_boss_chicken/1_walk/g2.png',
        'img/4_enemie_boss_chicken/1_walk/g3.png',
        'img/4_enemie_boss_chicken/1_walk/g4.png'
    ];
    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/g5.png',
        'img/4_enemie_boss_chicken/2_alert/g6.png',
        'img/4_enemie_boss_chicken/2_alert/g7.png',
        'img/4_enemie_boss_chicken/2_alert/g8.png',
        'img/4_enemie_boss_chicken/2_alert/g9.png',
        'img/4_enemie_boss_chicken/2_alert/g10.png',
        'img/4_enemie_boss_chicken/2_alert/g11.png',
        'img/4_enemie_boss_chicken/2_alert/g12.png'
    ];
    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/g13.png',
        'img/4_enemie_boss_chicken/3_attack/g14.png',
        'img/4_enemie_boss_chicken/3_attack/g15.png',
        'img/4_enemie_boss_chicken/3_attack/g16.png',
        'img/4_enemie_boss_chicken/3_attack/g17.png',
        'img/4_enemie_boss_chicken/3_attack/g18.png',
        'img/4_enemie_boss_chicken/3_attack/g19.png',
        'img/4_enemie_boss_chicken/3_attack/g20.png'
    ];
    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/g21.png',
        'img/4_enemie_boss_chicken/4_hurt/g22.png',
        'img/4_enemie_boss_chicken/4_hurt/g23.png'
    ];
    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/g24.png',
        'img/4_enemie_boss_chicken/5_dead/g25.png',
        'img/4_enemie_boss_chicken/5_dead/g26.png'
    ];

    constructor(world) {

        super().loadImage('img/4_enemie_boss_chicken/2_alert/g11.png');
        this.world = world;
        this.x = 6400;
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.startLoop();
    }

    startLoop() {
        this.aiInterval = setInterval(() => this.update(), 100); // Logik
        this.animInterval = setInterval(() => this.tickAnimation(), 140); // Frame-Wechsel
    }

    update() {
        if (this.isDead) return;
        if (typeof world === 'undefined' || !world.character || !world.canvas) return;

        const now = performance.now();

        // Hurt-Phase blockt andere Aktionen kurz
        if (this.isHurt) {
            if (now >= this.hurtUntil) {
                this.isHurt = false;
            } else {
                this.updateJumpPhysics();
                return;
            }
        }

        const dist = this.x - world.character.x;
        const absDist = Math.abs(dist);

        this.updateFacing(dist);
        this.updateJumpPhysics();

        if (!this.alerted) {
            if (this.shouldAlert(absDist)) this.startAlert(now);
            return;
        }
        if (now - this.alertStartedAt < this.ALERT_DURATION) return;

        if (this.canAttack(now, absDist)) {
            this.startAttack(now);
            return;
        }

        if (this.canJump(now, absDist)) {
            this.startJump(now, dist);
            return;
        }

        if (!this.isJumping && !this.isAttacking) {
            this.chase(dist);
        }
        // if (this.energy < 60) {
        //     const mini = new MiniChicken();
        //     mini.x = this.x + this.width / 2 - mini.width / 2; // mittig am Endboss
        //     mini.y = this.y + this.height / 2 - mini.height / 2; // mittig am Endboss
        //     mini.world = this.world; // Referenz setzen
        //     this.world.enemies.push(mini);
        //     this.world.enemies.push(mini);
        //     this.world.enemies.push(mini);
        // }
    }

    tickAnimation() {
        if (this.isDead) {
            this.playAnimation(this.IMAGES_DEAD);
            return;
        }
        if (!this.alerted) {
            this.playAnimation(this.IMAGES_ALERT);
            return;
        }
        if (this.isHurt) {
            this.playAnimation(this.IMAGES_HURT);
            return;
        }
        if (this.isAttacking) {
            this.playAnimation(this.IMAGES_ATTACK);
            return;
        }
        if (this.isJumping) {
            this.playAnimation(this.IMAGES_HURT);
            return;
        }
        this.playAnimation(this.IMAGES_WALKING);
    }

    shouldAlert(absDist) {
        const cameraLeft = -world.camera_x;
        const cameraRight = cameraLeft + world.canvas.width;
        return (this.x >= cameraLeft && this.x <= cameraRight) || absDist < 850;
    }

    canAttack(now, absDist) {
        return !this.isJumping &&
            !this.isAttacking &&
            absDist <= this.ATTACK_DISTANCE &&
            now >= this.nextAttackAt;
    }

    canJump(now, absDist) {
        return !this.isJumping &&
            !this.isAttacking &&
            absDist >= this.JUMP_DISTANCE_MIN &&
            absDist <= this.JUMP_DISTANCE_MAX &&
            now >= this.nextJumpAt &&
            this.onGround();
    }

    // ---- Aktionen ----
    startAlert(now) {
        this.alerted = true;
        this.alertStartedAt = now;
        this.currentImage = 0;
    }

    startAttack(now) {
        this.isAttacking = true;
        this.currentImage = 0;
        this.nextAttackAt = now + this.ATTACK_COOLDOWN;

        // Speed für Angriff erhöhen
        const oldSpeed = this.baseSpeed;
        this.baseSpeed = 18; // z.B. doppelt so schnell

        setTimeout(() => {
            if (!this.isDead &&
                Math.abs(this.x - world.character.x) <= this.ATTACK_DISTANCE + 20) {
                world.character.hit();
                world.statusBar.setPercentage(world.character.energy);
            }
        }, 300);

        setTimeout(() => {
            this.isAttacking = false;
            this.baseSpeed = oldSpeed; // Speed zurücksetzen
        }, 750);
    }

    startJump(now, dist) {
        this.isJumping = true;
        this.currentImage = 0;
        this.nextJumpAt = now + this.JUMP_COOLDOWN;
        this.jumpVy = this.jumpStartVy;
        this.horizontalPush = dist > 0 ? -6 : 6;
    }

    chase(dist) {
        const dirLeft = dist > 0;
        if (dirLeft) {
            this.moveLeft();
        } else {
            if (this.moveRight) this.moveRight(); else this.x += this.baseSpeed;
        }
        this.x = Math.max(0, this.x);
    }

    // ---- Physik Jump ----
    updateJumpPhysics() {
        if (!this.isJumping) return;
        this.x += this.horizontalPush;
        this.y -= this.jumpVy;
        this.jumpVy -= this.gravity;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.jumpVy = 0;
            this.isJumping = false;
        }
    }

    onGround() {
        return !this.isJumping && this.y >= this.groundY;
    }

    updateFacing(dist) {
        this.otherDirection = dist < 0;
        if (this.world) {
            this.world.cameraMode = 'boss';
        }
    }

    takeBottleHit() {
        if (this.isDead) return;
        this.energy -= 10;
        this.isHurt = true;
        this.hurtUntil = performance.now() + 400;
        this.currentImage = 0;
        if (this.energy <= 0) {
            this.death();
        }
    }

    death() {
        if (this.isDead) return;
        this.isDead = true;
        this.isJumping = false;
        this.isAttacking = false;
        this.isHurt = false;
        clearInterval(this.aiInterval);
        clearInterval(this.animInterval);

        let i = 0;
        const deadAnim = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_DEAD[i]];
            i++;
            if (i >= this.IMAGES_DEAD.length) {
                clearInterval(deadAnim);
                setTimeout(() => {
                    this.markedForRemoval = true;
                }, 2000);
            }
        }, 180);
        setTimeout(() => {
    if (world && world.enemies) {
        world.enemies.forEach(enemy => {
            if (enemy.energy > 0) {
                enemy.energy = 0;
                enemy.markedForRemoval = true;
                enemy.animateDeath && enemy.animateDeath();
            }
        });
    }
    document.getElementById('winningscreen').classList.remove('hidden');
    if (world) world.paused = true;
}, 2000);
    }
}