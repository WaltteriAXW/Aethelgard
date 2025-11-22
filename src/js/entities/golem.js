/**
 * Golem Enemy - Slow, High HP
 * Tanky enemy that deals heavy damage
 */

import { Enemy } from './enemy.js';
import { CFG } from '../config.js';
import { Particle } from '../particles/particles.js';
import { Loot } from './loot.js';

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

                // Heavy directional screen shake with rotation on golem hit
                if (game.addShake) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const len = Math.hypot(dx, dy);
                    game.addShake(1.5, dx / len, dy / len, true);
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
     * Golem takes less knockback and spawns rock debris
     * @param {number} damage - Damage amount
     * @param {number} direction - Knockback direction
     */
    hit(damage, direction) {
        const game = window.game;

        // Just call parent hit method but with adjusted knockback
        super.hit(damage, direction);

        // Override knockback to be less
        this.vx = this.vx * 0.5; // Half the knockback

        // Spawn rock debris on hit
        for (let i = 0; i < 3; i++) {
            game.particles.push(new Particle(
                this.x + 20 + (Math.random() - 0.5) * 20,
                this.y + 20 + (Math.random() - 0.5) * 20,
                i % 2 === 0 ? '#52796f' : '#84a98c'
            ));
        }
    }

    /**
     * Override die to add rock explosion
     */
    die() {
        const game = window.game;

        this.dead = true;

        // Drop loot
        game.entities.push(new Loot(this.x, this.y));

        // Rock debris explosion
        for (let i = 0; i < 15; i++) {
            game.particles.push(new Particle(
                this.x + 20,
                this.y + 20,
                ['#2f3e46', '#52796f', '#84a98c'][i % 3]
            ));
        }

        // Update quest progress
        if (game.quest) {
            game.quest.progress();
        }
    }
}
