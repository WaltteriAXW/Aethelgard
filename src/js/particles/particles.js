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
        this.initialLife = 1;

        // Random velocity
        this.vx = (Math.random() - 0.5) * 300;
        this.vy = (Math.random() - 0.5) * 300;

        // Random size variation
        this.size = 4 + Math.random() * 4;

        // Random rotation for variety
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 10;

        // Particle shape (0 = circle, 1 = square, 2 = star)
        this.shape = Math.floor(Math.random() * 3);
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt * 2;
        this.rotation += this.rotationSpeed * dt;

        // Apply gravity and friction
        this.vy += 200 * dt;
        this.vx *= 0.98;
    }

    draw(ctx) {
        const alpha = this.life;
        const currentSize = this.size * (0.5 + this.life * 0.5);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;

        if (this.shape === 0) {
            // Circle with radial gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.color);
            gradient.addColorStop(1, this.color + '00');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 1) {
            // Square
            ctx.fillStyle = this.color;
            ctx.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
        } else {
            // Star shape
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5;
                const r = i % 2 === 0 ? currentSize : currentSize / 2;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
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
        this.initialY = y;
        this.text = text;
        this.color = color;
        this.life = 0.8;
        this.scale = 0.5;
        this.offsetX = (Math.random() - 0.5) * 20;
    }

    update(dt) {
        this.y -= dt * 60;
        this.life -= dt;

        // Scale up at start for pop effect
        if (this.scale < 1) {
            this.scale += dt * 4;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.life * 2);

        // Apply scale transform
        ctx.translate(this.x + this.offsetX, this.y);
        ctx.scale(this.scale, this.scale);

        // Draw text outline for visibility
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.strokeText(this.text, 0, 0);

        // Draw text fill
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
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
        this.maxLife = 0.15;

        // Combo 3 gets special color
        this.color = combo === 3 ? '#ff006e' : '#fff';
        this.secondaryColor = combo === 3 ? '#ff6b9d' : '#aaa';
    }

    update(dt) {
        this.life -= dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);

        const alpha = this.life / this.maxLife;
        const expansion = (1 - alpha) * 20;

        // Draw multiple overlapping arcs for depth
        for (let i = 0; i < 3; i++) {
            ctx.globalAlpha = alpha * (1 - i * 0.3);
            ctx.strokeStyle = i === 0 ? this.color : this.secondaryColor;
            ctx.lineWidth = 4 - i;

            ctx.beginPath();
            ctx.arc(0, 0, 40 + expansion + i * 5, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
        }

        // Add speed lines for combo 3
        if (this.combo === 3) {
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;

            for (let i = 0; i < 5; i++) {
                const angle = -Math.PI / 4 + (i * Math.PI) / 8;
                const startDist = 20;
                const endDist = 50 + expansion;

                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * startDist, Math.sin(angle) * startDist);
                ctx.lineTo(Math.cos(angle) * endDist, Math.sin(angle) * endDist);
                ctx.stroke();
            }
        }

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}
