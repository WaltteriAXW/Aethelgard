/**
 * SkillSystem - Character abilities and special attacks
 * Each character class has unique skills with cooldowns
 */

export class Skill {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.icon = config.icon || '⚡';
    this.cooldown = config.cooldown || 5; // seconds
    this.currentCooldown = 0;
    this.manaCost = config.manaCost || 0;
    this.effect = config.effect; // Function to execute the skill
  }

  /**
   * Check if skill is ready to use
   */
  isReady() {
    return this.currentCooldown <= 0;
  }

  /**
   * Use the skill
   */
  use(context) {
    if (!this.isReady()) return false;

    // Execute skill effect
    if (this.effect) {
      this.effect(context);
    }

    // Start cooldown
    this.currentCooldown = this.cooldown;
    return true;
  }

  /**
   * Update cooldown
   */
  update(dt) {
    if (this.currentCooldown > 0) {
      this.currentCooldown = Math.max(0, this.currentCooldown - dt);
    }
  }

  /**
   * Get cooldown percentage (0 = ready, 100 = just used)
   */
  getCooldownPercent() {
    return (this.currentCooldown / this.cooldown) * 100;
  }
}

export class SkillSystem {
  constructor() {
    this.skills = [];
    this.activeSkills = []; // Skills equipped by current character
  }

  /**
   * Load skills for a character class
   */
  loadSkillsForClass(characterClass) {
    console.log('[SkillSystem] Loading skills for class:', characterClass);

    this.activeSkills = [];

    switch (characterClass) {
      case 'warrior':
        this.activeSkills = [
          new Skill({
            id: 'whirlwind',
            name: 'Whirlwind',
            description: 'Spin attack that damages all nearby enemies',
            icon: '🌪️',
            cooldown: 8,
            effect: (context) => {
              // Damage all enemies in radius
              const enemies = context.enemyManager.getEnemies();
              const radius = 150;
              let hits = 0;

              for (const enemy of enemies) {
                const dx = enemy.x - context.playerX;
                const dy = enemy.y - context.playerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                  enemy.takeDamage(50);
                  hits++;
                  context.particleSystem.createSlashEffect(enemy.x, enemy.y, Math.random() * Math.PI * 2);
                  context.floatingTextManager.addDamageNumber(enemy.x, enemy.y - 20, 50);
                }
              }

              // Visual feedback
              context.cameraEffects.addShake(1.2);
              context.particleSystem.createCircleExplosion(context.playerX, context.playerY, radius, 0xffaa00);
              console.log(`[Skill] Whirlwind hit ${hits} enemies!`);
            }
          }),
          new Skill({
            id: 'shield_bash',
            name: 'Shield Bash',
            description: 'Stun nearby enemies briefly',
            icon: '🛡️',
            cooldown: 12,
            effect: (context) => {
              const enemies = context.enemyManager.getEnemies();
              const radius = 100;
              let stunned = 0;

              for (const enemy of enemies) {
                const dx = enemy.x - context.playerX;
                const dy = enemy.y - context.playerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                  enemy.stun(2); // 2 second stun
                  stunned++;
                  context.particleSystem.createDamageEffect(enemy.x, enemy.y);
                }
              }

              context.cameraEffects.addShake(0.8);
              context.cameraEffects.addFlash(0.3, 0x4da6ff);
              console.log(`[Skill] Shield Bash stunned ${stunned} enemies!`);
            }
          })
        ];
        break;

