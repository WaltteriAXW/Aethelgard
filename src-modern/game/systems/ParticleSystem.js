/**
 * ParticleSystem - Visual effects and feedback
 * Tier 1 Edition - Simple but impactful particles
 */

export class Particle {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.life = config.life || 1;
    this.maxLife = this.life;
    this.color = config.color || 0xffffff;
    this.size = config.size || 4;
    this.gravity = config.gravity || 0;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.life -= dt;

    if (this.life <= 0) {
      this.alive = false;
    }
  }

  getAlpha() {
    return Math.max(0, this.life / this.maxLife);
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Update all particles
   */
  update(dt) {
    for (const particle of this.particles) {
      particle.update(dt);
    }

    // Remove dead particles
    this.particles = this.particles.filter(p => p.alive);
  }

  /**
   * Create slash effect for attacks
   */
  createSlashEffect(x, y, angle) {
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const spread = 0.8; // Spread angle
      const particleAngle = angle + (Math.random() - 0.5) * spread;
      const speed = 150 + Math.random() * 100;

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(particleAngle) * speed,
        vy: Math.sin(particleAngle) * speed,
        life: 0.3 + Math.random() * 0.2,
        color: 0xffff00, // Yellow slash
        size: 3 + Math.random() * 3,
      }));
    }
  }

  /**
   * Create blood/damage particles
   */
  createDamageEffect(x, y) {
    const particleCount = 10;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        color: 0xff3333, // Red blood
        size: 2 + Math.random() * 2,
        gravity: 300, // Falls down
      }));
    }
  }

  /**
   * Create loot sparkle effect
   */
  createLootEffect(x, y) {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        color: 0xffaa00, // Gold sparkle
        size: 2 + Math.random() * 3,
        gravity: -50, // Floats up
      }));
    }
  }

  /**
   * Create death explosion
   */
  createDeathEffect(x, y) {
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 200;

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.4,
        color: i % 2 === 0 ? 0xff0000 : 0xff6600, // Red/orange mix
        size: 3 + Math.random() * 4,
        gravity: 200,
      }));
    }
  }

  /**
   * Get all active particles
   */
  getParticles() {
    return this.particles;
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }
}
