class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    height = 150;
    width = 100;
    x = 120;
    y = 250;
    debugMode = true;
    fallbackCreated = false;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    ensureFallback() {
        if (this.img || this.fallbackCreated) return;
        const c = document.createElement('canvas');
        c.width = c.height = 2;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0,0,2,2);
        this.img = c;
        this.fallbackCreated = true;
    }

    draw(ctx) {
        this.ensureFallback();
        if (!this.img) return;
        // Wenn echtes Image noch lädt -> (complete == false) einfach überspringen
        if (this.img instanceof HTMLImageElement && !this.img.complete) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (!this.debugMode) return;
        if (this instanceof Character || this instanceof Chicken || this instanceof ChickenEndboss || this instanceof ThrowableObject) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }
}