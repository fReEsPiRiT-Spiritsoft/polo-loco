class AudioHub {
    // Audiodateien für Piano, Guitar, DRUMS
    static CHICKEN_STOMP = new Audio('./audio/chicken_stomp.mp3');
    static FIGHT_FOR_ENDBOSS = new Audio('./audio/fight_for_endboss.mp3');
    static INTRO = new Audio('./audio/intro.mp3');
    static LOOSER = new Audio('./audio/looser.mp3');
    static MINI_CHICKEN_EXPLODE1 = new Audio('./audio/mini_chicken_explode1.mp3');
    static MINI_CHICKEN_EXPLODE2 = new Audio('./audio/mini_chicken_explode2.mp3');
    static MINI_CHICKEN = new Audio('./audio/mini_chicken.mp3');
    static NORMAL_CHICKEN = new Audio('./audio/normal_chicken.mp3');
    static PEPE_HURT = new Audio('./audio/pepe_hurt.mp3');
    static PEPE_JUMP = new Audio('./audio/pepe_jump.mp3');
    static PEPE_LAND = new Audio('./audio/pepe_land.mp3');
    static PEPE_WALK = new Audio('./audio/pepe_walk.mp3');
    static RAIN_HARD = new Audio('./audio/rain_hard.mp3');
    static WINDY_HARD = new Audio('./audio/windy_hard.mp3');
    static WINNER = new Audio('./audio/winner.mp3');

    static allSounds = [
        AudioHub.CHICKEN_STOMP,
        AudioHub.FIGHT_FOR_ENDBOSS,
        AudioHub.INTRO,
        AudioHub.LOOSER,
        AudioHub.MINI_CHICKEN_EXPLODE1,
        AudioHub.MINI_CHICKEN_EXPLODE2,
        AudioHub.MINI_CHICKEN,
        AudioHub.NORMAL_CHICKEN,
        AudioHub.PEPE_HURT,
        AudioHub.PEPE_JUMP,
        AudioHub.PEPE_LAND,
        AudioHub.PEPE_WALK,
        AudioHub.RAIN_HARD,
        AudioHub.WINDY_HARD,
        AudioHub.WINNER
    ];


    // Spielt eine einzelne Audiodatei ab
    static playOne(sound, instrumentId) {
        if (sound.readyState == 4) {  // instrumentId nur wichtig für die Visualisierung
            sound.volume = 0.2;  // Setzt die Lautstärke auf 0.2 = 20% / 1 = 100%
            sound.currentTime = 0;  // Startet ab einer bestimmten stelle (0=Anfang/ 5 = 5 sec.)
            sound.play();  // Spielt das übergebene Sound-Objekt ab
            const instrumentImg = document.getElementById(instrumentId);  // nur wichtig für die Visualisierung
            instrumentImg.classList.add('active');  // nur wichtig für die Visualisierung
        }
    }


    // Stoppt das Abspielen aller Audiodateien
    static stopAll() {
        AudioHub.allSounds.forEach(sound => {
            sound.pause();  // Pausiert jedes Audio in der Liste
        });
        document.getElementById('volume').value = 0.2;  // Setzt den Sound-Slider wieder auf 0.2
        const instrumentImages = document.querySelectorAll('.sound_img'); // nur wichtig für die Visualisierung
        instrumentImages.forEach(img => img.classList.remove('active')); // nur wichtig für die Visualisierung
    }


    // Stoppt das Abspielen einer einzelnen Audiodatei
    static stopOne(sound, instrumentId) {
        sound.pause();  // Pausiert das übergebene Audio
        const instrumentImg = document.getElementById(instrumentId); // nur wichtig für die Visualisierung
        instrumentImg.classList.remove('active'); // nur wichtig für die Visualisierung
    }


    // ##########################################################################################################################
    // ################################################  Sound Slider - BONUS !  ################################################
    // Setzt die Lautstärke für alle Audiodateien
    static objSetVolume(volumeSlider) {
        let volumeValue = document.getElementById('volume').value;  // Holt den aktuellen Lautstärkewert aus dem Inputfeld
        volumeSlider.forEach(sound => {
            sound.volume = volumeValue;  // Setzt die Lautstärke für jedes Audio wie im Slider angegeben
        });
    }
}