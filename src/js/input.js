/**
 * Input System
 * Handles keyboard and touch input with key mapping
 */

export class Input {
    constructor() {
        this.keys = {};
        this.pressed = {};
        this.initialized = false;

        // Key aliases for WASD/Arrow compatibility
        this.aliases = {
            'KeyW': 'ArrowUp',
            'KeyA': 'ArrowLeft',
            'KeyS': 'ArrowDown',
            'KeyD': 'ArrowRight'
        };
    }

    /**
     * Initialize input listeners
     */
    init() {
        if (this.initialized) return;

        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (!e.repeat) {
                this.pressed[e.code] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Touch controls
        this.bindTouchControls('.d-btn');
        this.bindTouchControls('.t-btn');

        this.initialized = true;
    }

    /**
     * Bind touch events to elements
     * @param {string} selector - CSS selector for touch elements
     */
    bindTouchControls(selector) {
        document.querySelectorAll(selector).forEach(element => {
            const keyCode = element.dataset.k;
            if (!keyCode) return;

            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[keyCode] = true;
                this.pressed[keyCode] = true;
            });

            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[keyCode] = false;
            });
        });
    }

    /**
     * Check if a key is currently held down
     * @param {string} code - Key code to check
     * @returns {boolean}
     */
    isDown(code) {
        return this.keys[code] || this.keys[this.aliases[code]] || false;
    }

    /**
     * Check if a key was just pressed this frame
     * @param {string} code - Key code to check
     * @returns {boolean}
     */
    wasPressed(code) {
        return this.pressed[code] || this.pressed[this.aliases[code]] || false;
    }

    /**
     * Clear pressed keys (call at end of frame)
     */
    flush() {
        this.pressed = {};
    }

    /**
     * Show mobile controls if touch is supported
     */
    showMobileControls() {
        if ('ontouchstart' in window) {
            const controls = document.getElementById('mob-ctrl');
            if (controls) {
                controls.style.display = 'block';
            }
        }
    }
}

// Export singleton instance
export const input = new Input();
