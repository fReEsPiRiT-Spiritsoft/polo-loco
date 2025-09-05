let canvas;
let world;
let keyboard = new Keyboard();
let lastThrowTime = 0;
let selectedDifficulty = 'medium';

function init() {
    canvas = document.getElementById('canvas');
    // World hier NOCH NICHT erstellen
}

function startGame() {
    initLevel1(); // <-- Level initialisieren!
    world = new World(canvas, keyboard, level1);
    world.start();

    // Endboss-Energie nach Schwierigkeitsgrad setzen
    const endboss = world.enemies.find(e => e instanceof ChickenEndboss);
    if (endboss) {
        if (selectedDifficulty === 'easy') {
            endboss.energy = 60;
            if (world && world.character) {
                world.character.energy = 120;
            }
        }
        
        else if (selectedDifficulty === 'medium') endboss.energy = 80;
        else if (selectedDifficulty === 'hard') {
            endboss.energy = 120;
            if (world && world.character) {
                world.character.energy = 50;
            }
        }
    }

    // Startscreen ausblenden
    const s = document.getElementById('startscreen');
    if (s) s.style.display = 'none';
}

function restartGame() {
    if (world && typeof world.destroy === 'function') {
        world.destroy();
    }
    initLevel1();
    world = new World(canvas, keyboard, level1);
    world.start();
    const s = document.getElementById('endscreen');
    if (s) s.style.display = 'none';
}

function goToMainMenu() {
    location.reload();
}

function toggleFullscreen() {
    const gameDiv = document.querySelector('.game');
    if (!document.fullscreenElement) {
        gameDiv.requestFullscreen && gameDiv.requestFullscreen();
    } else {
        document.exitFullscreen && document.exitFullscreen();
    }
}

document.addEventListener('fullscreenchange', resizeCanvasToFullscreen);
window.addEventListener('resize', resizeCanvasToFullscreen);

function resizeCanvasToFullscreen() {
    const gameDiv = document.querySelector('.game');

    if (document.fullscreenElement === gameDiv) {
        gameDiv.style.width = '100vw';
        gameDiv.style.height = '100vh';
        gameDiv.style.position = 'relative';
        canvas.width = 720;
        canvas.height = 480;

        const aspect = 720 / 480;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let targetW = vw;
        let targetH = targetW / aspect;
        if (targetH > vh) {
            targetH = vh;
            targetW = targetH * aspect;
        }
        const scaleFactor = 0.98;
        targetW *= scaleFactor;
        targetH *= scaleFactor;
        canvas.style.position = 'absolute';
        canvas.style.width = targetW + 'px';
        canvas.style.height = targetH + 'px';
        canvas.style.left = '50%';
        canvas.style.top = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.background = '#000';
    } else {
        gameDiv.style.width = '720px';
        gameDiv.style.height = '480px';

        canvas.width = 720;
        canvas.height = 480;

        canvas.style.position = 'static';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.left = '';
        canvas.style.top = '';
        canvas.style.transform = '';
        canvas.style.background = '';
    }
}

// Bei Fullscreen-Wechsel Canvas anpassen:
document.addEventListener('fullscreenchange', resizeCanvasToFullscreen);

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
        const now = performance.now();
        if (now - lastThrowTime > 750) {
            keyboard.D = true;
            if (world) {
                world.checkThrowObjects();
            }
            lastThrowTime = now;
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

document.getElementById('difficulty').addEventListener('change', function (e) {
    selectedDifficulty = e.target.value;
});

function openControlsModal() {
    document.getElementById('controlsModal').classList.remove('hidden');
}
function closeControlsModal() {
    document.getElementById('controlsModal').classList.add('hidden');
}

// Optional: ESC schließt das Modal
window.addEventListener('keydown', function(e) {
    if (e.key === "Escape") closeControlsModal();
});