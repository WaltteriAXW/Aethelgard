/**
 * Player Entity
 * Player-controlled character with combat and movement
 */

import { Entity } from './entity.js';
import { CFG } from '../config.js';
import { input } from '../input.js';
import { audioSystem } from '../audio.js';
import { Enemy } from './enemy.js';
import { SlashEffect, Particle, FloatingText } from '../particles/particles.js';
import { getClass } from '../classes.js';

export class Player extends Entity {
    constructor(x, y, className = 'WARRIOR') {
        super(x, y, 'hero');

        // Load class definition
        this.class = getClass(className);
        this.className = className;

        // Apply class stats
        this.speed = this.class.baseSpeed;
        this.baseDamage = this.class.baseDamage;
        this.dashTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;

        // Initialize stats from class
        this.stats = {
            hp: this.class.baseHp,
            maxHp: this.class.baseHp,
            mana: this.class.baseMana,
            maxMana: this.class.baseMana,
            xp: 0,
            level: 1,
            // Attribute stats
            strength: this.class.strength,
            dexterity: this.class.dexterity,
            intelligence: this.class.intelligence,
            vitality: this.class.vitality
        };

        // Skills and cooldowns
        this.skills = {};
        this.skillCooldowns = {};

        // Initialize skills from class
        this.class.skills.forEach(skill => {
            this.skills[skill.id] = skill;
            this.skillCooldowns[skill.id] = 0;
        });

        // Update UI with class name
        this.updateClassUI();
    }

    /**
     * Update player state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        const game = window.game;

        // Apply friction
        this.vx *= 0.85;
        this.vy *= 0.85;

        let inputX = 0;
        let inputY = 0;

        if (this.dashTimer <= 0) {
            // Movement input
            if (input.isDown('ArrowUp')) inputY = -1;
            if (input.isDown('ArrowDown')) inputY = 1;
            if (input.isDown('ArrowLeft')) {
                inputX = -1;
                this.face = -1;
            }
            if (input.isDown('ArrowRight')) {
                inputX = 1;
                this.face = 1;
            }

            // Normalize diagonal movement
            if (inputX && inputY) {
                inputX *= 0.7;
                inputY *= 0.7;
            }

            // Apply acceleration
            this.vx += inputX * this.speed * dt * 10;
            this.vy += inputY * this.speed * dt * 10;

            // Combo system
            if (this.comboTimer > 0) {
                this.comboTimer -= dt;
            } else {
                this.combo = 0;
            }

            // Attack
            if (input.wasPressed('Space')) {
                this.attack();
            }

            // Dash
            if (input.wasPressed('ShiftLeft') && (inputX || inputY)) {
                this.dash(inputX, inputY);
            }
        } else {
            this.dashTimer -= dt;
        }

        super.update(dt);
    }

    /**
     * Perform attack
     */
    attack() {
        const game = window.game;

        // Increment combo
        this.combo++;
        if (this.combo > 3) {
            this.combo = 1;
        }
        this.comboTimer = CFG.COMBO_TIMEOUT;

        // Show combo indicator on screen
        this.showComboIndicator();

        audioSystem.sfx.slash();

        // Attack hitbox
        const attackX = this.x + 16 + (this.face * 40);
        const attackY = this.y + 16;
        const attackRange = 40;

        // Create enhanced slash visual effect
        game.particles.push(new SlashEffect(
            this.x + 16,
            this.y + 16,
            this.face,
            this.combo
        ));

        // Add weapon trail particles for impact
        const trailColor = this.combo === 3 ? '#ff006e' : '#00ffcc';
        for (let i = 0; i < 3; i++) {
            game.particles.push(new Particle(
                attackX + (Math.random() - 0.5) * 20,
                attackY + (Math.random() - 0.5) * 20,
                trailColor
            ));
        }

        // Check for hits
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x + 16 - attackX,
                    entity.y + 16 - attackY
                );

