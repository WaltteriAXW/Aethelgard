/**
 * CombatSystem - Handles all combat mechanics
 * Tier 1 Edition - Basic but functional combat
 */
export class CombatSystem {
  constructor() {
    this.attackCooldown = 0;
    this.attackDuration = 0.3; // Attack animation lasts 300ms
    this.attackCooldownMax = 0.5; // Can attack every 500ms
    this.attackRange = 80; // Attack range in pixels
    this.attackDamage = 25;
    this.isAttacking = false;
    this.attackAngle = 0; // Direction of attack
  }

  /**
   * Update combat system state
   */
  update(dt) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
      if (this.attackCooldown <= 0) {
        this.isAttacking = false;
      }
    }
  }

  /**
   * Attempt to attack
   * @returns {boolean} Whether attack was initiated
   */
  tryAttack(playerX, playerY, facingRight) {
    if (this.attackCooldown > 0) return false;

    this.isAttacking = true;
    this.attackCooldown = this.attackCooldownMax;

    // Calculate attack angle based on facing direction
    this.attackAngle = facingRight ? 0 : Math.PI;

    return true;
  }

  /**
   * Get attack hitbox
   */
  getAttackHitbox(playerX, playerY) {
    if (!this.isAttacking) return null;

    const angle = this.attackAngle;
    const offsetX = Math.cos(angle) * this.attackRange;
    const offsetY = Math.sin(angle) * this.attackRange;

    return {
      x: playerX + offsetX,
      y: playerY + offsetY,
      radius: 40, // Hitbox radius
      damage: this.attackDamage
    };
  }

  /**
   * Check if an entity is hit by current attack
   */
  checkHit(entityX, entityY, playerX, playerY) {
    const hitbox = this.getAttackHitbox(playerX, playerY);
    if (!hitbox) return false;

    const dx = entityX - hitbox.x;
    const dy = entityY - hitbox.y;
    const distSq = dx * dx + dy * dy;

    return distSq < (hitbox.radius * hitbox.radius);
  }

  /**
   * Get attack animation progress (0 to 1)
   */
  getAttackProgress() {
    if (!this.isAttacking) return 0;
    const elapsed = this.attackCooldownMax - this.attackCooldown;
    return Math.min(elapsed / this.attackDuration, 1);
  }

  /**
   * Reset combat state
   */
  reset() {
    this.attackCooldown = 0;
    this.isAttacking = false;
  }
}
