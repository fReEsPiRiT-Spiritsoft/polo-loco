class BackgroundObject extends MoveableObject {
    width = 720;
    height = 480;
    parallax = 1;

    constructor(imagePath, x, parallax = 1) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
        this.parallax = parallax;
    }

    draw(ctx, camera_x = 0) {
        // camera_x ist negativ -> deshalb PLUS
        const drawX = this.x + camera_x * this.parallax;
        ctx.drawImage(this.img, drawX, this.y, this.width, this.height);
    }
}