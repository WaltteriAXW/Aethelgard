/**
 * EnemySystem - Manages all enemies
 * Tier 1 Edition - Simple but effective AI
 */

export class Enemy {
  constructor(x, y, type = 'skel') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.hp = 50;
    this.maxHp = 50;
    this.speed = 80;
    this.damage = 10;
    this.alive = true;
    this.stunned = false;
    this.stunnedTimer = 0;

    // AI state
    this.state = 'idle'; // idle, chase, attack
    this.targetX = x;
    this.targetY = y;
    this.aggroRange = 300;
    this.attackRange = 50;
    this.attackCooldown = 0;
    this.attackCooldownMax = 1.5;
  }

  /**
   * Update enemy AI and movement
   */
  update(dt, playerX, playerY, map, TILE_SIZE) {
    if (!this.alive) return;

    // Update timers
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    if (this.stunned) {
      this.stunnedTimer -= dt;
      if (this.stunnedTimer <= 0) {
        this.stunned = false;
      }
      return; // Don't move while stunned
    }

    // Calculate distance to player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Simple AI state machine
    if (dist < this.attackRange) {
      this.state = 'attack';
      if (this.attackCooldown <= 0) {
        this.attackCooldown = this.attackCooldownMax;
        return { type: 'attack', damage: this.damage };
      }
    } else if (dist < this.aggroRange) {
      this.state = 'chase';

      // Move towards player
      const vx = (dx / dist) * this.speed * dt;
      const vy = (dy / dist) * this.speed * dt;

      // Simple collision check
      const newX = this.x + vx;
      const newY = this.y + vy;
      const tileX = Math.floor(newX / TILE_SIZE);
      const tileY = Math.floor(newY / TILE_SIZE);

      if (map.get(tileX, tileY) === map.TILE_FLOOR) {
        this.x = newX;
        this.y = newY;
      }
    } else {
      this.state = 'idle';
    }

    return null;
  }

  /**
   * Take damage
   */
  takeDamage(amount) {
    if (!this.alive) return false;

    this.hp -= amount;
    this.stunned = true;
    this.stunnedTimer = 0.2; // Brief stun on hit

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      return true; // Enemy died
    }

    return false;
  }

  /**
   * Get health percentage
   */
  getHealthPercent() {
    return this.hp / this.maxHp;
  }
}

export class EnemyManager {
  constructor(map, TILE_SIZE) {
    this.enemies = [];
    this.map = map;
    this.TILE_SIZE = TILE_SIZE;
    this.spawnTimer = 0;
    this.spawnInterval = 5; // Spawn enemy every 5 seconds
    this.maxEnemies = 10;
  }

  /**
   * Update all enemies
   */
  update(dt, playerX, playerY) {
    // Update spawn timer
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
      this.spawnEnemy(playerX, playerY);
      this.spawnTimer = 0;
    }

    // Update each enemy
    const results = [];
    for (const enemy of this.enemies) {
      const result = enemy.update(dt, playerX, playerY, this.map, this.TILE_SIZE);
      if (result) {
        results.push({ enemy, ...result });
      }
    }

    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.alive);

    return results;
  }

  /**
   * Spawn a new enemy near the player (but not too close)
   */
  spawnEnemy(playerX, playerY) {
    const attempts = 20;

    for (let i = 0; i < attempts; i++) {
      // Spawn 200-500 pixels away from player
      const angle = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 300;
      const x = playerX + Math.cos(angle) * dist;
      const y = playerY + Math.sin(angle) * dist;

      const tileX = Math.floor(x / this.TILE_SIZE);
      const tileY = Math.floor(y / this.TILE_SIZE);

      // Check if spawn location is valid
      if (this.map.get(tileX, tileY) === this.map.TILE_FLOOR) {
        const enemy = new Enemy(x, y, 'skel');
        this.enemies.push(enemy);
        console.log('[EnemyManager] Spawned enemy at', { x, y });
        break;
      }
    }
  }

  /**
   * Check combat hits against all enemies
   */
  checkCombatHits(hitbox) {
    const hits = [];

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      const dx = enemy.x - hitbox.x;
      const dy = enemy.y - hitbox.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < (hitbox.radius * hitbox.radius)) {
        const died = enemy.takeDamage(hitbox.damage);
        hits.push({ enemy, died });
      }
    }

    return hits;
  }

  /**
   * Get all enemies
   */
  getEnemies() {
    return this.enemies;
  }

  /**
   * Clear all enemies
   */
  clear() {
    this.enemies = [];
  }
}
