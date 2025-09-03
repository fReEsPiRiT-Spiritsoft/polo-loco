let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    // World hier NOCH NICHT erstellen
}

function startGame() {
    const s = document.getElementById('startscreen');
    initLevel1();                    // level1 erzeugen
    world = new World(canvas, keyboard, level1); // jetzt mit Level erstellen
    world.start();
    if (s) s.style.display = 'none';
}

function restartGame() {
    location.reload();
}

window.addEventListener('keydown', (event) => {
    // console.log(event.keyCode)
    if (event.keyCode == 39) {
        keyboard.RIGHT = true;
    }
    if (event.keyCode == 37) {
        keyboard.LEFT = true;
    }
    if (event.keyCode == 38) {
        keyboard.UP = true;
    }
    if (event.keyCode == 40) {
        keyboard.DOWN = true;
    }
    if (event.keyCode == 32) {
        keyboard.SPACE = true;
    }
    if (event.keyCode == 68) {
        keyboard.D = true;
        if (world) {
            world.checkThrowObjects();
        }
    }

});
window.addEventListener('keyup', (event) => {
    if (event.keyCode == 39) {
        keyboard.RIGHT = false;
    }
    if (event.keyCode == 37) {
        keyboard.LEFT = false;
    }
    if (event.keyCode == 38) {
        keyboard.UP = false;
    }
    if (event.keyCode == 40) {
        keyboard.DOWN = false;
    }
    if (event.keyCode == 32) {
        keyboard.SPACE = false;
    }
    if (event.keyCode == 68) {
        keyboard.D = false;
    }

});

