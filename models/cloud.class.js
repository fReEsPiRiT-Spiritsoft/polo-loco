class cloud extends MoveableObject {
    y = 8
    width = 500;
    height = 500;
    speed = 0.2;



    constructor(isDark = false) {
        const images = isDark
            ? [
                'img/5_background/layers/4_clouds/1_dark.png',
                'img/5_background/layers/4_clouds/2_dark.png'
            ]
            : [
                'img/5_background/layers/4_clouds/1.png',
                'img/5_background/layers/4_clouds/2.png'
            ];
        const chosenImage = images[Math.floor(Math.random() * images.length)];
        super().loadImage(chosenImage);
        this.x = Math.random() * 30000;
        this.animate();
        this.isDark = isDark;
    }
    animate() {
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 60); // 60 FPS
    }



}