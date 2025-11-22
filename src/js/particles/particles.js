/**
 * Particle Effects
 * Visual effects for combat, movement, and UI feedback
 */

/**
 * Generic particle
 */
export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 1;

        // Random velocity
        this.vx = (Math.random() - 0.5) * 300;
        this.vy = (Math.random() - 0.5) * 300;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt * 2;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1;
    }
}

/**
 * Floating damage/text
 */
export class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 0.8;
    }

    update(dt) {
        this.y -= dt * 40;
        this.life -= dt;
    }

    draw(ctx) {
        ctx.globalAlpha = Math.min(1, this.life * 2);
        ctx.fillStyle = this.color;
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    }
}

/**
 * Slash attack effect
 */
export class SlashEffect {
    constructor(x, y, direction, combo) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.combo = combo;
        this.life = 0.15;

        // Combo 3 gets special color
        this.color = combo === 3 ? '#ff006e' : '#fff';
    }

    update(dt) {
        this.life -= dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);

        ctx.globalAlpha = this.life / 0.15;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 40, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}
