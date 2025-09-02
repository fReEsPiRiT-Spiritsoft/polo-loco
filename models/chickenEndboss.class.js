class ChickenEndboss extends MoveableObject {

    y = 150;
    groundY = 150;
    height = 300;
    width = 300;
    baseSpeed = 1.4;


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
    ATTACK_COOLDOWN = 1200;
    ATTACK_DISTANCE = 110;
    JUMP_DISTANCE_MIN = 220;
    JUMP_DISTANCE_MAX = 520;

    // Jump-Physik
    jumpVy = 0;
    jumpStartVy = 22;
    gravity = 1.2;

    // Animation-Sets
    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];
    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];
    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];
    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];
    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    constructor(world) {
        
        super().loadImage('img/4_enemie_boss_chicken/2_alert/G11.png');
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
        setTimeout(() => {
            if (!this.isDead &&
                Math.abs(this.x - world.character.x) <= this.ATTACK_DISTANCE + 20) {
                world.character.hit();
                world.statusBar.setPercentage(world.character.energy);
            }
        }, 300);
        setTimeout(() => {
            this.isAttacking = false;
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
        }, 180); // Animationsgeschwindigkeit nach Geschmack
    }
}