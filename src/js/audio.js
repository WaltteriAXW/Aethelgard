/**
 * Audio System
 * Procedural audio generation using Web Audio API
 */

export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.master = null;
    }

    /**
     * Initialize the audio context
     * Must be called after user interaction due to browser autoplay policies
     */
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.25;
        this.master.connect(this.ctx.destination);
    }

    /**
     * Generate a procedural tone
     * @param {number} freq - Base frequency in Hz
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     * @param {number} dur - Duration in seconds
     * @param {number} vol - Volume (0-1)
     * @param {number|null} slide - Target frequency for pitch slide
     */
    tone(freq, type, dur, vol = 1, slide = null) {
        if (!this.ctx) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);

        if (slide) {
            oscillator.frequency.exponentialRampToValueAtTime(
                slide,
                this.ctx.currentTime + dur
            );
        }

        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.ctx.currentTime + dur
        );

        oscillator.connect(gainNode);
        gainNode.connect(this.master);

        oscillator.start();
        oscillator.stop(this.ctx.currentTime + dur);
    }

    /**
     * Predefined sound effects
     */
    sfx = {
        hit: () => this.tone(150, 'sawtooth', 0.1, 0.5),

        slash: () => this.tone(500, 'triangle', 0.1, 0.3, 100),

        dash: () => this.tone(400, 'sine', 0.15, 0.3, 50),

        coin: () => {
            this.tone(1000, 'sine', 0.1, 0.3);
            setTimeout(() => this.tone(1500, 'sine', 0.2, 0.3), 50);
        },

        levelUp: () => {
            const notes = [440, 554, 659, 880];
            notes.forEach((freq, index) => {
                setTimeout(() => this.tone(freq, 'square', 0.4, 0.3), index * 100);
            });
        }
    };
}

// Export singleton instance
export const audioSystem = new AudioSystem();
