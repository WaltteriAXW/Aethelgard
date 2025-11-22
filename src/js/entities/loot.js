/**
 * Loot Entity
 * Collectible experience orbs
 */

import { Entity } from './entity.js';
import { CFG } from '../config.js';

export class Loot extends Entity {
    constructor(x, y) {
        super(x, y, 'orb');

        this.bobTimer = 0;
        this.baseY = y;
    }

    /**
     * Update loot behavior
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        const game = window.game;
        if (!game || !game.player) return;

        // Bobbing animation
        this.bobTimer += dt * 5;
        this.y = this.baseY + Math.sin(this.bobTimer) * 2;

        // Collection check
        const distance = this.distanceTo(game.player);
        if (distance < 30) {
            this.collect();
        }
    }

    /**
     * Collect this loot
     */
    collect() {
        const game = window.game;

        this.dead = true;
        game.player.gainXP(CFG.XP_PER_KILL);
    }
}
