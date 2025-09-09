class EnemySounds {
    static miniChickenPlaying = false;
    static chickenPlaying = false;

    static updateMiniChickenSound(world) {
        const chickens = world.enemies.filter(e => e instanceof MiniChicken && e.energy > 0);
        const charX = world.character.x;
        let minDist = Infinity;
        chickens.forEach(chicken => {
            const dist = Math.abs(chicken.x - charX);
            if (dist < minDist) minDist = dist;
        });
        const maxDist = 600;
        if (chickens.length > 0 && minDist < maxDist) {
            let volume = 1 - (minDist / maxDist);
            volume = Math.max(0, Math.min(1, volume));
            AudioHub.MINI_CHICKEN.volume = volume;
            if (!this.miniChickenPlaying) {
                AudioHub.MINI_CHICKEN.loop = true;
                AudioHub.MINI_CHICKEN.play();
                this.miniChickenPlaying = true;
            }
        } else {
            AudioHub.MINI_CHICKEN.volume = 0;
            if (this.miniChickenPlaying) {
                AudioHub.MINI_CHICKEN.pause();
                this.miniChickenPlaying = false;
            }
        }
    }

    static updateChickenSound(world) {
        const chickens = world.enemies.filter(e => e instanceof Chicken && e.energy > 0);
        const charX = world.character.x;
        let minDist = Infinity;
        chickens.forEach(chicken => {
            const dist = Math.abs(chicken.x - charX);
            if (dist < minDist) minDist = dist;
        });
        const maxDist = 600;
        if (chickens.length > 0 && minDist < maxDist) {
            let volume = 1 - (minDist / maxDist);
            volume = Math.max(0, Math.min(1, volume));
            AudioHub.NORMAL_CHICKEN.volume = volume;
            if (!this.chickenPlaying) {
                AudioHub.NORMAL_CHICKEN.loop = true;
                AudioHub.NORMAL_CHICKEN.play();
                this.chickenPlaying = true;
            }
        } else {
            AudioHub.NORMAL_CHICKEN.volume = 0;
            if (this.chickenPlaying) {
                AudioHub.NORMAL_CHICKEN.pause();
                this.chickenPlaying = false;
            }
        }
    }
}