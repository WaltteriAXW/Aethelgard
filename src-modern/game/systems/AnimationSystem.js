/**
 * AnimationSystem - Handles sprite animations
 * Supports idle, walk, attack animations
 */

export class SpriteAnimator {
  constructor(sprite) {
    this.sprite = sprite;
    this.currentAnimation = 'idle';
    this.animationTime = 0;
    this.animations = {
      idle: {
        duration: 1.0,
        bounce: true, // Gentle bounce effect
      },
      walk: {
        duration: 0.4,
        bounce: true,
      },
      attack: {
        duration: 0.3,
        bounce: false,
      },
    };
  }

  /**
   * Update animation
   */
  update(dt, state = 'idle') {
    if (state !== this.currentAnimation) {
      this.currentAnimation = state;
      this.animationTime = 0;
    }

    const anim = this.animations[this.currentAnimation];
    if (!anim) return;

    this.animationTime += dt;

    // Apply animation effects to sprite
    if (this.currentAnimation === 'idle') {
      // Gentle bobbing
      const bob = Math.sin(this.animationTime * Math.PI * 2) * 2;
      this.sprite.y += bob * dt;
    } else if (this.currentAnimation === 'walk') {
      // Walking bounce
      const bounce = Math.abs(Math.sin(this.animationTime * Math.PI * 5)) * 3;
      this.sprite.y -= bounce * dt;
    } else if (this.currentAnimation === 'attack') {
      // Attack lunge
      const progress = Math.min(this.animationTime / anim.duration, 1);
      const lunge = Math.sin(progress * Math.PI) * 10;
      // Sprite will lunge forward during attack
      return { lunge };
    }
  }

  reset() {
    this.animationTime = 0;
  }
}

/**
 * FloatingText - Damage numbers and text that float up
 */
export class FloatingText {
  constructor(x, y, text, color = 0xffffff, size = 24) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 1.5;
    this.maxLife = this.life;
    this.vx = (Math.random() - 0.5) * 20;
    this.vy = -100; // Float upward
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    if (this.life <= 0) {
      this.alive = false;
    }
  }

  getAlpha() {
    return Math.max(0, this.life / this.maxLife);
  }

  getScale() {
    const progress = 1 - (this.life / this.maxLife);
    return 1 + Math.sin(progress * Math.PI) * 0.3;
  }
}

/**
 * FloatingTextManager - Manages all floating text
 */
export class FloatingTextManager {
  constructor() {
    this.texts = [];
  }

  addDamageNumber(x, y, damage) {
    const color = damage > 30 ? 0xff0000 : damage > 15 ? 0xff9900 : 0xffff00;
    this.texts.push(new FloatingText(x, y, `-${damage}`, color, 28));
  }

  addHealNumber(x, y, amount) {
    this.texts.push(new FloatingText(x, y, `+${amount}`, 0x00ff00, 24));
  }

  addGoldNumber(x, y, amount) {
    this.texts.push(new FloatingText(x, y, `+${amount}g`, 0xffd700, 20));
  }

  addText(x, y, text, color = 0xffffff) {
    this.texts.push(new FloatingText(x, y, text, color, 20));
  }

  update(dt) {
    for (const text of this.texts) {
      text.update(dt);
    }
    this.texts = this.texts.filter(t => t.alive);
  }

  getTexts() {
    return this.texts;
  }

  clear() {
    this.texts = [];
  }
}
