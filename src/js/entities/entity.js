/**
 * Base Entity Class
 * Foundation for all game entities (player, enemies, loot)
 */

import { CFG } from '../config.js';
import { graphics } from '../graphics.js';

export class Entity {
    /**
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @param {string} spriteKey - Graphics sprite identifier
     */
    constructor(x, y, spriteKey) {
        this.x = x;
        this.y = y;
        this.w = 32;  // Width
        this.h = 32;  // Height
        this.spriteKey = spriteKey;

        this.vx = 0;  // X velocity
        this.vy = 0;  // Y velocity
        this.face = 1;  // Facing direction (-1 = left, 1 = right)
        this.flash = 0;  // Flash effect timer
        this.dead = false;

        // Animation system
        this.animTime = Math.random() * Math.PI * 2; // Random start for variety
        this.breatheScale = 1;
        this.idleOffset = { x: 0, y: 0 };
        this.squashStretch = { x: 1, y: 1 };

        // Motion trail system
        this.trail = [];
        this.maxTrailLength = 8;
    }

    /**
     * Update entity state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Store previous position for trail
        const prevX = this.x;
        const prevY = this.y;

        // Apply velocity
        this.x += this.vx * dt;
        this.handleCollision(true);

        this.y += this.vy * dt;
        this.handleCollision(false);

        // Update flash effect
        if (this.flash > 0) {
            this.flash -= dt;
        }

        // Update animation time
        this.animTime += dt;

        // Breathing animation (gentle scale pulse)
        this.breatheScale = 1 + Math.sin(this.animTime * 2) * 0.03;

        // Idle movement (gentle floating/bobbing)
        this.idleOffset.y = Math.sin(this.animTime * 1.5) * 1.5;
        this.idleOffset.x = Math.cos(this.animTime * 0.8) * 0.5;

        // Squash and stretch based on velocity
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > 50) {
            // Moving fast - stretch in direction of movement
            const angle = Math.atan2(this.vy, this.vx);
            const stretchAmount = Math.min(speed / 500, 0.15);
            this.squashStretch.x = 1 + Math.abs(Math.cos(angle)) * stretchAmount;
            this.squashStretch.y = 1 + Math.abs(Math.sin(angle)) * stretchAmount;
        } else {
            // Return to normal
            this.squashStretch.x += (1 - this.squashStretch.x) * dt * 10;
            this.squashStretch.y += (1 - this.squashStretch.y) * dt * 10;
        }

        // Update motion trail
        const hasMoved = Math.abs(this.x - prevX) > 0.5 || Math.abs(this.y - prevY) > 0.5;
        if (hasMoved && speed > 100) {
            this.trail.unshift({
                x: prevX + this.w / 2,
                y: prevY + this.h / 2,
                alpha: 1,
                time: 0
            });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.pop();
            }
        }

        // Update and fade trail
        this.trail.forEach((point, i) => {
            point.time += dt;
            point.alpha = Math.max(0, 1 - point.time * 3);
        });
        this.trail = this.trail.filter(p => p.alpha > 0);
    }

    /**
     * Handle collision with walls
     * @param {boolean} isX - True if checking X-axis collision
     */
    handleCollision(isX) {
        // Import game instance dynamically to avoid circular dependency
        const game = window.game;
        if (!game || !game.map) return;

        const tileSize = CFG.TILE;
        const left = Math.floor(this.x / tileSize);
        const right = Math.floor((this.x + this.w) / tileSize);
        const top = Math.floor(this.y / tileSize);
        const bottom = Math.floor((this.y + this.h) / tileSize);

        // Check if colliding with walls
        const collidesWithWall =
            game.map.get(left, top) > 1 ||
            game.map.get(right, top) > 1 ||
            game.map.get(left, bottom) > 1 ||
            game.map.get(right, bottom) > 1;

        if (collidesWithWall) {
            if (isX) {
                this.vx *= -0.5;
                this.x -= this.vx * 0.1;
            } else {
                this.vy *= -0.5;
                this.y -= this.vy * 0.1;
            }
        }
    }

