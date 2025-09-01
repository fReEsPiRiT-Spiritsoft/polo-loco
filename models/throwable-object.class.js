class ThrowableObject extends MoveableObject {


    IMAGES_ROTATE_BOTTLE = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'

    ];

    BOTTLE_SPLASH = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'

    ];

    constructor(x, y) {
        super().loadImage('img/6_salsa_bottle/salsa_bottle.png')
        this.loadImages(this.IMAGES_ROTATE_BOTTLE);
        this.loadImages(this.BOTTLE_SPLASH);
        this.x = x;
        this.y = y;
        this.height = 80;
        this.width = 60;
        this.throw();

    }


    throw() {
        this.speedY = 12;
        this.applyGravity();
        this.throwAnimation();
        this.moveInterval = setInterval(() => {
            if (!this.groundContact) {
                this.x += 10;
            } else {
                clearInterval(this.moveInterval); // Bewegung stoppen!
            }
        }, 25);
    }

    throwAnimation() {
        let splashStarted = false; // Hilfsvariable, damit das Zurücksetzen nur einmal passiert
        let animationInterval = setInterval(() => {
            if (!this.groundContact) {
                this.playAnimation(this.IMAGES_ROTATE_BOTTLE);
            } else {
                if (!splashStarted) {
                    this.currentImage = 0; // Splash-Animation von vorne starten
                    splashStarted = true;
                }
                this.playAnimation(this.BOTTLE_SPLASH);
                if (this.currentImage >= this.BOTTLE_SPLASH.length) {
                    clearInterval(animationInterval); // Animation beenden
                }
            }
        }, 100);
    }

}