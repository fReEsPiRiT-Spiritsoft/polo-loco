class CoinStatusBar extends DrawableObject {

    percentage = 0;

    IMAGES = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
    ];

    constructor() {
        super();
        this.loadImages(this.IMAGES)
        this.setPercentage(0);
        this.x = 50;
        this.y = 40;
        this.width = 150;
        this.height = 50
    }


    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()]
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage > 80) return 4;
        if (this.percentage > 60) return 3;
        if (this.percentage > 40) return 2;
        if (this.percentage > 20) return 1;
        return 0;
    }
}