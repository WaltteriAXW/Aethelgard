/**
 * Corpse Entity
 * Persistent dead enemy bodies with fade-out
 */

import { CFG } from '../config.js';

export class Corpse {
    constructor(x, y, spriteKey, fadeTime = CFG.CORPSE_FADE_TIME) {
        this.x = x;
        this.y = y;
        this.spriteKey = spriteKey;
        this.alpha = 1;
        this.fadeTimer = fadeTime;
        this.rotation = (Math.random() - 0.5) * 0.3; // Slight random rotation
        this.dead = false;
    }

    /**
     * Update corpse (fade out over time)
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        this.fadeTimer -= dt;

        if (this.fadeTimer <= 5) {
            // Start fading in last 5 seconds
            this.alpha = this.fadeTimer / 5;
        }

        if (this.fadeTimer <= 0) {
            this.dead = true;
        }
    }

    /**
     * Draw corpse
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.6; // Corpses are darker/more transparent
        ctx.translate(this.x + 16, this.y + 16);
        ctx.rotate(this.rotation);

        // Draw based on enemy type
        switch(this.spriteKey) {
            case 'skel':
                this.drawSkeletonCorpse(ctx);
                break;
            case 'wraith':
                this.drawWraithCorpse(ctx);
                break;
            case 'golem':
                this.drawGolemCorpse(ctx);
                break;
        }

        ctx.restore();
    }

    /**
     * Draw skeleton corpse (bones)
     */
    drawSkeletonCorpse(ctx) {
        // Pile of bones
        ctx.fillStyle = '#d0d0c8';

        // Ribcage
        ctx.fillRect(-8, -4, 16, 8);

        // Skull (flattened)
        ctx.beginPath();
        ctx.ellipse(-10, -8, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bones scattered
        ctx.fillRect(4, 2, 10, 2);
        ctx.fillRect(-12, 4, 8, 2);

        // Dark shading
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-8, -4, 16, 4);
    }

    /**
     * Draw wraith corpse (dissipating energy)
     */
    drawWraithCorpse(ctx) {
        // Purple ethereal remains
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        gradient.addColorStop(0, '#6a4c93');
        gradient.addColorStop(1, 'rgba(106, 76, 147, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wispy trails
        ctx.globalAlpha *= 0.5;
        for (let i = 0; i < 3; i++) {
            const offset = i * 5;
            ctx.beginPath();
            ctx.ellipse(offset - 6, 6, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw golem corpse (rubble)
     */
    drawGolemCorpse(ctx) {
        // Rock chunks
        ctx.fillStyle = '#667788';

        // Large chunk
        ctx.fillRect(-10, -6, 12, 10);

        // Smaller chunks
        ctx.fillRect(4, -4, 8, 8);
        ctx.fillRect(-6, 6, 10, 6);

        // Cracks
        ctx.strokeStyle = 'rgba(30, 40, 50, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(-2, 6);
        ctx.moveTo(6, 0);
        ctx.lineTo(10, 4);
        ctx.stroke();

        // Dark shading
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(-10, 0, 12, 6);
    }
}
