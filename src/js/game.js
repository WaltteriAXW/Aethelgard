/**
 * Main Game Controller
 * Core game loop and state management
 */

import { CFG } from './config.js';
import { audioSystem } from './audio.js';
import { graphics } from './graphics.js';
import { input } from './input.js';
import { MapSystem } from './map.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Wraith } from './entities/wraith.js';
import { Golem } from './entities/golem.js';
import { QuestSystem } from './quest.js';

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.lightCanvas = null;
        this.lightCtx = null;
        this.minimapCanvas = null;
        this.minimapCtx = null;

        this.map = null;
        this.player = null;
        this.entities = [];
        this.particles = [];
        this.quest = null;

        this.camera = { x: 0, y: 0, shake: 0, shakeX: 0, shakeY: 0, rotation: 0 };
        this.state = 'MENU';
        this.lastTime = 0;
        this.hitStopTimer = 0;
        this.lightFlicker = 0;
        this.screenFlash = 0;
        this.chromaticAberration = 0;
        this.fadeIn = 1; // Start with black screen
    }

    /**
     * Initialize the game
     */
    init() {
        // Initialize systems
        audioSystem.init();
        graphics.generate();
        input.init();

        // Remove start overlay
        const startOverlay = document.getElementById('start-overlay');
        if (startOverlay) {
            startOverlay.remove();
        }

        // Show mobile controls if on touch device
        input.showMobileControls();

        // Setup canvas
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CFG.W;
        this.canvas.height = CFG.H;
        this.ctx.imageSmoothingEnabled = false;

        // Setup lighting canvas
        this.lightCanvas = document.createElement('canvas');
        this.lightCanvas.width = CFG.W;
        this.lightCanvas.height = CFG.H;
        this.lightCtx = this.lightCanvas.getContext('2d');

        // Setup minimap
        this.minimapCanvas = document.getElementById('minimap');
        if (this.minimapCanvas) {
            this.minimapCtx = this.minimapCanvas.getContext('2d');
            this.minimapCtx.imageSmoothingEnabled = false;
        }

        // Generate map
        this.map = new MapSystem(CFG.MAP_WIDTH, CFG.MAP_HEIGHT);
        const startPos = this.map.generate();

        // Create player
        this.player = new Player(startPos.x, startPos.y);
        this.entities = [this.player];

        // Spawn enemies
        this.spawnEnemies(startPos);

        // Initialize quest
        this.quest = new QuestSystem();
        this.quest.init();

        // Start game
        this.state = 'PLAY';
        this.lastTime = 0;

        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Spawn enemies on the map
     * @param {Object} playerStart - Player starting position {x, y}
     */
    spawnEnemies(playerStart) {
        for (let i = 0; i < CFG.ENEMY_COUNT; i++) {
            const pos = this.map.findRandomFloor({
                x: playerStart.x,
                y: playerStart.y,
                distance: CFG.ENEMY_SPAWN_MIN_DISTANCE
            });

            // Spawn different enemy types with weighted distribution
            const roll = Math.random();
            let enemy;

            if (roll < 0.6) {
                // 60% Skeletons (basic)
                enemy = new Enemy(pos.x, pos.y);
            } else if (roll < 0.85) {
                // 25% Wraiths (fast)
                enemy = new Wraith(pos.x, pos.y);
            } else {
                // 15% Golems (tank)
                enemy = new Golem(pos.x, pos.y);
            }

            this.entities.push(enemy);
        }
    }

    /**
     * Main game loop
     * @param {number} time - Current timestamp
     */
    loop(time) {
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // Cap delta time to prevent huge jumps
        if (dt > 0.1) {
            dt = 0.1;
        }

        // Hit stop effect
        if (this.hitStopTimer > 0) {
            this.hitStopTimer -= dt;
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        // Update game state
        if (this.state === 'PLAY') {
            this.update(dt);
        }

        // Render
        this.render();

        // Clear input
        input.flush();

        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Update game state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Sort entities by Y position for proper rendering
        this.entities.sort((a, b) => a.y - b.y);

        // Update entities
        this.entities.forEach(entity => entity.update(dt));

        // Remove dead entities
        this.entities = this.entities.filter(entity => !entity.dead);

        // Update particles
        this.particles.forEach(particle => particle.update(dt));

        // Remove dead particles
        this.particles = this.particles.filter(particle => particle.life > 0);

        // Update camera
        this.updateCamera(dt);
    }

    /**
     * Update camera position
     * @param {number} dt - Delta time in seconds
     */
    updateCamera(dt) {
        // Target position (centered on player)
        const targetX = this.player.x - CFG.W / 2 + 16;
        const targetY = this.player.y - CFG.H / 2 + 16;

        // Smooth camera follow
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;

        // Update camera shake with improved decay
        if (this.camera.shake > 0) {
            // Exponential decay for smoother feel
            this.camera.shake *= Math.pow(0.1, dt);
            if (this.camera.shake < 0.01) this.camera.shake = 0;

            // Decay directional offset
            this.camera.shakeX *= Math.pow(0.05, dt);
            this.camera.shakeY *= Math.pow(0.05, dt);

            // Decay rotation
            this.camera.rotation *= Math.pow(0.1, dt);
        }

        // Update light flicker for atmospheric lighting
        this.lightFlicker += dt * 3;
        if (this.lightFlicker > Math.PI * 2) {
            this.lightFlicker -= Math.PI * 2;
        }

        // Update post-processing effects
        if (this.screenFlash > 0) {
            this.screenFlash -= dt * 3;
            if (this.screenFlash < 0) this.screenFlash = 0;
        }

        if (this.chromaticAberration > 0) {
            this.chromaticAberration -= dt * 2;
            if (this.chromaticAberration < 0) this.chromaticAberration = 0;
        }

        // Fade in effect
        if (this.fadeIn > 0) {
            this.fadeIn -= dt * 0.5;
            if (this.fadeIn < 0) this.fadeIn = 0;
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear background with cool dungeon atmosphere
        this.ctx.fillStyle = '#1a1a28';  // Deep cool blue/purple
        this.ctx.fillRect(0, 0, CFG.W, CFG.H);

        // Apply enhanced camera shake with directional component
        const shakeIntensity = this.camera.shake * 8;
        const randomShakeX = (Math.random() - 0.5) * shakeIntensity;
        const randomShakeY = (Math.random() - 0.5) * shakeIntensity;

        const cameraX = Math.floor(
            this.camera.x + randomShakeX + this.camera.shakeX
        );
        const cameraY = Math.floor(
            this.camera.y + randomShakeY + this.camera.shakeY
        );

        // Draw world with rotation shake
        this.ctx.save();

        // Apply rotation shake if active
        if (this.camera.rotation !== 0) {
            this.ctx.translate(CFG.W / 2, CFG.H / 2);
            this.ctx.rotate(this.camera.rotation * 0.02);
            this.ctx.translate(-CFG.W / 2, -CFG.H / 2);
        }

        this.ctx.translate(-cameraX, -cameraY);

        this.map.draw(this.ctx, { x: cameraX, y: cameraY });
        this.entities.forEach(entity => entity.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));

        this.ctx.restore();

        // Draw lighting overlay
        this.drawLighting(cameraX, cameraY);

        // Draw minimap
        this.drawMinimap();

        // Apply post-processing effects
        this.drawPostProcessing();
    }

    /**
     * Draw lighting layer with bloom/glow effects
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     */
    drawLighting(cameraX, cameraY) {
        // Clear lighting canvas (transparent, not black!)
        this.lightCtx.clearRect(0, 0, CFG.W, CFG.H);

        // Use additive blending for overlapping lights to get brighter
        this.lightCtx.globalCompositeOperation = 'lighter';

        // Player light (cyan/blue glow with flicker)
        const playerFlicker = 1 + Math.sin(this.lightFlicker) * 0.08;
        this.drawBloomLight(
            this.player.x - cameraX + 16,
            this.player.y - cameraY + 16,
            CFG.PLAYER_LIGHT_RADIUS * playerFlicker,
            'rgba(0, 150, 255, 0.6)',      // Bright cyan center
            'rgba(100, 200, 255, 0.2)',    // Soft blue edge
            true  // Add extra intensity
        );

        // Loot lights (hot orange/gold with strong flicker)
        this.entities.forEach(entity => {
            if (entity.spriteKey === 'orb') {
                const lootFlicker = 1 + Math.sin(this.lightFlicker * 2 + entity.x) * 0.15;
                this.drawBloomLight(
                    entity.x - cameraX + 8,
                    entity.y - cameraY + 8,
                    CFG.LOOT_LIGHT_RADIUS * lootFlicker,
                    'rgba(255, 170, 0, 0.8)',    // Hot orange center
                    'rgba(255, 200, 50, 0.3)',   // Golden edge
                    true
                );
            }
        });

        // Enemy lights (different colors per type for variety)
        this.entities.forEach(entity => {
            const enemyFlicker = 1 + Math.sin(this.lightFlicker * 1.5 + entity.y) * 0.1;

            if (entity.spriteKey === 'skel') {
                // Red glow for skeletons
                this.drawBloomLight(
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    50 * enemyFlicker,
                    'rgba(230, 57, 70, 0.5)',    // Red eyes
                    'rgba(255, 100, 100, 0.15)',
                    false
                );
            } else if (entity.spriteKey === 'wraith') {
                // Magenta/pink glow for wraiths
                this.drawBloomLight(
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    60 * enemyFlicker,
                    'rgba(255, 0, 110, 0.6)',     // Neon pink
                    'rgba(177, 133, 219, 0.2)',   // Purple edge
                    false
                );
            } else if (entity.spriteKey === 'golem') {
                // Orange core glow for golems
                this.drawBloomLight(
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    55 * enemyFlicker,
                    'rgba(247, 127, 0, 0.6)',     // Bright orange
                    'rgba(255, 150, 50, 0.2)',
                    false
                );
            }
        });

        // Apply the bloom glow effect as an ADDITIVE layer over the game
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';  // Screen blend for glow

        // First pass: Heavy blur for outer glow
        this.ctx.filter = 'blur(16px)';
        this.ctx.globalAlpha = 0.8;
        this.ctx.drawImage(this.lightCanvas, 0, 0);

        // Second pass: Medium blur for mid glow
        this.ctx.filter = 'blur(8px)';
        this.ctx.globalAlpha = 0.9;
        this.ctx.drawImage(this.lightCanvas, 0, 0);

        // Third pass: Light blur for sharp core
        this.ctx.filter = 'blur(3px)';
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.lightCanvas, 0, 0);

        this.ctx.restore();

        // Apply subtle darkness overlay on top (very light for atmosphere)
        this.ctx.globalCompositeOperation = 'source-over';
        const overlayAlpha = 0.15;  // Very subtle darkness
        this.ctx.fillStyle = `rgba(15, 20, 45, ${overlayAlpha})`;
        this.ctx.fillRect(0, 0, CFG.W, CFG.H);
    }

    /**
     * Draw a bloom light source with vibrant colors
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Light radius
     * @param {string} centerColor - Bright center color
     * @param {string} edgeColor - Soft edge color
     * @param {boolean} addIntensity - Add extra bright core
     */
    drawBloomLight(x, y, radius, centerColor, edgeColor, addIntensity = false) {
        // Main gradient light
        const gradient = this.lightCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, centerColor);
        gradient.addColorStop(0.4, edgeColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        this.lightCtx.fillStyle = gradient;
        this.lightCtx.beginPath();
        this.lightCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.lightCtx.fill();

        // Add super bright core for important lights (player, loot)
        if (addIntensity) {
            const coreGradient = this.lightCtx.createRadialGradient(x, y, 0, x, y, radius * 0.3);
            coreGradient.addColorStop(0, centerColor);
            coreGradient.addColorStop(1, 'rgba(0,0,0,0)');

            this.lightCtx.fillStyle = coreGradient;
            this.lightCtx.beginPath();
            this.lightCtx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
            this.lightCtx.fill();
        }
    }

    /**
     * Draw the minimap
     */
    drawMinimap() {
        if (!this.minimapCtx || !this.map) return;

        const mmSize = 150; // Minimap size in pixels
        const scale = mmSize / Math.max(this.map.width, this.map.height);

        // Clear minimap
        this.minimapCtx.fillStyle = '#1a1c23';
        this.minimapCtx.fillRect(0, 0, mmSize, mmSize);

        // Draw map tiles
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const tile = this.map.get(x, y);
                const mmX = Math.floor(x * scale);
                const mmY = Math.floor(y * scale);
                const tileSize = Math.max(1, Math.ceil(scale));

                if (tile === this.map.TILE_FLOOR) {
                    this.minimapCtx.fillStyle = '#3e3e5a';  // Cool purple floor
                    this.minimapCtx.fillRect(mmX, mmY, tileSize, tileSize);
                } else if (tile === this.map.TILE_WALL) {
                    this.minimapCtx.fillStyle = '#2a2a3e';  // Dark blue wall
                    this.minimapCtx.fillRect(mmX, mmY, tileSize, tileSize);
                }
            }
        }

        // Draw enemies with different markers per type
        this.entities.forEach(entity => {
            if (entity === this.player || entity.spriteKey === 'orb') return;

            const mmX = Math.floor((entity.x / CFG.TILE) * scale);
            const mmY = Math.floor((entity.y / CFG.TILE) * scale);

            // Pulsing effect for enemies
            const pulse = 1 + Math.sin(this.lightFlicker * 2) * 0.3;

            // Different colors/shapes per enemy type
            if (entity.spriteKey === 'golem') {
                this.minimapCtx.fillStyle = '#f77f00';
                this.minimapCtx.fillRect(mmX - 2, mmY - 2, 4, 4);
            } else if (entity.spriteKey === 'wraith') {
                this.minimapCtx.fillStyle = '#b185db';
                this.minimapCtx.beginPath();
                this.minimapCtx.arc(mmX, mmY, 1.5 * pulse, 0, Math.PI * 2);
                this.minimapCtx.fill();
            } else {
                this.minimapCtx.fillStyle = '#e63946';
                this.minimapCtx.fillRect(mmX - 1, mmY - 1, 2, 2);
            }
        });

        // Draw loot orbs
        this.entities.forEach(entity => {
            if (entity.spriteKey === 'orb') {
                const mmX = Math.floor((entity.x / CFG.TILE) * scale);
                const mmY = Math.floor((entity.y / CFG.TILE) * scale);
                this.minimapCtx.fillStyle = '#ffb703';
                this.minimapCtx.beginPath();
                this.minimapCtx.arc(mmX, mmY, 1, 0, Math.PI * 2);
                this.minimapCtx.fill();
            }
        });

        // Draw player
        const playerMmX = Math.floor((this.player.x / CFG.TILE) * scale);
        const playerMmY = Math.floor((this.player.y / CFG.TILE) * scale);

        // Player facing direction indicator
        this.minimapCtx.fillStyle = 'rgba(255, 183, 3, 0.3)';
        this.minimapCtx.beginPath();
        this.minimapCtx.moveTo(playerMmX, playerMmY);
        const facingAngle = this.player.face > 0 ? 0 : Math.PI;
        this.minimapCtx.arc(playerMmX, playerMmY, 15, facingAngle - Math.PI / 6, facingAngle + Math.PI / 6);
        this.minimapCtx.closePath();
        this.minimapCtx.fill();

        // Player marker
        this.minimapCtx.fillStyle = '#ffb703';
        this.minimapCtx.fillRect(playerMmX - 1, playerMmY - 1, 3, 3);

        // Draw border
        this.minimapCtx.strokeStyle = '#8ecae6';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.strokeRect(0.5, 0.5, mmSize - 1, mmSize - 1);
    }

    /**
     * Freeze the game (hit stop effect)
     * @param {number} duration - Freeze duration in seconds
     */
    freeze(duration) {
        this.hitStopTimer = duration;
    }

    /**
     * Add directional screen shake
     * @param {number} intensity - Shake intensity (0-1)
     * @param {number} dirX - Direction X (-1 to 1)
     * @param {number} dirY - Direction Y (-1 to 1)
     * @param {boolean} addRotation - Add rotation component
     */
    addShake(intensity, dirX = 0, dirY = 0, addRotation = false) {
        this.camera.shake = Math.max(this.camera.shake, intensity);

        if (dirX !== 0 || dirY !== 0) {
            this.camera.shakeX += dirX * intensity * 10;
            this.camera.shakeY += dirY * intensity * 10;
        }

        if (addRotation) {
            this.camera.rotation += (Math.random() - 0.5) * intensity * 2;
            this.chromaticAberration = intensity;
        }
    }

    /**
     * Add screen flash effect
     * @param {number} intensity - Flash intensity (0-1)
     */
    addFlash(intensity) {
        this.screenFlash = Math.max(this.screenFlash, intensity);
    }

    /**
     * Draw post-processing effects for "trailer look"
     */
    drawPostProcessing() {
        // Enhanced vignette effect with color tint
        const vignetteGradient = this.ctx.createRadialGradient(
            CFG.W / 2, CFG.H / 2, CFG.H * 0.2,
            CFG.W / 2, CFG.H / 2, CFG.H * 0.9
        );
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
        vignetteGradient.addColorStop(1, 'rgba(10, 5, 20, 0.8)');  // Dark purple tint

        this.ctx.fillStyle = vignetteGradient;
        this.ctx.fillRect(0, 0, CFG.W, CFG.H);

        // Subtle scanline effect (lighter than before)
        this.ctx.globalAlpha = 0.03;
        for (let y = 0; y < CFG.H; y += 3) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, y, CFG.W, 1);
        }
        this.ctx.globalAlpha = 1;

        // Screen flash (on hits) - brighter and more impactful
        if (this.screenFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.screenFlash * 0.5})`;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);
        }

        // Enhanced chromatic aberration (on heavy hits)
        if (this.chromaticAberration > 0) {
            const aberrationOffset = this.chromaticAberration * 3;

            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.globalAlpha = this.chromaticAberration * 0.3;

            // Red channel offset
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(-aberrationOffset, 0, CFG.W, CFG.H);

            // Cyan channel offset
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(aberrationOffset, 0, CFG.W, CFG.H);

            this.ctx.restore();
        }

        // Fade in transition
        if (this.fadeIn > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeIn})`;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);
        }
    }
}

// Create global game instance
window.game = new Game();

// Expose init function globally for start button
window.initGame = () => {
    window.game.init();
};
