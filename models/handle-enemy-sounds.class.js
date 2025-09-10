class EnemySounds {
    static miniChickenPlaying = false;
    static chickenPlaying = false;

    static updateMiniChickenSound(world) {
        this.updateChickenTypeSound(
            world,
            MiniChicken,
            AudioHub.MINI_CHICKEN,
            'miniChickenPlaying'
        );
    }

    static updateChickenSound(world) {
        this.updateChickenTypeSound(
            world,
            Chicken,
            AudioHub.NORMAL_CHICKEN,
            'chickenPlaying'
        );
    }

    static updateChickenTypeSound(world, type, audio, playingFlag) {
        const { chickens, minDist, maxDist } = this.getChickenSoundData(world, type);
        if (chickens.length > 0 && minDist < maxDist) {
            this.playChickenSound(audio, playingFlag, minDist, maxDist);
        } else {
            this.pauseChickenSound(audio, playingFlag);
        }
    }

    static getChickenSoundData(world, type) {
        const chickens = world.enemies.filter(e => e instanceof type && e.energy > 0);
        const charX = world.character.x;
        let minDist = Infinity;
        chickens.forEach(chicken => {
            const dist = Math.abs(chicken.x - charX);
            if (dist < minDist) minDist = dist;
        });
        const maxDist = 600;
        return { chickens, minDist, maxDist };
    }

    static playChickenSound(audio, playingFlag, minDist, maxDist) {
        let volume = 1 - (minDist / maxDist);
        volume = Math.max(0, Math.min(1, volume));
        audio.volume = volume;
        if (!this[playingFlag]) {
            audio.loop = true;
            audio.play();
            this[playingFlag] = true;
        }
    }

    static pauseChickenSound(audio, playingFlag) {
        audio.volume = 0;
        if (this[playingFlag]) {
            audio.pause();
            this[playingFlag] = false;
        }
    }
}