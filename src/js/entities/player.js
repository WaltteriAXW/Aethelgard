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

        // Mana regeneration
        this.manaRegenRate = 5; // Mana per second

        // Update UI with class name
        this.updateClassUI();
        this.updateSkillUI();
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

            // Skill inputs (keys 1-4)
            if (input.wasPressed('Digit1')) this.useSkill(0);
            if (input.wasPressed('Digit2')) this.useSkill(1);
            if (input.wasPressed('Digit3')) this.useSkill(2);
            if (input.wasPressed('Digit4')) this.useSkill(3);
        } else {
            this.dashTimer -= dt;
        }

        // Update skill cooldowns
        this.updateSkillCooldowns(dt);

        // Mana regeneration
        this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + this.manaRegenRate * dt);

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

    /**
     * Use a skill by index (0-3)
     * @param {number} skillIndex - Skill slot index
     */
    useSkill(skillIndex) {
        const game = window.game;
        const skillArray = this.class.skills;

        if (skillIndex >= skillArray.length) return;

        const skill = skillArray[skillIndex];

        // Check cooldown
        if (this.skillCooldowns[skill.id] > 0) {
            // Show cooldown message
            game.particles.push(new FloatingText(
                this.x,
                this.y - 60,
                "ON COOLDOWN",
                "#888888"
            ));
            return;
        }

        // Check mana
        if (this.stats.mana < skill.manaCost) {
            game.particles.push(new FloatingText(
                this.x,
                this.y - 60,
                "NOT ENOUGH MANA",
                "#1e90ff"
            ));
            return;
        }

        // Consume mana
        this.stats.mana -= skill.manaCost;

        // Apply cooldown
        this.skillCooldowns[skill.id] = skill.cooldown;

        // Execute skill effect
        this.executeSkill(skill);

        // Update UI
        this.updateUI();
        this.updateSkillUI();
    }

    /**
     * Execute skill effect based on skill ID
     * @param {Object} skill - Skill definition
     */
    executeSkill(skill) {
        const game = window.game;

        // Skill name feedback
        game.particles.push(new FloatingText(
            this.x,
            this.y - 80,
            skill.name.toUpperCase(),
            this.class.color
        ));

        // Execute skill-specific effect
        switch(skill.id) {
            case 'whirlwind':
                this.skillWhirlwind();
                break;
            case 'cleave':
                this.skillCleave();
                break;
            case 'warcry':
                this.skillWarCry();
                break;
            case 'berserk':
                this.skillBerserk();
                break;
            case 'backstab':
                this.skillBackstab();
                break;
            case 'shadowstep':
                this.skillShadowStep();
                break;
            case 'poisonblade':
                this.skillPoisonBlade();
                break;
            case 'fanofknives':
                this.skillFanOfKnives();
                break;
            case 'fireball':
                this.skillFireball();
                break;
            case 'frostnova':
                this.skillFrostNova();
                break;
            case 'teleport':
                this.skillTeleport();
                break;
            case 'meteor':
                this.skillMeteor();
                break;
            case 'holysmite':
                this.skillHolySmite();
                break;
            case 'divineprotection':
                this.skillDivineProtection();
                break;
            case 'heal':
                this.skillHeal();
                break;
            case 'consecration':
                this.skillConsecration();
                break;
        }
    }

    /**
     * WARRIOR SKILLS
     */

    skillWhirlwind() {
        const game = window.game;
        audioSystem.sfx.slash();

        // Spin animation particles
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 60;
            game.particles.push(new Particle(
                this.x + 16 + Math.cos(angle) * radius,
                this.y + 16 + Math.sin(angle) * radius,
                '#e63946'
            ));
        }

        // Damage all nearby enemies
        const whirlwindRange = 80;
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x + 16 - (this.x + 16),
                    entity.y + 16 - (this.y + 16)
                );

                if (distance < whirlwindRange) {
                    const damage = this.baseDamage * 1.5 + (this.stats.level * 5);
                    entity.hit(damage, Math.sign(entity.x - this.x));
                }
            }
        });

        // Screen shake
        game.addShake(0.8, 0, 0, true);
    }

    skillCleave() {
        const game = window.game;
        audioSystem.sfx.slash();

        // Wide arc slash effect
        const cleaveAngle = Math.PI / 2; // 90 degree arc
        const cleaveRange = 70;

        // Create arc particles
        for (let i = 0; i < 10; i++) {
            const angle = (this.face > 0 ? 0 : Math.PI) + (i / 10 - 0.5) * cleaveAngle;
            game.particles.push(new Particle(
                this.x + 16 + Math.cos(angle) * cleaveRange,
                this.y + 16 + Math.sin(angle) * cleaveRange,
                '#e63946'
            ));
        }

        // Damage enemies in front arc
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const dx = entity.x + 16 - (this.x + 16);
                const dy = entity.y + 16 - (this.y + 16);
                const distance = Math.hypot(dx, dy);

                // Check if in front and within range
                if (distance < cleaveRange && Math.sign(dx) === this.face) {
                    const damage = this.baseDamage * 2 + (this.stats.level * 8);
                    entity.hit(damage, this.face);
                }
            }
        });

        game.addShake(0.6, this.face, 0, false);
    }

    skillWarCry() {
        const game = window.game;

        // Sound wave particles
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 200 + Math.random() * 100;
            game.particles.push(new Particle(
                this.x + 16,
                this.y + 16,
                '#ffb703',
                speed * Math.cos(angle),
                speed * Math.sin(angle)
            ));
        }

        // Stun nearby enemies (slow them down)
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x + 16 - (this.x + 16),
                    entity.y + 16 - (this.y + 16)
                );

                if (distance < 150) {
                    entity.vx = 0;
                    entity.vy = 0;
                    entity.flash = 0.3;
                }
            }
        });

        game.addShake(1, 0, 0, true);
    }

    skillBerserk() {
        const game = window.game;

        // Red rage aura
        for (let i = 0; i < 20; i++) {
            game.particles.push(new Particle(
                this.x + 16 + (Math.random() - 0.5) * 40,
                this.y + 16 + (Math.random() - 0.5) * 40,
                '#8B0000'
            ));
        }

        // Boost damage temporarily (would need buff system)
        game.particles.push(new FloatingText(
            this.x,
            this.y - 100,
            "BERSERK MODE!",
            '#8B0000'
        ));

        game.addFlash(0.3);
    }

    /**
     * ROGUE SKILLS (Basic implementations)
     */

    skillBackstab() {
        const game = window.game;

        // Find nearest enemy
        let nearest = null;
        let nearestDist = Infinity;

        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x - this.x,
                    entity.y - this.y
                );
                if (distance < nearestDist && distance < 200) {
                    nearest = entity;
                    nearestDist = distance;
                }
            }
        });

        if (nearest) {
            // Teleport behind enemy
            this.x = nearest.x - 40;
            this.y = nearest.y;

            // Critical damage
            const damage = this.baseDamage * 3 + (this.stats.level * 10);
            nearest.hit(damage, 1);

            // Purple smoke effect
            for (let i = 0; i < 15; i++) {
                game.particles.push(new Particle(
                    this.x + 16,
                    this.y + 16,
                    '#b185db'
                ));
            }
        }
    }

    skillShadowStep() {
        const game = window.game;

        // Dash forward with shadow trail
        this.vx = this.face * 800;

        for (let i = 0; i < 20; i++) {
            game.particles.push(new Particle(
                this.x + 16,
                this.y + 16,
                '#b185db'
            ));
        }
    }

    skillPoisonBlade() {
        const game = window.game;

        game.particles.push(new FloatingText(
            this.x,
            this.y - 100,
            "POISON ACTIVE",
            '#57cc99'
        ));

        for (let i = 0; i < 10; i++) {
            game.particles.push(new Particle(
                this.x + 16,
                this.y + 16,
                '#57cc99'
            ));
        }
    }

    skillFanOfKnives() {
        const game = window.game;

        // Throw projectiles in all directions
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 300;
            game.particles.push(new Particle(
                this.x + 16,
                this.y + 16,
                '#b185db',
                speed * Math.cos(angle),
                speed * Math.sin(angle)
            ));
        }

        // Damage all nearby
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x - this.x,
                    entity.y - this.y
                );
                if (distance < 150) {
                    entity.hit(this.baseDamage * 1.2, Math.sign(entity.x - this.x));
                }
            }
        });
    }

    /**
     * MAGE SKILLS (Basic implementations)
     */

    skillFireball() {
        const game = window.game;

        // Create fireball projectile effect
        for (let i = 0; i < 15; i++) {
            game.particles.push(new Particle(
                this.x + 16 + this.face * 50,
                this.y + 16,
                i % 2 === 0 ? '#ff6600' : '#ffaa00'
            ));
        }

        // Simple AOE damage in front
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const dx = entity.x - (this.x + this.face * 100);
                const dy = entity.y - this.y;
                const distance = Math.hypot(dx, dy);

                if (distance < 80) {
                    entity.hit(this.baseDamage * 2, this.face);
                }
            }
        });

        game.addShake(0.5, this.face, 0, false);
    }

    skillFrostNova() {
        const game = window.game;

        // Ice explosion
        for (let i = 0; i < 25; i++) {
            const angle = (i / 25) * Math.PI * 2;
            const speed = 150;
            game.particles.push(new Particle(
                this.x + 16,
                this.y + 16,
                '#00ffff',
                speed * Math.cos(angle),
                speed * Math.sin(angle)
            ));
        }

        // Freeze nearby enemies
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x - this.x,
                    entity.y - this.y
                );
                if (distance < 120) {
                    entity.vx = 0;
                    entity.vy = 0;
                    entity.flash = 0.5;
                }
            }
        });

        game.addShake(0.7, 0, 0, true);
    }

    skillTeleport() {
        const game = window.game;

        // Teleport forward
        this.x += this.face * 150;

        // Lightning effect
        for (let i = 0; i < 20; i++) {
            game.particles.push(new Particle(
                this.x + 16,
                this.y + 16,
                '#1e90ff'
            ));
        }
    }

    skillMeteor() {
        const game = window.game;

        // Massive explosion at target
        const targetX = this.x + this.face * 120;
        const targetY = this.y;

        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const speed = 200 + Math.random() * 150;
            game.particles.push(new Particle(
                targetX,
                targetY,
                i % 2 === 0 ? '#ff6600' : '#ffaa00',
                speed * Math.cos(angle),
                speed * Math.sin(angle)
            ));
        }

        // Massive damage in area
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x - targetX,
                    entity.y - targetY
                );
                if (distance < 100) {
                    entity.hit(this.baseDamage * 4, Math.sign(entity.x - targetX));
                }
            }
        });

        game.addShake(1.5, 0, 0, true);
        game.freeze(0.15);
    }

    /**
     * PALADIN SKILLS (Basic implementations)
     */

    skillHolySmite() {
        const game = window.game;

        // Holy light burst
        for (let i = 0; i < 15; i++) {
            game.particles.push(new Particle(
                this.x + 16 + this.face * 50,
                this.y + 16,
                '#ffb703'
            ));
        }

        // Damage in front
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const dx = entity.x - this.x;
                const distance = Math.hypot(dx, entity.y - this.y);

                if (distance < 70 && Math.sign(dx) === this.face) {
                    entity.hit(this.baseDamage * 1.8, this.face);
                }
            }
        });
    }

    skillDivineProtection() {
        const game = window.game;

        // Golden shield particles
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 40;
            game.particles.push(new Particle(
                this.x + 16 + Math.cos(angle) * radius,
                this.y + 16 + Math.sin(angle) * radius,
                '#ffb703'
            ));
        }

        game.particles.push(new FloatingText(
            this.x,
            this.y - 100,
            "PROTECTED!",
            '#ffb703'
        ));
    }

    skillHeal() {
        const game = window.game;

        // Restore HP
        const healAmount = this.stats.maxHp * 0.5;
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + healAmount);

        // Green healing particles
        for (let i = 0; i < 25; i++) {
            game.particles.push(new Particle(
                this.x + 16 + (Math.random() - 0.5) * 30,
                this.y + 16 + (Math.random() - 0.5) * 30,
                '#57cc99'
            ));
        }

        game.particles.push(new FloatingText(
            this.x,
            this.y - 100,
            `+${Math.floor(healAmount)} HP`,
            '#57cc99'
        ));

        this.updateUI();
    }

    skillConsecration() {
        const game = window.game;

        // Holy ground effect
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const radius = 60;
            game.particles.push(new Particle(
                this.x + 16 + Math.cos(angle) * radius,
                this.y + 16 + Math.sin(angle) * radius,
                '#ffb703'
            ));
        }

        // Damage enemies standing in it
        game.entities.forEach(entity => {
            if (entity instanceof Enemy) {
                const distance = Math.hypot(
                    entity.x - this.x,
                    entity.y - this.y
                );
                if (distance < 90) {
                    entity.hit(this.baseDamage * 1.5, Math.sign(entity.x - this.x));
                }
            }
        });
    }

    /**
     * Update skill cooldowns each frame
     * @param {number} dt - Delta time
     */
    updateSkillCooldowns(dt) {
        Object.keys(this.skillCooldowns).forEach(skillId => {
            if (this.skillCooldowns[skillId] > 0) {
                this.skillCooldowns[skillId] -= dt;
                if (this.skillCooldowns[skillId] < 0) {
                    this.skillCooldowns[skillId] = 0;
                }
            }
        });

        // Update UI to show cooldowns
        this.updateSkillUI();
    }

    /**
     * Update skill bar UI with skill names and cooldowns
     */
    updateSkillUI() {
        this.class.skills.forEach((skill, index) => {
            const slotNum = index + 1;

            // Update skill name
            const nameEl = document.getElementById(`skill-${slotNum}-name`);
            if (nameEl) {
                nameEl.textContent = skill.name;
            }

            // Update skill icon (could be emoji or text)
            const iconEl = document.getElementById(`skill-${slotNum}-icon`);
            if (iconEl) {
                // You could set skill-specific icons here
                iconEl.textContent = slotNum;
            }

            // Update cooldown overlay
            const cooldownEl = document.getElementById(`skill-${slotNum}-cooldown`);
            if (cooldownEl) {
                const cooldownPercent = (this.skillCooldowns[skill.id] / skill.cooldown) * 100;
                cooldownEl.style.height = cooldownPercent + '%';
            }
        });
    }
}