                if (distance < attackRange) {
                    const damage = CFG.BASE_ATTACK_DAMAGE * this.combo +
                        (this.stats.level * CFG.LEVEL_DAMAGE_BONUS);
                    entity.hit(damage, this.face);
                }
            }
        });
    }

    /**
     * Perform dash
     * @param {number} dirX - X direction (-1, 0, 1)
     * @param {number} dirY - Y direction (-1, 0, 1)
     */
    dash(dirX, dirY) {
        const game = window.game;

        this.dashTimer = CFG.DASH_DURATION;
        this.vx = dirX * CFG.DASH_SPEED;
        this.vy = dirY * CFG.DASH_SPEED;

        audioSystem.sfx.dash();

        // Dash particles with neon cyan (magic energy)
        for (let i = 0; i < 8; i++) {
            game.particles.push(new Particle(this.x + 16, this.y + 16, '#00ffcc'));
        }
    }

    /**
     * Gain experience points
     * @param {number} amount - XP amount
     */
    gainXP(amount) {
        const game = window.game;

        this.stats.xp += amount;

        // Level up check
        const xpRequired = this.stats.level * CFG.XP_PER_LEVEL;
        if (this.stats.xp >= xpRequired) {
            this.levelUp();
        }

        // Update UI
        this.updateUI();
        audioSystem.sfx.coin();
    }

    /**
     * Level up
     */
    levelUp() {
        const game = window.game;

        this.stats.xp = 0;
        this.stats.level++;

        // Use class-specific scaling
        this.stats.maxHp += this.class.hpPerLevel;
        this.stats.maxMana += this.class.manaPerLevel;
        this.stats.hp = this.stats.maxHp;
        this.stats.mana = this.stats.maxMana;

        audioSystem.sfx.levelUp();

        game.particles.push(new FloatingText(
            this.x,
            this.y - 40,
            "LEVEL UP!",
            "#ffb703"
        ));

        this.updateUI();
    }

    /**
     * Take damage
     * @param {number} amount - Damage amount
     */
    takeDamage(amount) {
        const game = window.game;

        // No damage during dash
        if (this.dashTimer > 0) return;

        this.stats.hp -= amount;
        this.flash = 0.2;

        // Update UI
        this.updateUI();

        // Directional camera shake from damage source
        if (game.camera) {
            // Calculate direction from damage (assume from closest enemy)
            const dirX = Math.random() - 0.5;
            const dirY = Math.random() - 0.5;
            game.addShake(1, dirX, dirY, false);
        }

        // Game over
        if (this.stats.hp <= 0) {
            location.reload();
        }
    }

    /**
     * Update UI elements - Diablo-style orbs
     */
    updateUI() {
        // Update Health Orb
        const healthFill = document.getElementById('health-orb-fill');
        const healthValue = document.getElementById('health-value');
        const healthOrb = document.querySelector('.health-orb');

        if (healthFill) {
            const hpPercent = (this.stats.hp / this.stats.maxHp) * 100;
            healthFill.style.height = hpPercent + "%";
        }

        if (healthValue) {
            healthValue.textContent = `${Math.ceil(this.stats.hp)}/${this.stats.maxHp}`;
        }

        // Low health warning glow
        if (healthOrb) {
            if (this.stats.hp < this.stats.maxHp * 0.25) {
                healthOrb.classList.add('low-health');
            } else {
                healthOrb.classList.remove('low-health');
            }
        }

        // Update Mana Orb
        const manaFill = document.getElementById('mana-orb-fill');
        const manaValue = document.getElementById('mana-value');

        if (manaFill) {
            const manaPercent = (this.stats.mana / this.stats.maxMana) * 100;
            manaFill.style.height = manaPercent + "%";
        }

        if (manaValue) {
            manaValue.textContent = `${Math.ceil(this.stats.mana)}/${this.stats.maxMana}`;
        }

        // Update XP bar
        const xpBar = document.getElementById('xp-bar');
        if (xpBar) {
            const xpRequired = this.stats.level * CFG.XP_PER_LEVEL;
            xpBar.style.width = (this.stats.xp / xpRequired) * 100 + "%";
        }

        // Update level text
        const levelText = document.getElementById('lvl-txt');
        if (levelText) {
            levelText.innerText = "LVL " + this.stats.level;
        }
    }

    /**
     * Update class name in UI
     */
    updateClassUI() {
        const classNameEl = document.getElementById('class-name');
        if (classNameEl) {
            classNameEl.innerText = this.class.name.toUpperCase();
            classNameEl.style.color = this.class.color;
        }
    }

    /**
     * Show combo indicator on screen
     */
    showComboIndicator() {
        const indicator = document.getElementById('combo-indicator');
        if (!indicator) return;

        // Set combo text
        indicator.textContent = `COMBO x${this.combo}!`;
        indicator.style.display = 'block';

        // Remove animation class if exists
        indicator.classList.remove('combo-glow');

        // Trigger reflow to restart animation
        void indicator.offsetWidth;

        // Add animation class
        indicator.classList.add('combo-glow');

        // Hide after animation
        setTimeout(() => {
            indicator.style.display = 'none';
            indicator.classList.remove('combo-glow');
        }, 500);
    }
}
