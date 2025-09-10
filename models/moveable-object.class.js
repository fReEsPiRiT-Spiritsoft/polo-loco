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

    getHitBox() {
        let x = this.x;
        let y = this.y;
        let w = this.width;
        let h = this.height;
        if (this.hitbox) {
            if (this.hitbox.width) w = this.hitbox.width;
            if (this.hitbox.height) h = this.hitbox.height;
            if (this.hitbox.offsetX) x += this.hitbox.offsetX;
            if (this.hitbox.offsetY) y += this.hitbox.offsetY;
        }
        return { x, y, width: w, height: h };
    }

    isColliding(mo) {
        const a = this.getHitBox();
        const b = (mo.getHitBox) ? mo.getHitBox() : {
            x: mo.x, y: mo.y, width: mo.width, height: mo.height
        };
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    drawHitBox(ctx, color = 'rgba(255,0,0,0.4)') {
        if (!ctx) return;
        const hb = this.getHitBox();
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
        ctx.restore();
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