/**
 * Blood Stain
 * Persistent blood splatters on the ground
 */

import { CFG } from '../config.js';

export class BloodStain {
    constructor(x, y, size = 1) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.alpha = 0.8;
        this.fadeTimer = CFG.BLOOD_STAIN_DURATION;
        this.dead = false;

        // Random splatter pattern
        this.splats = [];
        const count = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            this.splats.push({
                offsetX: (Math.random() - 0.5) * 20 * size,
                offsetY: (Math.random() - 0.5) * 20 * size,
                radius: (2 + Math.random() * 4) * size
            });
        }
    }

    /**
     * Update blood stain (fade over time)
     * @param {number} dt - Delta time
     */
    update(dt) {
        this.fadeTimer -= dt;

        if (this.fadeTimer <= 10) {
            // Start fading in last 10 seconds
            this.alpha = (this.fadeTimer / 10) * 0.8;
        }

        if (this.fadeTimer <= 0) {
            this.dead = true;
        }
    }

    /**
     * Draw blood stain on ground
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Dried blood color (dark crimson)
        this.splats.forEach(splat => {
            const gradient = ctx.createRadialGradient(
                this.x + splat.offsetX,
                this.y + splat.offsetY,
                0,
                this.x + splat.offsetX,
                this.y + splat.offsetY,
                splat.radius
            );

            gradient.addColorStop(0, '#4a0000');
            gradient.addColorStop(0.6, '#3a0000');
            gradient.addColorStop(1, 'rgba(58, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                this.x + splat.offsetX,
                this.y + splat.offsetY,
                splat.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        ctx.restore();
    }
}
