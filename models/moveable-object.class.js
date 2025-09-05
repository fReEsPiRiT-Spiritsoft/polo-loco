class MoveableObject extends DrawableObject {
    speed = 0.2;
    otherDirection = false;
    speedY = 0;
    acceleration = 1;
    energy = 100;
    lastHit = 0;
    groundContact = false;

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) {
            if (this.y >= 385) {
                this.groundContact = true;
            } else {
                this.groundContact = false;
            }
            return this.y < 390;
        } else {
            return this.y < 150;
        }
    }



    isColliding(mo) {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        if (this instanceof Character) {
            y += 120;
            height -= 120;
            x += 15;         // Links 20px weniger
            width -= 30;     // Rechts 20px weniger (insgesamt 40px schmaler)
        }
        if (this instanceof ChickenEndboss) {
            y += 200;
            height -= 400;
            x += 300;         // Links 30px weniger
            width -= 600;     // Rechts 30px weniger (insgesamt 60px schmaler)
        }
        return (
            y < mo.y + mo.height &&
            y + height > mo.y &&
            x < mo.x + mo.width &&
            x + width > mo.x
        );
    }

    death() {
        this.energy = 0;
        if (this.IMAGES_DEAD) {
            this.playAnimation(this.IMAGES_DEAD);
        }
        this.markedForRemoval = true;
    }

    isDead() {
        return this.energy == 0;
    }

    hit() {
        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 0.5;
    }

    moveRight() {
        this.x += this.speed;

    }

    moveLeft() {
        this.x -= this.speed;

    }

    jump(j) {
        this.speedY = j;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }
}