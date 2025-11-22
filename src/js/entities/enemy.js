/**
 * Enemy Entity
 * AI-controlled hostile creature
 */

import { Entity } from './entity.js';
import { CFG } from '../config.js';
import { audioSystem } from '../audio.js';
import { Loot } from './loot.js';
import { Particle, FloatingText } from '../particles/particles.js';

export class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, 'skel');

        this.hp = CFG.ENEMY_HP;
        this.attackTimer = 0;
    }

    /**
     * Update enemy AI
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
            const normalizedDistance = Math.max(distance, 1); // Avoid division by zero

            // Move towards player
            this.vx += (dx / normalizedDistance) * 800 * dt;
            this.vy += (dy / normalizedDistance) * 800 * dt;

            // Attack if in range
            if (distance < CFG.ENEMY_ATTACK_RANGE && this.attackTimer <= 0) {
                player.takeDamage(10);
                this.attackTimer = 1.0;
            }
        }

        // Update attack timer
        this.attackTimer -= dt;

        // Apply friction
        this.vx *= 0.9;
        this.vy *= 0.9;

        // Update facing direction
        if (Math.abs(this.vx) > 1) {
            this.face = Math.sign(this.vx);
        }

        super.update(dt);
    }

    /**
     * Take damage
     * @param {number} damage - Damage amount
     * @param {number} direction - Knockback direction (-1 or 1)
     */
    hit(damage, direction) {
        const game = window.game;

        this.hp -= damage;
        this.vx += direction * 400;
        this.flash = 0.1;

        // Hit effects
        game.freeze(0.05);
        audioSystem.sfx.hit();

        // Damage number
        game.particles.push(new FloatingText(
            this.x,
            this.y,
            damage.toString(),
            "#fff"
        ));

        // Death
        if (this.hp <= 0) {
            this.die();
        }
    }

    /**
     * Handle death
     */
    die() {
        const game = window.game;

        this.dead = true;

        // Drop loot
        game.entities.push(new Loot(this.x, this.y));

        // Skeleton-specific: Hot orange explosion particles for impact
        for (let i = 0; i < 15; i++) {
            game.particles.push(new Particle(
                this.x + 16,
                this.y + 16,
                i % 3 === 0 ? '#ffaa00' : '#ff6600'  // Hot orange/red
            ));
        }

        // Update quest progress
        if (game.quest) {
            game.quest.progress();
        }
    }
}
