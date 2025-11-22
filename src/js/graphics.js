/**
 * Graphics System
 * Procedural sprite generation and asset management
 */

export class Graphics {
    constructor() {
        this.cache = {};

        // Color palettes for different sprite types
        this.palettes = {
            hero: {
                a: '#1d3557',  // Armor blue
                s: '#ffcb9a',  // Skin
                c: '#457b9d',  // Cape/cloth
                h: '#f1faee',  // Highlights
                x: '#ffb703'   // Emblem/accent
            },
            skel: {
                a: '#1d3557',  // Shadow
                b: '#e1e5f2',  // Bone white
                r: '#e63946'   // Red eyes
            },
            loot: {
                g: '#ffb703',  // Gold
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
