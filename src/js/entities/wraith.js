/**
 * Wraith Enemy - Fast, Low HP
 * Quick-moving enemy that darts around the player
 */

import { Enemy } from './enemy.js';
import { CFG } from '../config.js';

export class Wraith extends Enemy {
    constructor(x, y) {
        super(x, y);

        // Set wraith sprite
        this.spriteKey = 'wraith';

        // Override stats for wraith
        this.hp = 30; // Lower HP
        this.speed = 1.8; // Much faster
        this.attackTimer = 0;
        this.attackCooldown = 0.6; // Faster attacks
        this.damage = 8; // Lower damage

        // Wraith-specific behavior
        this.dashTimer = 0;
        this.dashCooldown = 2.0;
    }

    /**
     * Update wraith AI with dash behavior
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        const game = window.game;
        if (!game || !game.player) return;

        const player = game.player;
        const distance = this.distanceTo(player);

        // Chase player if in aggro range
        if (distance < CFG.ENEMY_AGGRO_RANGE) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const normalizedDistance = Math.max(distance, 1);

            // Dash behavior
            if (this.dashTimer > 0) {
                this.dashTimer -= dt;
            } else if (distance < 200 && distance > 50) {
                // Dash towards player
                this.vx = (dx / normalizedDistance) * 1200;
                this.vy = (dy / normalizedDistance) * 1200;
                this.dashTimer = this.dashCooldown;
            } else {
                // Normal movement (faster than regular enemy)
                this.vx += (dx / normalizedDistance) * 1200 * dt;
                this.vy += (dy / normalizedDistance) * 1200 * dt;
            }

            // Attack if in range
            if (distance < CFG.ENEMY_ATTACK_RANGE && this.attackTimer <= 0) {
                player.takeDamage(this.damage);
                this.attackTimer = this.attackCooldown;
            }
        }

        // Update attack timer
        this.attackTimer -= dt;

        // Apply higher friction for snappier movement
        this.vx *= 0.85;
        this.vy *= 0.85;

        // Update facing direction
        if (Math.abs(this.vx) > 1) {
            this.face = Math.sign(this.vx);
        }

        // Call base entity update (not Enemy's update to avoid double logic)
        const Entity = Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor;
        Entity.prototype.update.call(this, dt);
    }
}
