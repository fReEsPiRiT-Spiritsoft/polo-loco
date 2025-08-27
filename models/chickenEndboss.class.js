class ChickenEndboss extends MoveableObject {
    y = 150;
    height = 300;
    width = 300;
    speed = 0.15 + Math.random() * 0.25;

    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'

    ];


    constructor() {
        super().loadImage('img/4_enemie_boss_chicken/2_alert/G11.png')
        this.x = 700;
        this.loadImages(this.IMAGES_WALKING);
        this.speed;
        this.animate();
        this.animateWalk();
    }

    animate() {
        this.moveLeft();
    }
    animateWalk() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 150);
    }
}