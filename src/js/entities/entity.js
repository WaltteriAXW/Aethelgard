/**
 * Base Entity Class
 * Foundation for all game entities (player, enemies, loot)
 */

import { CFG } from '../config.js';
import { graphics } from '../graphics.js';

export class Entity {
    /**
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @param {string} spriteKey - Graphics sprite identifier
     */
    constructor(x, y, spriteKey) {
        this.x = x;
        this.y = y;
        this.w = 32;  // Width
        this.h = 32;  // Height
        this.spriteKey = spriteKey;

        this.vx = 0;  // X velocity
        this.vy = 0;  // Y velocity
        this.face = 1;  // Facing direction (-1 = left, 1 = right)
        this.flash = 0;  // Flash effect timer
        this.dead = false;
    }

    /**
     * Update entity state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Apply velocity
        this.x += this.vx * dt;
        this.handleCollision(true);

        this.y += this.vy * dt;
        this.handleCollision(false);

        // Update flash effect
        if (this.flash > 0) {
            this.flash -= dt;
        }
    }

    /**
     * Handle collision with walls
     * @param {boolean} isX - True if checking X-axis collision
     */
    handleCollision(isX) {
        // Import game instance dynamically to avoid circular dependency
        const game = window.game;
        if (!game || !game.map) return;

        const tileSize = CFG.TILE;
        const left = Math.floor(this.x / tileSize);
        const right = Math.floor((this.x + this.w) / tileSize);
        const top = Math.floor(this.y / tileSize);
        const bottom = Math.floor((this.y + this.h) / tileSize);

        // Check if colliding with walls
        const collidesWithWall =
            game.map.get(left, top) > 1 ||
            game.map.get(right, top) > 1 ||
            game.map.get(left, bottom) > 1 ||
            game.map.get(right, bottom) > 1;

        if (collidesWithWall) {
            if (isX) {
                this.vx *= -0.5;
                this.x -= this.vx * 0.1;
            } else {
                this.vy *= -0.5;
                this.y -= this.vy * 0.1;
            }
        }
    }

    /**
     * Draw the entity
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const sprite = graphics.get(this.spriteKey);
        if (!sprite) return;

        ctx.save();
        ctx.translate(
            Math.floor(this.x + 16),
            Math.floor(this.y + 16)
        );
        ctx.scale(this.face * CFG.SCALE, CFG.SCALE);

        // Flash effect
        if (this.flash > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = '#fff';
        }

        ctx.drawImage(sprite, -8, -8);

        if (this.flash > 0) {
            ctx.fillRect(-8, -8, 16, 16);
        }

        ctx.restore();
    }

    /**
     * Get entity center position
     * @returns {Object} Center position {x, y}
     */
    getCenter() {
        return {
            x: this.x + 16,
            y: this.y + 16
        };
    }

    /**
     * Calculate distance to another entity
     * @param {Entity} other - Other entity
     * @returns {number} Distance in pixels
     */
    distanceTo(other) {
        const center = this.getCenter();
        const otherCenter = other.getCenter();
        return Math.hypot(center.x - otherCenter.x, center.y - otherCenter.y);
    }
}
