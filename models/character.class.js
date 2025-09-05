class Character extends MoveableObject {

    height = 300;
    y = 0;
    speed = 4;
    energy = 100
    lastAction = 0;
    longIdleDelay = 5000;


    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/i-1.png',
        'img/2_character_pepe/1_idle/idle/i-2.png',
        'img/2_character_pepe/1_idle/idle/i-3.png',
        'img/2_character_pepe/1_idle/idle/i-4.png',
        'img/2_character_pepe/1_idle/idle/i-5.png',
        'img/2_character_pepe/1_idle/idle/i-6.png',
        'img/2_character_pepe/1_idle/idle/i-7.png',
        'img/2_character_pepe/1_idle/idle/i-8.png',
        'img/2_character_pepe/1_idle/idle/i-9.png',
        'img/2_character_pepe/1_idle/idle/i-10.png'
    ];

    IMAGES_LONG_IDLE = [
        'img/2_character_pepe/1_idle/long_idle/i-11.png',
        'img/2_character_pepe/1_idle/long_idle/i-12.png',
        'img/2_character_pepe/1_idle/long_idle/i-13.png',
        'img/2_character_pepe/1_idle/long_idle/i-14.png',
        'img/2_character_pepe/1_idle/long_idle/i-15.png',
        'img/2_character_pepe/1_idle/long_idle/i-16.png',
        'img/2_character_pepe/1_idle/long_idle/i-17.png',
        'img/2_character_pepe/1_idle/long_idle/i-18.png',
        'img/2_character_pepe/1_idle/long_idle/i-19.png',
        'img/2_character_pepe/1_idle/long_idle/i-20.png'
    ];

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/w-21.png',
        'img/2_character_pepe/2_walk/w-22.png',
        'img/2_character_pepe/2_walk/w-23.png',
        'img/2_character_pepe/2_walk/w-24.png',
        'img/2_character_pepe/2_walk/w-26.png',
        'img/2_character_pepe/2_walk/w-25.png'

    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/j-31.png',
        'img/2_character_pepe/3_jump/j-32.png',
        'img/2_character_pepe/3_jump/j-33.png',
        'img/2_character_pepe/3_jump/j-34.png',
        'img/2_character_pepe/3_jump/j-35.png',
        'img/2_character_pepe/3_jump/j-36.png',
        'img/2_character_pepe/3_jump/j-37.png',
        'img/2_character_pepe/3_jump/j-38.png',
        'img/2_character_pepe/3_jump/j-39.png'
    ];

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/h-41.png',
        'img/2_character_pepe/4_hurt/h-42.png',
        'img/2_character_pepe/4_hurt/h-43.png'

    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/d-51.png',
        'img/2_character_pepe/5_dead/d-52.png',
        'img/2_character_pepe/5_dead/d-53.png',
        'img/2_character_pepe/5_dead/d-54.png',
        'img/2_character_pepe/5_dead/d-55.png',
        'img/2_character_pepe/5_dead/d-56.png',
        'img/2_character_pepe/5_dead/d-57.png'
    ];

    world;

    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/w-21.png')
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.applyGravity();
        this.lastAction = performance.now();
        this.animate();
    }

    markAction() {
        this.lastAction = performance.now();
    }

    isLongIdle() {
        return (performance.now() - this.lastAction) >= this.longIdleDelay;
    }

    animate() {
        this.moveInterval = setInterval(() => {

            let moved = false;

            // Endboss-Status ermitteln (true = lebt noch)
            const endbossAlive = this.world?.enemies?.some(e => e instanceof ChickenEndboss && !e.isDead) ?? true;

            // Wenn Endboss tot -> keine Bewegung mehr
            if (!endbossAlive) {
                    clearInterval(this.animations);
                return; // blockiert Eingaben, Figur bleibt stehen
            }

            if (this.world.keyboard.RIGHT &&
                this.x < 7200 &&
                !this.isDead() &&
                !this.characterKnockbackActive) {
                this.moveRight();
                this.otherDirection = false;
                moved = true;
            }

            if (this.world.keyboard.LEFT &&
                this.x > 0 &&
                !this.isDead() &&
                !this.characterKnockbackActive) {
                this.moveLeft();
                this.otherDirection = true;
                moved = true;
            }

            if (this.world.keyboard.SPACE &&
                !this.isAboveGround() &&
                !this.isDead()) {
                this.jump(20);
                moved = true;
            }

            if (moved) this.markAction();

            this.world.camera_x = -this.x + 100;

        }, 1000 / 60);


        this.animations = setInterval(() => {
            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            }
            else if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
                setTimeout(() => {
                    clearInterval(this.animations);
                    this.showSarg();
                }, 500);
            } else if
                (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
            } else {
                if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                    this.playAnimation(this.IMAGES_WALKING);
                } else if (this.isLongIdle()) {
                    this.playAnimation(this.IMAGES_LONG_IDLE);
                } else {
                    this.playAnimation(this.IMAGES_IDLE);
                }
            }

        }, 100);


    }
    showSarg() {
        if (this.sargShown) return;
        this.sargShown = true;
        if (this.animations) clearInterval(this.animations);
        this.animations = null;
        this.loadImage('img/2_character_pepe/5_dead/d-58.png');
        this.y = 320;
        this.height = 200;
        this.width = 300;
        setTimeout(() => {
            const es = document.getElementById('endscreen');
            if (es) es.classList.remove('hidden');
            if (this.world) this.world.paused = true;
        }, 800);
    }

}