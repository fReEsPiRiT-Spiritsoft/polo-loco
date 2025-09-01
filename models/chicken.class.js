class Chicken extends MoveableObject {

    y = 350;
    height = 100;
    speed = 0.15 + Math.random() * 0.45;
 
    

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'

    ];
    

    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    constructor(){
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png')
        this.x = 200 + Math.random() * (6200 - 200);
        this.loadImages(this.IMAGES_WALKING);
        this.speed;
        this.animate();
        this.animateWalk();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();    
        }, 1000 / 60);   

    }
    animateWalk(){
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 150);
    }

    animateDeath() {
        this.playAnimation(this.IMAGES_DEAD);
    }
}