      case 'rogue':
        this.activeSkills = [
          new Skill({
            id: 'dash',
            name: 'Shadow Dash',
            description: 'Dash forward quickly, avoiding damage',
            icon: '💨',
            cooldown: 5,
            effect: (context) => {
              // Dash in facing direction
              const angle = context.playerFacingRight ? 0 : Math.PI;
              const dashDistance = 200;
              const newX = context.playerX + Math.cos(angle) * dashDistance;
              const newY = context.playerY + Math.sin(angle) * dashDistance;

              // Check if valid position
              const tileX = Math.floor(newX / 48);
              const tileY = Math.floor(newY / 48);
              const canMove = context.map.get(tileX, tileY) === context.map.TILE_FLOOR;

              if (canMove) {
                context.playerX = newX;
                context.playerY = newY;

                // Visual trail
                for (let i = 0; i < 10; i++) {
                  const t = i / 10;
                  const trailX = context.playerX - Math.cos(angle) * dashDistance * t;
                  const trailY = context.playerY - Math.sin(angle) * dashDistance * t;
                  context.particleSystem.createParticle(trailX, trailY, {
                    color: 0x9333ea,
                    life: 0.3,
                    size: 8,
                    vx: 0,
                    vy: 0,
                  });
                }
              }

              console.log('[Skill] Shadow Dash executed!');
            }
          }),
          new Skill({
            id: 'poison',
            name: 'Poison Strike',
            description: 'Next attack poisons enemy over time',
            icon: '🗡️',
            cooldown: 10,
            effect: (context) => {
              // Mark next attack as poisoned (would need combat system support)
              context.cameraEffects.addFlash(0.2, 0x22c55e);
              console.log('[Skill] Poison Strike activated!');
              // TODO: Implement poison DoT in combat system
            }
          })
        ];
        break;

      case 'mage':
        this.activeSkills = [
          new Skill({
            id: 'fireball',
            name: 'Fireball',
            description: 'Launch an explosive fireball',
            icon: '🔥',
            cooldown: 6,
            effect: (context) => {
              // Find closest enemy
              const enemies = context.enemyManager.getEnemies();
              let closest = null;
              let minDist = Infinity;

              for (const enemy of enemies) {
                const dx = enemy.x - context.playerX;
                const dy = enemy.y - context.playerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDist && dist < 400) {
                  closest = enemy;
                  minDist = dist;
                }
              }

              if (closest) {
                // Deal damage
                closest.takeDamage(80);

                // Explosion effect
                context.particleSystem.createExplosion(closest.x, closest.y, 0xff4500);
                context.floatingTextManager.addDamageNumber(closest.x, closest.y - 20, 80);
                context.cameraEffects.addShake(1.0);
                context.cameraEffects.addFlash(0.4, 0xff4500);

                // Splash damage
                for (const enemy of enemies) {
                  if (enemy === closest) continue;
                  const dx = enemy.x - closest.x;
                  const dy = enemy.y - closest.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);

                  if (dist < 80) {
                    enemy.takeDamage(30);
                    context.floatingTextManager.addDamageNumber(enemy.x, enemy.y - 20, 30);
                  }
                }

                console.log('[Skill] Fireball hit enemy!');
              }
            }
          }),
          new Skill({
            id: 'frost_nova',
            name: 'Frost Nova',
            description: 'Freeze all nearby enemies',
            icon: '❄️',
            cooldown: 15,
            effect: (context) => {
              const enemies = context.enemyManager.getEnemies();
              const radius = 180;
              let frozen = 0;

              for (const enemy of enemies) {
                const dx = enemy.x - context.playerX;
                const dy = enemy.y - context.playerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                  enemy.stun(3); // 3 second freeze
                  enemy.takeDamage(20);
                  frozen++;
                  context.particleSystem.createParticle(enemy.x, enemy.y, {
                    color: 0x60a5fa,
                    life: 2,
                    size: 30,
                    vx: 0,
                    vy: 0,
                  });
                }
              }

              context.cameraEffects.addShake(0.8);
              context.cameraEffects.addFlash(0.4, 0x60a5fa);
              console.log(`[Skill] Frost Nova froze ${frozen} enemies!`);
            }
          })
        ];
        break;

      default:
        console.warn('[SkillSystem] Unknown character class:', characterClass);
        this.activeSkills = [];
    }

    console.log('[SkillSystem] Loaded skills:', this.activeSkills.map(s => s.name));
    return this.activeSkills;
  }

  /**
   * Update all skill cooldowns
   */
  update(dt) {
    for (const skill of this.activeSkills) {
      skill.update(dt);
    }
  }

  /**
   * Get active skills
   */
  getActiveSkills() {
    return this.activeSkills;
  }

  /**
   * Use skill by index
   */
  useSkill(index, context) {
    if (index < 0 || index >= this.activeSkills.length) return false;

    const skill = this.activeSkills[index];
    return skill.use(context);
  }

  /**
   * Use skill by ID
   */
  useSkillById(skillId, context) {
    const skill = this.activeSkills.find(s => s.id === skillId);
    if (!skill) return false;

    return skill.use(context);
  }

  /**
   * Clear all skills
   */
  clear() {
    this.activeSkills = [];
  }
}