    /**
     * Draw the entity with modern gradient-based rendering and animations
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Draw motion trail
        this.drawMotionTrail(ctx);

        // Draw shadow beneath entity
        this.drawModernShadow(ctx);

        ctx.save();
        ctx.translate(
            Math.floor(this.x + this.w / 2 + this.idleOffset.x),
            Math.floor(this.y + this.h / 2 + this.idleOffset.y)
        );

        // Apply breathing and squash/stretch animation
        ctx.scale(
            this.breatheScale * this.squashStretch.x,
            this.breatheScale * this.squashStretch.y
        );

        // Draw modern character based on sprite key
        switch(this.spriteKey) {
            case 'hero':
                this.drawModernHero(ctx);
                break;
            case 'skel':
                this.drawModernSkeleton(ctx);
                break;
            case 'wraith':
                this.drawModernWraith(ctx);
                break;
            case 'golem':
                this.drawModernGolem(ctx);
                break;
            case 'orb':
                this.drawModernLoot(ctx);
                break;
            default:
                // Fallback to sprite-based rendering
                const sprite = graphics.get(this.spriteKey);
                if (sprite) {
                    ctx.scale(this.face * CFG.SCALE, CFG.SCALE);
                    ctx.drawImage(sprite, -8, -8);
                }
        }

        // Flash effect overlay
        if (this.flash > 0) {
            ctx.globalCompositeOperation = 'lighter';
            const flashGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
            flashGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            flashGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = flashGradient;
            ctx.fillRect(-20, -20, 40, 40);
        }

        ctx.restore();
    }

    /**
     * Draw motion trail effect for fast movement
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawMotionTrail(ctx) {
        if (this.trail.length === 0) return;

        ctx.save();

        // Get character color based on type
        let trailColor;
        switch(this.spriteKey) {
            case 'hero': trailColor = '100, 150, 255'; break; // Blue
            case 'skel': trailColor = '255, 100, 100'; break; // Red
            case 'wraith': trailColor = '180, 100, 220'; break; // Purple
            case 'golem': trailColor = '150, 150, 170'; break; // Gray
            case 'orb': trailColor = '255, 200, 50'; break; // Gold
            default: trailColor = '200, 200, 200';
        }

        this.trail.forEach((point, i) => {
            const size = 16 * (1 - i / this.trail.length);
            const alpha = point.alpha * 0.3;

            const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size);
            gradient.addColorStop(0, `rgba(${trailColor}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${trailColor}, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(point.x - size, point.y - size, size * 2, size * 2);
        });

        ctx.restore();
    }

    /**
     * Draw modern hero with gradients and smooth rendering
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawModernHero(ctx) {
        ctx.save();
        ctx.scale(this.face, 1);

        // Body (blue armor with gradient)
        const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 2, 16);
        bodyGradient.addColorStop(0, '#5588cc');
        bodyGradient.addColorStop(0.6, '#3366aa');
        bodyGradient.addColorStop(1, '#224488');
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(0, 2, 11, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cape flowing behind
        const capeGradient = ctx.createLinearGradient(-3, -10, -3, 12);
        capeGradient.addColorStop(0, '#556688');
        capeGradient.addColorStop(1, '#334466');
        ctx.fillStyle = capeGradient;
        ctx.beginPath();
        ctx.ellipse(-8, 4, 6, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Head with skin tone
        const headGradient = ctx.createRadialGradient(-1, -8, 0, 0, -8, 7);
        headGradient.addColorStop(0, '#ffddaa');
        headGradient.addColorStop(1, '#ddbb88');
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(0, -10, 7, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = '#3366aa';
        ctx.beginPath();
        ctx.arc(0, -13, 6, Math.PI, Math.PI * 2);
        ctx.fill();

        // Emblem/chest accent with glow
        const emblemGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
        emblemGradient.addColorStop(0, '#ffdd44');
        emblemGradient.addColorStop(1, '#ff9900');
        ctx.fillStyle = emblemGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight shine
        const shineGradient = ctx.createRadialGradient(-3, -2, 0, -3, -2, 8);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGradient;
        ctx.fillRect(-8, -8, 10, 10);

        ctx.restore();
    }

    /**
     * Draw modern skeleton enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawModernSkeleton(ctx) {
        // Bone-white body with subtle gradient
        const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        bodyGradient.addColorStop(0, '#f5f5f0');
        bodyGradient.addColorStop(1, '#d0d0c8');
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(0, 2, 10, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Skull
        const skullGradient = ctx.createRadialGradient(0, -9, 0, 0, -9, 8);
        skullGradient.addColorStop(0, '#ffffff');
        skullGradient.addColorStop(1, '#e0e0d8');
        ctx.fillStyle = skullGradient;
        ctx.beginPath();
        ctx.ellipse(0, -9, 7, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red eyes
        const eyeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
        eyeGradient.addColorStop(0, '#ff4444');
        eyeGradient.addColorStop(0.5, '#cc0000');
        eyeGradient.addColorStop(1, 'rgba(200, 0, 0, 0)');

        ctx.fillStyle = eyeGradient;
        ctx.beginPath();
        ctx.arc(-3, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Dark shadows for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw modern wraith enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawModernWraith(ctx) {
        // Ethereal purple body with glow
        const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
        bodyGradient.addColorStop(0, '#9966dd');
        bodyGradient.addColorStop(0.5, '#7744bb');
        bodyGradient.addColorStop(1, 'rgba(100, 50, 150, 0.3)');
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(0, 2, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wispy tail effect
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 3; i++) {
            const wispGradient = ctx.createRadialGradient(0, 12 + i * 4, 0, 0, 12 + i * 4, 6);
            wispGradient.addColorStop(0, '#8855cc');
            wispGradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
            ctx.fillStyle = wispGradient;
            ctx.beginPath();
            ctx.arc(0, 12 + i * 4, 6 - i, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Head with ethereal glow
        const headGradient = ctx.createRadialGradient(0, -8, 0, 0, -8, 10);
        headGradient.addColorStop(0, '#bb88ee');
        headGradient.addColorStop(0.6, '#9966dd');
        headGradient.addColorStop(1, 'rgba(150, 100, 200, 0.4)');
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(0, -8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Glowing pink eyes
        const eyeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
        eyeGradient.addColorStop(0, '#ff44dd');
        eyeGradient.addColorStop(0.5, '#dd22aa');
        eyeGradient.addColorStop(1, 'rgba(255, 50, 200, 0)');

        ctx.fillStyle = eyeGradient;
        ctx.beginPath();
        ctx.arc(-3, -9, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, -9, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw modern golem enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawModernGolem(ctx) {
        // Rocky body with texture
        const bodyGradient = ctx.createLinearGradient(-12, -12, 12, 12);
        bodyGradient.addColorStop(0, '#8899aa');
        bodyGradient.addColorStop(0.5, '#667788');
        bodyGradient.addColorStop(1, '#445566');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(-12, -8, 24, 24);

        // Add rock texture highlights
        ctx.fillStyle = 'rgba(150, 160, 180, 0.3)';
        ctx.fillRect(-8, -4, 6, 6);
        ctx.fillRect(4, 2, 5, 7);
        ctx.fillRect(-6, 10, 8, 4);

        // Cracks/details
        ctx.strokeStyle = 'rgba(30, 40, 50, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -2);
        ctx.lineTo(-4, 8);
        ctx.moveTo(6, -4);
        ctx.lineTo(10, 10);
        ctx.stroke();

        // Glowing orange core/eyes
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
        coreGradient.addColorStop(0, '#ffaa44');
        coreGradient.addColorStop(0.5, '#ff7700');
        coreGradient.addColorStop(1, 'rgba(255, 100, 0, 0.3)');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(-4, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -2, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw modern loot orb
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawModernLoot(ctx) {
        // Rotating animation
        const time = Date.now() * 0.003;

        // Outer glow
        const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
        outerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.6)');
        outerGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Main golden orb
        const orbGradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, 12);
        orbGradient.addColorStop(0, '#ffffcc');
        orbGradient.addColorStop(0.3, '#ffdd44');
        orbGradient.addColorStop(0.7, '#ffaa00');
        orbGradient.addColorStop(1, '#dd8800');
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Rotating highlight
        ctx.save();
        ctx.rotate(time);
        const shineGradient = ctx.createLinearGradient(-8, -8, 4, 4);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGradient;
        ctx.beginPath();
        ctx.arc(-2, -2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Sparkle effect
        if (Math.sin(time * 3) > 0.8) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(6, -6, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw modern shadow with gradient
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawModernShadow(ctx) {
        const shadowGradient = ctx.createRadialGradient(
            this.x + this.w / 2, this.y + this.h - 2,
            0,
            this.x + this.w / 2, this.y + this.h - 2,
            this.w * 0.6
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.w / 2,
            this.y + this.h - 2,
            this.w * 0.5,
            this.w * 0.2,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    /**
     * Draw shadow beneath entity for depth
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';

        // Create elliptical shadow
        ctx.beginPath();
        const shadowWidth = this.w * 0.8;
        const shadowHeight = this.w * 0.3;
        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h - 4;

        ctx.ellipse(centerX, centerY, shadowWidth / 2, shadowHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw outline around sprite for visibility
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Image} sprite - Sprite image
     */
    drawOutline(ctx, sprite) {
        ctx.globalCompositeOperation = 'source-over';

        // Create dark outline by drawing sprite offset in 8 directions
        const outlineOffsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
        ];

        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#000';

        for (const [ox, oy] of outlineOffsets) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(sprite, -8 + ox, -8 + oy);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillRect(-12, -12, 24, 24);
            ctx.restore();
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Get entity center position
     * @returns {Object} Center position {x, y}
     */
    getCenter() {
        return {
            x: this.x + 16,
            y: this.y + 16
        };
    }

    /**
     * Calculate distance to another entity
     * @param {Entity} other - Other entity
     * @returns {number} Distance in pixels
     */
    distanceTo(other) {
        const center = this.getCenter();
        const otherCenter = other.getCenter();
        return Math.hypot(center.x - otherCenter.x, center.y - otherCenter.y);
    }
}
