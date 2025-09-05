class Raindrop {
    constructor(x, y) {
        this.x = x + (Math.random() * 120 - 60); // leichte Streuung
        this.y = y + 40;
        this.speedY = 6 + Math.random() * 3;
        this.alpha = 0.9;
        this.width = 3;
        this.height = 12;
    }

    update() {
        this.y += this.speedY;
        this.alpha -= 0.01;
        return this.alpha > 0 && this.y < 480; // true = aktiv
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        g.addColorStop(0, '#7ec8ff');
        g.addColorStop(1, '#1d6fa8');
        ctx.fillStyle = g;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}