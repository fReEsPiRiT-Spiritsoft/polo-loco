
let level1
function initLevel1() {

    level1 = new Level(

        [
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new MiniChicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new MiniChicken(),
            new MiniChicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new MiniChicken(),
            new Chicken(),
            new Chicken(),
            new ChickenEndboss(),
            new MiniChicken(),
            new MiniChicken(),
            new MiniChicken()
        ],

        [
            new cloud()
        ],

        [
            new backgroundObject('img/5_background/layers/air.png', -720),
            new backgroundObject('img/5_background/layers/3_third_layer/2.png', -720),
            new backgroundObject('img/5_background/layers/2_second_layer/2.png', -720),
            new backgroundObject('img/5_background/layers/1_first_layer/2.png', -720),

            new backgroundObject('img/5_background/layers/air.png', 0),
            new backgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
            new backgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
            new backgroundObject('img/5_background/layers/1_first_layer/1.png', 0),

            new backgroundObject('img/5_background/layers/air.png', 720),
            new backgroundObject('img/5_background/layers/3_third_layer/2.png', 720),
            new backgroundObject('img/5_background/layers/2_second_layer/2.png', 720),
            new backgroundObject('img/5_background/layers/1_first_layer/2.png', 720),

            new backgroundObject('img/5_background/layers/air.png', 1440),
            new backgroundObject('img/5_background/layers/3_third_layer/1.png', 1440),
            new backgroundObject('img/5_background/layers/2_second_layer/1.png', 1440),
            new backgroundObject('img/5_background/layers/1_first_layer/1.png', 1440),

            new backgroundObject('img/5_background/layers/air.png', 2160),
            new backgroundObject('img/5_background/layers/3_third_layer/2.png', 2160),
            new backgroundObject('img/5_background/layers/2_second_layer/2.png', 2160),
            new backgroundObject('img/5_background/layers/1_first_layer/2.png', 2160),

            new backgroundObject('img/5_background/layers/air.png', 2880),
            new backgroundObject('img/5_background/layers/3_third_layer/1.png', 2880),
            new backgroundObject('img/5_background/layers/2_second_layer/1.png', 2880),
            new backgroundObject('img/5_background/layers/1_first_layer/1.png', 2880),

            new backgroundObject('img/5_background/layers/air.png', 3600),
            new backgroundObject('img/5_background/layers/3_third_layer/2.png', 3600),
            new backgroundObject('img/5_background/layers/2_second_layer/2.png', 3600),
            new backgroundObject('img/5_background/layers/1_first_layer/2.png', 3600),

            new backgroundObject('img/5_background/layers/air.png', 4320),
            new backgroundObject('img/5_background/layers/3_third_layer/1.png', 4320),
            new backgroundObject('img/5_background/layers/2_second_layer/1.png', 4320),
            new backgroundObject('img/5_background/layers/1_first_layer/1.png', 4320),

            new backgroundObject('img/5_background/layers/air.png', 5040),
            new backgroundObject('img/5_background/layers/3_third_layer/2.png', 5040),
            new backgroundObject('img/5_background/layers/2_second_layer/2.png', 5040),
            new backgroundObject('img/5_background/layers/1_first_layer/2.png', 5040),

            new backgroundObject('img/5_background/layers/air.png', 5760),
            new backgroundObject('img/5_background/layers/3_third_layer/1.png', 5760),
            new backgroundObject('img/5_background/layers/2_second_layer/1.png', 5760),
            new backgroundObject('img/5_background/layers/1_first_layer/1.png', 5760),

            new backgroundObject('img/5_background/layers/air.png', 6480),
            new backgroundObject('img/5_background/layers/3_third_layer/2.png', 6480),
            new backgroundObject('img/5_background/layers/2_second_layer/2.png', 6480),
            new backgroundObject('img/5_background/layers/1_first_layer/2.png', 6480),

            new backgroundObject('img/5_background/layers/air.png', 7200),
            new backgroundObject('img/5_background/layers/3_third_layer/1.png', 7200),
            new backgroundObject('img/5_background/layers/2_second_layer/1.png', 7200),
            new backgroundObject('img/5_background/layers/1_first_layer/1.png', 7200)
        ],

        [
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableCoin(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle(),
            new CollectableBottle()
        ]
    );
}