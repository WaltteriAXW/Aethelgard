/**
 * AtmosphericEffects - AAA-Quality Environmental Effects
 * Dust, fog, ambient particles, weather effects
 */

export class AmbientParticle {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.life = config.life || Infinity; // Most ambient particles live forever
    this.maxLife = this.life;
    this.color = config.color || 0xffffff;
    this.size = config.size || 2;
    this.alpha = config.alpha || 0.3;
    this.baseAlpha = this.alpha;
    this.flickerSpeed = config.flickerSpeed || 1;
    this.flickerAmount = config.flickerAmount || 0.2;
    this.time = Math.random() * Math.PI * 2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.5;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.time += dt * this.flickerSpeed;
    this.rotation += this.rotationSpeed * dt;

    // Flicker effect
    const flicker = Math.sin(this.time) * this.flickerAmount;
    this.alpha = this.baseAlpha + flicker;

    if (this.life !== Infinity) {
      this.life -= dt;
    }
  }

  isAlive() {
    return this.life > 0 || this.life === Infinity;
  }
}

export class AtmosphericEffects {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.dustDensity = 20; // Number of dust particles
    this.fogIntensity = 0.1; // Fog opacity
    this.enabled = true;

    this.initializeAmbientParticles();
  }

  /**
   * Initialize floating dust particles
   */
  initializeAmbientParticles() {
    // Floating dust particles
    for (let i = 0; i < this.dustDensity; i++) {
      this.particles.push(new AmbientParticle(
        Math.random() * this.width,
        Math.random() * this.height,
        {
          vx: (Math.random() - 0.5) * 10,
          vy: -5 - Math.random() * 10, // Slow upward drift
          color: 0xaaaaaa,
          size: 1 + Math.random() * 2,
          alpha: 0.1 + Math.random() * 0.2,
          flickerSpeed: 0.5 + Math.random() * 1,
          flickerAmount: 0.1,
        }
      ));
    }
  }

  /**
   * Update all atmospheric effects
   */
  update(dt, cameraX, cameraY) {
    if (!this.enabled) return;

    for (const particle of this.particles) {
      particle.update(dt);

      // Wrap particles around screen (infinite effect)
      const screenX = particle.x - cameraX;
      const screenY = particle.y - cameraY;

      // Respawn particles that go off screen
      if (screenX < -50) particle.x = cameraX + this.width + 50;
      if (screenX > this.width + 50) particle.x = cameraX - 50;
      if (screenY < -50) particle.y = cameraY + this.height + 50;
      if (screenY > this.height + 50) particle.y = cameraY - 50;
    }
  }

  /**
   * Add a burst of dust particles at a location
   */
  addDustBurst(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;

      this.particles.push(new AmbientParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: 0xcccccc,
        size: 2 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.3,
        life: 1 + Math.random() * 2,
        flickerSpeed: 2,
        flickerAmount: 0.2,
      }));
    }
  }

  /**
   * Add magical sparkles effect
   */
  addMagicSparkles(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 10 + Math.random() * 30;

      this.particles.push(new AmbientParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30, // Float upward
        color: Math.random() < 0.5 ? 0xffffaa : 0xaaffff,
        size: 2 + Math.random() * 3,
        alpha: 0.5 + Math.random() * 0.5,
        life: 0.5 + Math.random() * 1,
        flickerSpeed: 5,
        flickerAmount: 0.3,
      }));
    }
  }

  /**
   * Get all active particles
   */
  getParticles() {
    // Remove dead particles
    this.particles = this.particles.filter(p => p.isAlive());
    return this.particles;
  }

  /**
   * Set fog intensity
   */
  setFogIntensity(intensity) {
    this.fogIntensity = Math.max(0, Math.min(1, intensity));
  }

  /**
   * Get fog intensity
   */
  getFogIntensity() {
    return this.fogIntensity;
  }

  /**
   * Toggle atmospheric effects
   */
  toggle() {
    this.enabled = !this.enabled;
  }

  /**
   * Clean up all effects
   */
  clear() {
    this.particles = [];
  }
}
