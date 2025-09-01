class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    height = 150;
    width = 100;
    x = 120;
    y = 250;
    debugMode = true;


    loadImage(path) {
        this.img = new Image();
        this.img.src = path
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;

        });

    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

    }

    drawFrame(ctx) {
        if (this.debugMode === true) {
            if (this instanceof Character || this instanceof Chicken || this instanceof ChickenEndboss || this instanceof ThrowableObject) {
                ctx.beginPath();
                ctx.lineWidth = '-1';
                ctx.strokeStyle = 'blue';
                ctx.rect(this.x, this.y, this.width, this.height);
                ctx.stroke();
            }
        } else {
            return;
        }
    }


}