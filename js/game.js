let canvas;
let world;
let keyboard = new Keyboard();
let lastThrowTime = 0;
let selectedDifficulty = 'medium';

function init() {
    canvas = document.getElementById('canvas');
}

function getDifficultySettings() {
    switch (selectedDifficulty) {
        case 'easy':
            return { endbossEnergy: 60, characterEnergy: 120, cloudSpeed: 0.2, darkClouds: false, rain: false };
        case 'medium':
            return { endbossEnergy: 100, characterEnergy: 100, cloudSpeed: 0.4, darkClouds: false, rain: false };
        case 'hard':
            return { endbossEnergy: 140, characterEnergy: 50, cloudSpeed: 1.5, darkClouds: true, rain: true };
        default:
            return { endbossEnergy: 100, characterEnergy: 100, cloudSpeed: 0.4, darkClouds: false, rain: false };
    }
}

function startGame() {
    const settings = getDifficultySettings();
    initLevel1(settings.darkClouds);
    world = new World(canvas, keyboard, level1);
    world.start();
    const endboss = world.enemies.find(e => e instanceof ChickenEndboss);
    if (endboss) {
        endboss.energy = settings.endbossEnergy;
        world.character.energy = settings.characterEnergy;
        world.clouds.forEach(c => c.speed = settings.cloudSpeed);
        if (settings.darkClouds) darkenClouds(world);
        if (settings.rain) world.enableRain = true;
    }
    const s = document.getElementById('startscreen');
    if (s) s.style.display = 'none';
}

function darkenClouds(world) {
    const darkImgs = [
        'img/5_background/layers/4_clouds/1_dark.png',
        'img/5_background/layers/4_clouds/2_dark.png'
    ];
    if (!world.clouds) return;
    world.clouds.forEach(c => {
        c.loadImage(darkImgs[Math.floor(Math.random() * darkImgs.length)]);
        c.isDark = true;
    });
}

function restartGame() {
    if (world && typeof world.destroy === 'function') {
        world.destroy();
    }
    const settings = getDifficultySettings();
    initLevel1(settings.darkClouds);
    world = new World(canvas, keyboard, level1);
    world.start();
    const endboss = world.enemies.find(e => e instanceof ChickenEndboss);
    if (endboss) {
        endboss.energy = settings.endbossEnergy;
        world.character.energy = settings.characterEnergy;
        world.clouds.forEach(c => c.speed = settings.cloudSpeed);
        if (settings.darkClouds) darkenClouds(world);
        if (settings.rain) world.enableRain = true;
    }
    const s = document.getElementById('startscreen');
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

function updateRotateNotice() {
    const el = document.getElementById('rotateNotice');
    if (!el) return;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    el.style.display = (isMobile && isPortrait) ? 'flex' : '';
}

function toggleMenu() {
    const ui = document.getElementById('ui');
    if (!ui) return;
    ui.classList.toggle('open');
}

document.addEventListener('click', (e) => {
    const ui = document.getElementById('ui');
    const toggle = document.getElementById('menuToggle');
    if (!ui || !toggle) return;
    if (window.innerWidth > 900) return; 
    if (!ui.contains(e.target) && e.target !== toggle) {
        ui.classList.remove('open');
    }
});

window.addEventListener('orientationchange', updateRotateNotice);
window.addEventListener('resize', updateRotateNotice);
document.addEventListener('DOMContentLoaded', updateRotateNotice);

document.getElementById('difficulty').addEventListener('change', function (e) {
    selectedDifficulty = e.target.value;
});

function openControlsModal() {
    document.getElementById('controlsModal').classList.remove('hidden');
}
function closeControlsModal() {
    document.getElementById('controlsModal').classList.add('hidden');
}

window.addEventListener('keydown', function (e) {
    if (e.key === "Escape") closeControlsModal();
});

window.addEventListener('keydown', function(e) {
    if (e.key === "Escape") closeImpressumModal();
});

function openImpressumModal() {
    document.getElementById('impressumModal').classList.remove('hidden');
}
function closeImpressumModal() {
    document.getElementById('impressumModal').classList.add('hidden');
}