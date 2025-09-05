class ShiftCamera {

    bossShiftActive = false;
    lastBossShiftActive = false;
    camTransitionActive = false;
    camTransitionStart = 0;
    camTransitionFrom = 0;
    camTransitionTo = 0;
    CAM_TRANSITION_DURATION = 450; // ms
    CAM_LEFT_OFFSET = 100; // dein Standard links
    CAM_RIGHT_OFFSET_EXTRA = 100; // der -100 Teil aus deiner rechten Formel


    bossShiftMinHoldUntil = 2000; // Mindest-Haltedauer (ms) der Boss-Perspektive
    cameraSmoothFactor = 0.12;   // 0.05 langsamer, 0.2 schneller
    cameraSnapThreshold = 1.0;

    // Konfiguration
    BOSS_SHIFT_MAX_DISTANCE = 1200;   // weiter weg? -> nicht verschieben
    BOSS_SHIFT_ACTIVATE_DELTA = 60;   // Boss so viel links vom Character -> aktivieren
    BOSS_SHIFT_DEACTIVATE_DELTA = 20; // Boss kommt wieder näher / rechts -> deaktivieren
    BOSS_SHIFT_MIN_HOLD = 500;


    updateCamera() {
        this.evaluateBossCamera();
        if (this.bossShiftActive !== this.lastBossShiftActive) {
            this.startCameraTransition();
        }
        if (this.camTransitionActive) {
            this.updateCameraTransition();
        } else {
            this.setCameraTarget();
        }
        this.camera_x = Math.round(this.camera_x);
    }

    startCameraTransition() {
        this.lastBossShiftActive = this.bossShiftActive;
        const target = this.bossShiftActive
            ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
            : (-this.character.x + this.CAM_LEFT_OFFSET);
        this.camTransitionFrom = this.camera_x;
        this.camTransitionTo = target;
        this.camTransitionStart = performance.now();
        this.camTransitionActive = true;
    }

    updateCameraTransition() {
        const now = performance.now();
        let t = (now - this.camTransitionStart) / this.CAM_TRANSITION_DURATION;
        if (t >= 1) {
            t = 1;
            this.camTransitionActive = false;
        }
        const eased = t * t * (3 - 2 * t);
        this.camera_x = this.camTransitionFrom + (this.camTransitionTo - this.camTransitionFrom) * eased;
    }

    setCameraTarget() {
        this.camera_x = this.bossShiftActive
            ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
            : (-this.character.x + this.CAM_LEFT_OFFSET);
    }

    evaluateBossCamera() {
        const boss = this.enemies.find(e => e instanceof ChickenEndboss && !e.isDead);
        if (!boss) {
            this.bossShiftActive = false;
            return;
        }
        this.updateBossShiftState(boss);
    }

    updateBossShiftState(boss) {
        const now = performance.now();
        const dx = this.character.x - boss.x;
        const absDx = Math.abs(dx);

        if (this.shouldActivateBossShift(dx, absDx)) {
            this.activateBossShift(now);
            return;
        }
        if (this.bossShiftActive) {
            this.checkBossShiftDeactivate(dx, absDx, now);
        }
    }

    shouldActivateBossShift(dx, absDx) {
        return !this.bossShiftActive &&
            dx > this.BOSS_SHIFT_ACTIVATE_DELTA &&
            absDx < this.BOSS_SHIFT_MAX_DISTANCE;
    }

    activateBossShift(now) {
        this.bossShiftActive = true;
        this.bossShiftMinHoldUntil = now + this.BOSS_SHIFT_MIN_HOLD;
    }

    checkBossShiftDeactivate(dx, absDx, now) {
        const holdDone = now >= this.bossShiftMinHoldUntil;
        const bossNoLongerLeft = dx < this.BOSS_SHIFT_DEACTIVATE_DELTA;
        const tooFar = absDx >= this.BOSS_SHIFT_MAX_DISTANCE;
        if (holdDone && (bossNoLongerLeft || tooFar)) {
            this.bossShiftActive = false;
        }
    }

}