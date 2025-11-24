/**
 * MotionEffects - Motion blur, afterimages, speed lines
 * AAA-Quality movement feedback
 */

export class AfterImage {
  constructor(x, y, sprite, alpha = 0.3) {
    this.x = x;
    this.y = y;
    this.sprite = sprite; // Reference sprite for rendering
    this.life = 0.3; // Fades quickly
    this.maxLife = this.life;
    this.alpha = alpha;
    this.scaleX = sprite.scale.x;
  }

  update(dt) {
    this.life -= dt;
  }

  getAlpha() {
    return this.alpha * (this.life / this.maxLife);
  }

  isAlive() {
    return this.life > 0;
  }
}

export class MotionEffects {
  constructor() {
    this.afterImages = [];
    this.speedLines = [];
    this.afterImageInterval = 0.05; // Create afterimage every 50ms
    this.afterImageTimer = 0;
    this.enabled = true;
    this.lastPlayerX = 0;
    this.lastPlayerY = 0;
  }

  /**
   * Update motion effects
   */
  update(dt, playerX, playerY, playerSpeed, playerSprite) {
    if (!this.enabled) return;

    // Calculate player velocity
    const dx = playerX - this.lastPlayerX;
    const dy = playerY - this.lastPlayerY;
    const velocity = Math.sqrt(dx * dx + dy * dy) / dt;

    this.lastPlayerX = playerX;
    this.lastPlayerY = playerY;

    // Create afterimages when moving fast
    if (velocity > 100) { // Threshold for afterimage
      this.afterImageTimer += dt;

      if (this.afterImageTimer >= this.afterImageInterval) {
        this.afterImageTimer = 0;
        this.addAfterImage(playerX, playerY, playerSprite, velocity);
      }
    }

    // Update existing afterimages
    for (const afterImage of this.afterImages) {
      afterImage.update(dt);
    }

    // Remove dead afterimages
    this.afterImages = this.afterImages.filter(img => img.isAlive());
  }

  /**
   * Add afterimage trail
   */
  addAfterImage(x, y, sprite, velocity) {
    // Alpha based on velocity (faster = more visible)
    const alpha = Math.min(0.5, velocity / 500);

    this.afterImages.push(new AfterImage(x, y, sprite, alpha));
  }

  /**
   * Create speed lines effect (for dashing)
   */
  createSpeedLines(playerX, playerY, direction) {
    const lineCount = 15;

    for (let i = 0; i < lineCount; i++) {
      const angle = direction + (Math.random() - 0.5) * 0.5;
      const distance = 100 + Math.random() * 150;
      const startX = playerX - Math.cos(angle) * distance;
      const startY = playerY - Math.sin(angle) * distance;

      this.speedLines.push({
        startX,
        startY,
        endX: playerX,
        endY: playerY,
        life: 0.2 + Math.random() * 0.1,
        maxLife: 0.3,
        width: 1 + Math.random() * 2,
        alpha: 0.5 + Math.random() * 0.3,
      });
    }
  }

  /**
   * Update speed lines
   */
  updateSpeedLines(dt) {
    for (const line of this.speedLines) {
      line.life -= dt;
    }

    this.speedLines = this.speedLines.filter(line => line.life > 0);
  }

  /**
   * Get afterimages for rendering
   */
  getAfterImages() {
    return this.afterImages;
  }

  /**
   * Get speed lines for rendering
   */
  getSpeedLines() {
    return this.speedLines;
  }

  /**
   * Toggle motion effects
   */
  toggle() {
    this.enabled = !this.enabled;
  }

  /**
   * Clear all effects
   */
  clear() {
    this.afterImages = [];
    this.speedLines = [];
  }
}
