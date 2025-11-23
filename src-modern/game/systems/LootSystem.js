/**
 * LootSystem - Manages loot drops and interactions
 * Tier 1 Edition - Basic loot mechanics
 */

export class LootItem {
  constructor(x, y, type = 'coin') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.collected = false;
    this.bobTimer = Math.random() * Math.PI * 2; // Random start for bob animation
    this.pickupRange = 30;

    // Loot properties based on type
    this.properties = this.getLootProperties(type);
  }

  getLootProperties(type) {
    const props = {
      coin: { color: 0xffaa00, value: 10, size: 8 },
      gem: { color: 0x00ffff, value: 50, size: 12 },
      potion: { color: 0xff00ff, value: 0, heal: 25, size: 10 },
      chest: { color: 0x8b4513, value: 100, size: 24 },
    };

    return props[type] || props.coin;
  }

  /**
   * Update loot (bobbing animation)
   */
  update(dt) {
    this.bobTimer += dt * 3;
  }

  /**
   * Get Y offset for bobbing animation
   */
  getBobOffset() {
    return Math.sin(this.bobTimer) * 5;
  }

  /**
   * Check if player is in pickup range
   */
  canPickup(playerX, playerY) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distSq = dx * dx + dy * dy;
    return distSq < (this.pickupRange * this.pickupRange);
  }

  /**
   * Collect this item
   */
  collect() {
    this.collected = true;
    return {
      type: this.type,
      value: this.properties.value,
      heal: this.properties.heal || 0,
    };
  }
}

export class LootManager {
  constructor() {
    this.items = [];
  }

  /**
   * Update all loot items
   */
  update(dt) {
    for (const item of this.items) {
      item.update(dt);
    }
  }

  /**
   * Spawn loot at a position
   */
  spawnLoot(x, y, type = null) {
    // Random loot type if not specified
    if (!type) {
      const rand = Math.random();
      if (rand < 0.6) type = 'coin';
      else if (rand < 0.85) type = 'gem';
      else type = 'potion';
    }

    const item = new LootItem(x, y, type);
    this.items.push(item);
    console.log('[LootManager] Spawned', type, 'at', { x, y });
    return item;
  }

  /**
   * Check for item pickups
   */
  checkPickups(playerX, playerY) {
    const collected = [];

    for (const item of this.items) {
      if (!item.collected && item.canPickup(playerX, playerY)) {
        const reward = item.collect();
        collected.push(reward);
      }
    }

    // Remove collected items
    this.items = this.items.filter(i => !i.collected);

    return collected;
  }

  /**
   * Get all active items
   */
  getItems() {
    return this.items;
  }

  /**
   * Clear all items
   */
  clear() {
    this.items = [];
  }
}
