class CollectableCoin extends CollectableObject {

    width = 80;
    height = 80;

     constructor(mapWidth = 7200, mapHeight = 280) {
        super().loadImage('img/7_statusbars/3_icons/icon_coin.png')
        this.x = Math.random() * mapWidth;
        this.y = Math.random() * mapHeight;
    }
}