/**
 * Particle Effects
 * Visual effects for combat, movement, and UI feedback
 */

/**
 * Enhanced particle with bloom effect
 */
export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 1;
        this.initialLife = 1;

        // Increased velocity for more explosive effect
        this.vx = (Math.random() - 0.5) * 400;
        this.vy = (Math.random() - 0.5) * 400;

        // Larger particles for more impact
        this.size = 5 + Math.random() * 6;

        // Random rotation for variety
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 12;

        // Particle shape (0 = circle, 1 = square, 2 = star, 3 = plus)
        this.shape = Math.floor(Math.random() * 4);

        // Glow intensity for bloom effect
        this.glowIntensity = 0.8 + Math.random() * 0.2;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt * 2.5;  // Slightly faster decay
        this.rotation += this.rotationSpeed * dt;

        // Apply gravity and friction
        this.vy += 250 * dt;
        this.vx *= 0.96;  // More friction for trailing effect
    }

    draw(ctx) {
        const alpha = this.life;
        const currentSize = this.size * (0.6 + this.life * 0.4);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;

        // Draw glow layer first (for bloom effect)
        if (this.glowIntensity > 0.5) {
            ctx.globalCompositeOperation = 'screen';
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 2);
            glowGradient.addColorStop(0, this.color + 'aa');
            glowGradient.addColorStop(0.5, this.color + '44');
            glowGradient.addColorStop(1, this.color + '00');

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        if (this.shape === 0) {
            // Circle with enhanced radial gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.6, this.color);
            gradient.addColorStop(1, this.color + '00');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 1) {
            // Square with outline
            ctx.fillStyle = this.color;
            ctx.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
        } else if (this.shape === 2) {
            // Star shape with glow
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
        } else {
            // Plus/cross shape
            ctx.fillStyle = this.color;
            const thickness = currentSize / 3;
            ctx.fillRect(-currentSize / 2, -thickness / 2, currentSize, thickness);
            ctx.fillRect(-thickness / 2, -currentSize / 2, thickness, currentSize);
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
 * Enhanced slash attack effect with bloom
 */
export class SlashEffect {
    constructor(x, y, direction, combo) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.combo = combo;
        this.life = 0.2;
        this.maxLife = 0.2;

        // Vibrant colors based on combo
        if (combo === 3) {
            this.color = '#ff006e';           // Hot pink
            this.secondaryColor = '#ff6b9d';  // Light pink
            this.glowColor = '#ff00ff';       // Magenta
        } else if (combo === 2) {
            this.color = '#00ffcc';           // Cyan
            this.secondaryColor = '#66ffdd';  // Light cyan
            this.glowColor = '#00ffff';       // Bright cyan
        } else {
            this.color = '#00ffcc';           // Cyan
            this.secondaryColor = '#88ffee';  // Very light cyan
            this.glowColor = '#00ddff';       // Blue cyan
        }
    }

    update(dt) {
        this.life -= dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);

        const alpha = this.life / this.maxLife;
        const expansion = (1 - alpha) * 25;

        // Draw bloom glow layer first
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * 0.6;

        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60 + expansion);
        glowGradient.addColorStop(0, this.glowColor + 'aa');
        glowGradient.addColorStop(0.5, this.glowColor + '44');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 60 + expansion, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';

        // Draw multiple overlapping arcs for depth
        for (let i = 0; i < 4; i++) {
            ctx.globalAlpha = alpha * (1 - i * 0.2);
            ctx.strokeStyle = i === 0 ? this.color : this.secondaryColor;
            ctx.lineWidth = 6 - i;

            ctx.beginPath();
            ctx.arc(0, 0, 45 + expansion + i * 6, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
        }

        // Add energy trails for all combos
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.combo === 3 ? 3 : 2;

        const lineCount = this.combo === 3 ? 7 : 5;
        for (let i = 0; i < lineCount; i++) {
            const angle = -Math.PI / 4 + (i * Math.PI) / (lineCount + 1);
            const startDist = 25;
            const endDist = 55 + expansion + (this.combo * 5);

            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * startDist, Math.sin(angle) * startDist);
            ctx.lineTo(Math.cos(angle) * endDist, Math.sin(angle) * endDist);
            ctx.stroke();
        }

        // Extra impact for combo 3
        if (this.combo === 3) {
            ctx.globalAlpha = alpha * 0.5;
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 8;

            ctx.beginPath();
            ctx.arc(0, 0, 50 + expansion, -Math.PI / 3.5, Math.PI / 3.5);
            ctx.stroke();
        }

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}
