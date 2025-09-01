class CollectableBottle extends CollectableObject {

    width = 100;
    height = 100;

    constructor(mapWidth = 7200) {
        super().loadImage('img/6_salsa_bottle/2_salsa_bottle_on_ground.png');
        this.x = Math.random() * mapWidth;
        this.y = 350; // Bodenhöhe anpassen, falls nötig
    }

}