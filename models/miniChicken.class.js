class MiniChicken extends MoveableObject {

    y = 350;
    height = 50;
    width = 50;
    speed = 0.15 + Math.random() * 0.45;



    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
     
    ];
 
    IMAGES_DEAD = [
        // 'img/3_enemies_chicken/chicken_small/2_dead/dead.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png'
    ];

     constructor() {
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png')
        this.x = 400 + Math.random() * (9200 - 400);
        this.y = 120 + Math.random() * (400 - 120);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.speed;
        this.animate();
        this.animateWalk();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();
            if (this.energy === 0) {
                this.playAnimation(this.IMAGES_DEAD);
            }
        }, 1000 / 60);

    }
    animateWalk() {
        this.walkInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 150);
    }

    animateDeath() {
        clearInterval(this.walkInterval);
        this.playAnimation(this.IMAGES_DEAD);
        this.speed = 0;

    }
}