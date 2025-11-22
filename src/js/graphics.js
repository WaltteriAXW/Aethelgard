/**
 * Graphics System
 * Procedural sprite generation and asset management
 */

export class Graphics {
    constructor() {
        this.cache = {};

        // Color palettes with warm/cold contrast for "trailer look"
        this.palettes = {
            hero: {
                a: '#2a2a3e',  // Cool dark blue armor
                s: '#ffcb9a',  // Skin
                c: '#3e3e5a',  // Cool purple cloth
                h: '#00ffcc',  // Neon cyan highlights (magic)
                x: '#ffaa00'   // Hot orange emblem
            },
            skel: {
                a: '#2a2a3e',  // Cool shadow
                b: '#e1e5f2',  // Bone white
                r: '#ff0055'   // Vibrant red eyes
            },
            wraith: {
                a: '#1d1d3a',  // Dark cool shadow
                b: '#5a4c93',  // Rich purple body
                e: '#b185db',  // Light purple aura
                r: '#ff006e'   // Hot pink/magenta eyes
            },
            golem: {
                a: '#2f3e46',  // Dark cool rock
                b: '#52796f',  // Medium teal rock
                c: '#6a9c89',  // Light cool rock
                e: '#ffaa00'   // Hot orange core/eyes
            },
            loot: {
                g: '#ffaa00',  // Hot orange gold
                w: '#fff'      // White shine
            }
        };

        // Sprite definitions (16x16 pixel art)
        this.definitions = {
            hero: [
                '.....aaaa.......',
                '....aaaaaa......',
                '....assssa......',
                '....assssa......',
                '...aaccccaa.....',
                '..aaccxxccaa....',
                '..accxxxxcca....',
                '..acccccccca....',
                '...aaaccaaa.....',
                '...a..aa........',
                '..aa..aa........',
                '..aa..aa........'
            ],
            skel: [
                '.....aaaa.......',
                '....abbbba......',
                '....abrbra......',
                '....abbbba......',
                '...aabbbbaa.....',
                '..aababbbaa.....',
                '..ababbbbba.....',
                '..aabbbbaa......',
                '...aa..aa.......',
                '...a....a.......',
                '..aa....aa......',
                '................'
            ],
            wraith: [
                '.....aaaa.......',
                '....abbbba......',
                '....abreeba.....',
                '....abbbba......',
                '...aabbbaa......',
                '..aabbbbbaa.....',
                '..abbebbea......',
                '..aabbbaaa......',
                '...aa.aa........',
                '...a...a........',
                '..aa...aa.......',
                '................'
            ],
            golem: [
                '....aaaaaa......',
                '...abbbbba......',
                '..abbcbcbba.....',
                '..abceecba......',
                '..abbccbbba.....',
                '.abbbbbbbbba....',
                '.abbbcccbbba....',
                '..abbbbbbba.....',
                '...aa..aa.......',
                '...aa..aa.......',
                '..aa....aa......',
                '................'
            ],
            orb: [
                '.....gggg.......',
                '...gggggggg.....',
                '..ggggwggggg....',
                '..gggwgggggg....',
                '..gggggggggg....',
                '...gggggggg.....',
                '.....gggg.......',
                '................'
            ]
        };
    }

    /**
     * Generate all sprite assets
     */
    generate() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');

        for (const key in this.definitions) {
            ctx.clearRect(0, 0, 16, 16);
            const sprite = this.definitions[key];
            const palette = this.palettes[key] || {};

            sprite.forEach((row, y) => {
                row.split('').forEach((char, x) => {
                    if (char === '.') return;

                    // Special handling for hero emblem
                    if (key === 'hero' && char === 'x') {
                        ctx.fillStyle = palette.x;
                    } else if (palette[char]) {
                        ctx.fillStyle = palette[char];
                    } else {
                        return;
                    }

                    ctx.fillRect(x, y, 1, 1);
                });
            });

            // Create image from canvas
            const image = new Image();
            image.src = canvas.toDataURL();
            this.cache[key] = image;
        }
    }

    /**
     * Get a cached sprite image
     * @param {string} key - Sprite identifier
     * @returns {Image|null}
     */
    get(key) {
        return this.cache[key] || null;
    }
}

// Export singleton instance
export const graphics = new Graphics();
