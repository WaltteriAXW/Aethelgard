/**
 * ParticleSystem - Visual effects and feedback
 * ENHANCED - More particle types and effects
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
    this.shrink = config.shrink || false;
    this.glow = config.glow || false;
    this.trail = config.trail || false;
    this.trailHistory = [];
  }

  update(dt) {
    // Store trail position
    if (this.trail) {
      this.trailHistory.push({ x: this.x, y: this.y });
      if (this.trailHistory.length > 5) {
        this.trailHistory.shift();
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;

    // Air resistance
    this.vx *= 0.98;
    this.vy *= 0.98;

    this.life -= dt;

    if (this.life <= 0) {
      this.alive = false;
    }
  }

  getAlpha() {
    return Math.max(0, this.life / this.maxLife);
  }

  getSize() {
    if (this.shrink) {
      return this.size * (this.life / this.maxLife);
    }
    return this.size;
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
   * Create slash effect for attacks - ENHANCED
   */
  createSlashEffect(x, y, angle) {
    const particleCount = 25; // More particles

    for (let i = 0; i < particleCount; i++) {
      const spread = 0.8;
      const particleAngle = angle + (Math.random() - 0.5) * spread;
      const speed = 200 + Math.random() * 150;

      // Mix of yellow and white for slash
      const colors = [0xffff00, 0xffffff, 0xffa500];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(particleAngle) * speed,
        vy: Math.sin(particleAngle) * speed,
        life: 0.4 + Math.random() * 0.2,
        color: color,
        size: 4 + Math.random() * 4,
        glow: true,
        trail: Math.random() < 0.3, // Some particles have trails
        shrink: true,
      }));
    }
  }

  /**
   * Create blood/damage particles - ENHANCED
   */
  createDamageEffect(x, y) {
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 180;

      const colors = [0xff0000, 0xff3333, 0xcc0000];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50, // Initial upward burst
        life: 0.5 + Math.random() * 0.3,
        color: color,
        size: 3 + Math.random() * 3,
        gravity: 400, // Falls down fast
        shrink: true,
      }));
    }
  }

  /**
   * Create loot sparkle effect - ENHANCED
   */
  createLootEffect(x, y) {
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;

      const colors = [0xffd700, 0xffed4e, 0xffffff];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.7 + Math.random() * 0.5,
        color: color,
        size: 2 + Math.random() * 4,
        gravity: -80, // Floats up
        glow: true,
        shrink: true,
      }));
    }
  }

  /**
   * Create death explosion - ENHANCED
   */
  createDeathEffect(x, y) {
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 180 + Math.random() * 250;

      const colors = [0xff0000, 0xff4400, 0xff8800, 0xffaa00];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.7 + Math.random() * 0.5,
        color: color,
        size: 4 + Math.random() * 5,
        gravity: 300,
        glow: true,
        trail: Math.random() < 0.4,
        shrink: true,
      }));
    }
  }

  /**
   * Create explosion effect (for skills)
   */
  createExplosion(x, y, color = 0xff4500) {
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 180;

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.4,
        color: color,
        size: 6 + Math.random() * 6,
        gravity: 200,
        glow: true,
        shrink: true,
      }));
    }
  }

  /**
   * Create circle explosion effect (for AOE skills)
   */
  createCircleExplosion(x, y, radius, color = 0xffaa00) {
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 150 + Math.random() * 100;

      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8,
        color: color,
        size: 5 + Math.random() * 5,
        gravity: 50,
        glow: true,
        shrink: true,
      }));
    }
  }

  /**
   * Create a single particle (for general use)
   */
  createParticle(x, y, config) {
    this.particles.push(new Particle(x, y, config));
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
