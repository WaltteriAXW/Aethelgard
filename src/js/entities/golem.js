/**
 * Golem Enemy - Slow, High HP
 * Tanky enemy that deals heavy damage
 */

import { Enemy } from './enemy.js';
import { CFG } from '../config.js';

export class Golem extends Enemy {
    constructor(x, y) {
        super(x, y);

        // Set golem sprite
        this.spriteKey = 'golem';

        // Override stats for golem
        this.hp = 120; // Much higher HP
        this.speed = 0.4; // Slower
        this.attackTimer = 0;
        this.attackCooldown = 1.5; // Slower attacks
        this.damage = 20; // Higher damage

        // Golem visual should be bigger
        this.w = 40;
        this.h = 40;
    }

    /**
     * Update golem AI - slow but relentless
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        const game = window.game;
        if (!game || !game.player) return;

        const player = game.player;
        const distance = this.distanceTo(player);

        // Chase player if in aggro range (slightly larger aggro)
        if (distance < CFG.ENEMY_AGGRO_RANGE * 1.2) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const normalizedDistance = Math.max(distance, 1);

            // Slow, steady movement
            this.vx += (dx / normalizedDistance) * 400 * dt * this.speed;
            this.vy += (dy / normalizedDistance) * 400 * dt * this.speed;

            // Attack if in range - larger attack radius
            if (distance < CFG.ENEMY_ATTACK_RANGE * 1.3 && this.attackTimer <= 0) {
                player.takeDamage(this.damage);
                this.attackTimer = this.attackCooldown;

                // Screen shake on golem hit
                if (game.camera) {
                    game.camera.shake = 1.5;
                }
            }
        }

        // Update attack timer
        this.attackTimer -= dt;

        // Less friction (maintains momentum)
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Update facing direction
        if (Math.abs(this.vx) > 1) {
            this.face = Math.sign(this.vx);
        }

        // Call base entity update
        const Entity = Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor;
        Entity.prototype.update.call(this, dt);
    }

    /**
     * Golem takes less knockback
     * @param {number} damage - Damage amount
     * @param {number} direction - Knockback direction
     */
    hit(damage, direction) {
        // Just call parent hit method but with adjusted knockback
        super.hit(damage, direction);

        // Override knockback to be less
        this.vx = this.vx * 0.5; // Half the knockback
    }
}
