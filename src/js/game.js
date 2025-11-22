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
        // Clear background
        this.ctx.fillStyle = '#2b2d42';
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

        // Draw floor reflections
        this.drawFloorReflections(cameraX, cameraY);

        this.entities.forEach(entity => entity.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));

        this.ctx.restore();

        // Draw atmospheric fog layers
        this.drawAtmosphericFog(cameraX, cameraY);

        // Draw subtle atmospheric lighting
        this.drawAtmosphericLighting(cameraX, cameraY);

        // Draw minimap
        this.drawMinimap();

        // Apply post-processing effects
        this.drawPostProcessing();
    }

    /**
     * Draw subtle atmospheric lighting for ambiance
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     */
    drawAtmosphericLighting(cameraX, cameraY) {
        // Clear lighting canvas
        this.lightCtx.clearRect(0, 0, CFG.W, CFG.H);
        this.lightCtx.globalCompositeOperation = 'lighter';

        // Subtle player aura (very soft glow)
        const playerFlicker = 1 + Math.sin(this.lightFlicker) * 0.05;
        const playerGradient = this.lightCtx.createRadialGradient(
            this.player.x - cameraX + 16,
            this.player.y - cameraY + 16,
            0,
            this.player.x - cameraX + 16,
            this.player.y - cameraY + 16,
            80 * playerFlicker
        );
        playerGradient.addColorStop(0, 'rgba(100, 150, 255, 0.15)');
        playerGradient.addColorStop(0.5, 'rgba(70, 120, 200, 0.08)');
        playerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.lightCtx.fillStyle = playerGradient;
        this.lightCtx.fillRect(0, 0, CFG.W, CFG.H);

        // God rays and volumetric lighting from loot
        this.entities.forEach(entity => {
            if (entity.spriteKey === 'orb') {
                const lootFlicker = 1 + Math.sin(this.lightFlicker * 2 + entity.x) * 0.12;
                const lootX = entity.x - cameraX + 16;
                const lootY = entity.y - cameraY + 16;

                // Draw god rays (volumetric light beams)
                this.lightCtx.save();
                this.lightCtx.translate(lootX, lootY);

                // Rotating rays
                const rayCount = 8;
                const rotation = this.lightFlicker * 0.5;

                for (let i = 0; i < rayCount; i++) {
                    const angle = (i / rayCount) * Math.PI * 2 + rotation;
                    const rayLength = 80 + Math.sin(this.lightFlicker * 3 + i) * 20;

                    const rayGradient = this.lightCtx.createLinearGradient(
                        0, 0,
                        Math.cos(angle) * rayLength,
                        Math.sin(angle) * rayLength
                    );
                    rayGradient.addColorStop(0, 'rgba(255, 220, 100, 0.3)');
                    rayGradient.addColorStop(0.5, 'rgba(255, 200, 80, 0.15)');
                    rayGradient.addColorStop(1, 'rgba(255, 180, 60, 0)');

                    this.lightCtx.fillStyle = rayGradient;
                    this.lightCtx.beginPath();
                    this.lightCtx.moveTo(0, 0);
                    this.lightCtx.arc(0, 0, rayLength, angle - 0.15, angle + 0.15);
                    this.lightCtx.closePath();
                    this.lightCtx.fill();
                }

                this.lightCtx.restore();

                // Bright core glow
                const lootGradient = this.lightCtx.createRadialGradient(
                    lootX, lootY, 0,
                    lootX, lootY,
                    80 * lootFlicker
                );
                lootGradient.addColorStop(0, 'rgba(255, 240, 120, 0.4)');
                lootGradient.addColorStop(0.3, 'rgba(255, 220, 100, 0.25)');
                lootGradient.addColorStop(0.6, 'rgba(255, 180, 60, 0.12)');
                lootGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                this.lightCtx.fillStyle = lootGradient;
                this.lightCtx.fillRect(0, 0, CFG.W, CFG.H);
            }
        });

        // Enemy glows (very subtle)
        this.entities.forEach(entity => {
            const enemyFlicker = 1 + Math.sin(this.lightFlicker * 1.5 + entity.y) * 0.08;

            if (entity.spriteKey === 'skel') {
                const skelGradient = this.lightCtx.createRadialGradient(
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    0,
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    40 * enemyFlicker
                );
                skelGradient.addColorStop(0, 'rgba(255, 80, 80, 0.15)');
                skelGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                this.lightCtx.fillStyle = skelGradient;
                this.lightCtx.fillRect(0, 0, CFG.W, CFG.H);
            } else if (entity.spriteKey === 'wraith') {
                const wraithGradient = this.lightCtx.createRadialGradient(
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    0,
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    50 * enemyFlicker
                );
                wraithGradient.addColorStop(0, 'rgba(180, 100, 220, 0.18)');
                wraithGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                this.lightCtx.fillStyle = wraithGradient;
                this.lightCtx.fillRect(0, 0, CFG.W, CFG.H);
            } else if (entity.spriteKey === 'golem') {
                const golemGradient = this.lightCtx.createRadialGradient(
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    0,
                    entity.x - cameraX + 16,
                    entity.y - cameraY + 16,
                    45 * enemyFlicker
                );
                golemGradient.addColorStop(0, 'rgba(255, 150, 60, 0.2)');
                golemGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                this.lightCtx.fillStyle = golemGradient;
                this.lightCtx.fillRect(0, 0, CFG.W, CFG.H);
            }
        });

        // Composite lighting layer with very subtle blur
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.filter = 'blur(8px)';
        this.ctx.globalAlpha = 0.7;
        this.ctx.drawImage(this.lightCanvas, 0, 0);
        this.ctx.restore();
    }

    /**
     * Draw floor reflections for wet stone effect
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     */
    drawFloorReflections(cameraX, cameraY) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        this.ctx.globalCompositeOperation = 'lighter';

        this.entities.forEach(entity => {
            // Only reflect entities, not orbs
            if (entity.spriteKey === 'orb') return;

            const reflectX = entity.x + entity.w / 2;
            const reflectY = entity.y + entity.h + 4; // Below entity

            // Get reflection color based on entity type
            let reflectColor;
            switch(entity.spriteKey) {
                case 'hero': reflectColor = '100, 150, 255'; break;
                case 'skel': reflectColor = '240, 240, 230'; break;
                case 'wraith': reflectColor = '180, 100, 220'; break;
                case 'golem': reflectColor = '150, 150, 170'; break;
                default: reflectColor = '200, 200, 200';
            }

            // Draw reflection as gradient ellipse
            const reflectGradient = this.ctx.createRadialGradient(
                reflectX, reflectY,
                0,
                reflectX, reflectY,
                entity.w * 0.6
            );
            reflectGradient.addColorStop(0, `rgba(${reflectColor}, 0.4)`);
            reflectGradient.addColorStop(0.5, `rgba(${reflectColor}, 0.2)`);
            reflectGradient.addColorStop(1, `rgba(${reflectColor}, 0)`);

            this.ctx.fillStyle = reflectGradient;
            this.ctx.beginPath();
            this.ctx.ellipse(
                reflectX,
                reflectY,
                entity.w * 0.5,
                entity.h * 0.3,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();
        });

        this.ctx.restore();
    }

    /**
     * Draw atmospheric fog and particle layers
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     */
    drawAtmosphericFog(cameraX, cameraY) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.08;

        // Multi-layer parallax fog
        const fogTime = Date.now() * 0.0001;

        // Layer 1: Slow drifting fog (near)
        for (let i = 0; i < 6; i++) {
            const fogX = (cameraX * 0.1 + fogTime * 30 + i * 200) % (CFG.W + 200) - 100;
            const fogY = (cameraY * 0.1 + Math.sin(fogTime + i) * 50 + i * 100) % (CFG.H + 100) - 50;

            const fogGradient = this.ctx.createRadialGradient(
                fogX, fogY, 0,
                fogX, fogY, 150
            );
            fogGradient.addColorStop(0, 'rgba(200, 210, 220, 0.15)');
            fogGradient.addColorStop(0.5, 'rgba(180, 190, 200, 0.08)');
            fogGradient.addColorStop(1, 'rgba(160, 170, 180, 0)');

            this.ctx.fillStyle = fogGradient;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);
        }

        // Layer 2: Faster fog (mid)
        this.ctx.globalAlpha = 0.05;
        for (let i = 0; i < 4; i++) {
            const fogX = (cameraX * 0.15 + fogTime * 50 + i * 250) % (CFG.W + 250) - 125;
            const fogY = (cameraY * 0.15 + Math.cos(fogTime * 1.5 + i) * 60 + i * 120) % (CFG.H + 120) - 60;

            const fogGradient = this.ctx.createRadialGradient(
                fogX, fogY, 0,
                fogX, fogY, 120
            );
            fogGradient.addColorStop(0, 'rgba(210, 220, 230, 0.2)');
            fogGradient.addColorStop(0.5, 'rgba(190, 200, 210, 0.1)');
            fogGradient.addColorStop(1, 'rgba(170, 180, 190, 0)');

            this.ctx.fillStyle = fogGradient;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);
        }

        // Floating dust particles
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < 30; i++) {
            const dustX = (cameraX * 0.2 + fogTime * 15 + i * 40 + Math.sin(fogTime * 2 + i) * 20) % CFG.W;
            const dustY = (cameraY * 0.2 + fogTime * 10 + i * 30 + Math.cos(fogTime * 1.5 + i) * 15) % CFG.H;
            const dustSize = 1 + Math.sin(fogTime * 3 + i) * 0.5;

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Draw lighting layer with bloom/glow effects (OLD - for reference)
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

        // Optional: Very subtle darkness overlay (disabled for testing)
        // Uncomment to add atmospheric darkness
        // this.ctx.globalCompositeOperation = 'source-over';
        // const overlayAlpha = 0.1;
        // this.ctx.fillStyle = `rgba(15, 20, 45, ${overlayAlpha})`;
        // this.ctx.fillRect(0, 0, CFG.W, CFG.H);
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

        // Clear minimap with dark background
        this.minimapCtx.fillStyle = '#1a1c1a';
        this.minimapCtx.fillRect(0, 0, mmSize, mmSize);

        // Draw map tiles with natural green tones
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const tile = this.map.get(x, y);
                const mmX = Math.floor(x * scale);
                const mmY = Math.floor(y * scale);
                const tileSize = Math.max(1, Math.ceil(scale));

                if (tile === this.map.TILE_FLOOR) {
                    this.minimapCtx.fillStyle = '#6b8a5f';  // Moss green floor
                    this.minimapCtx.fillRect(mmX, mmY, tileSize, tileSize);
                } else if (tile === this.map.TILE_WALL) {
                    this.minimapCtx.fillStyle = '#4a5a3d';  // Dark moss wall
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
     * Draw post-processing effects for AAA quality visuals
     */
    drawPostProcessing() {
        // Motion blur based on player velocity
        const playerSpeed = Math.hypot(this.player.vx, this.player.vy);
        if (playerSpeed > 150) {
            const blurIntensity = Math.min((playerSpeed - 150) / 500, 0.3);
            const angle = Math.atan2(this.player.vy, this.player.vx);

            this.ctx.save();
            this.ctx.globalAlpha = blurIntensity;
            this.ctx.globalCompositeOperation = 'source-over';

            // Draw multiple offset frames for motion blur
            for (let i = 1; i <= 3; i++) {
                const offsetX = -Math.cos(angle) * i * 4;
                const offsetY = -Math.sin(angle) * i * 4;
                const alpha = blurIntensity * (1 - i / 4);

                this.ctx.globalAlpha = alpha;
                this.ctx.drawImage(
                    this.canvas,
                    offsetX, offsetY,
                    CFG.W, CFG.H,
                    0, 0,
                    CFG.W, CFG.H
                );
            }

            this.ctx.restore();
        }

        // Film grain for cinematic feel
        this.ctx.save();
        this.ctx.globalAlpha = 0.035;
        const grainData = this.ctx.createImageData(CFG.W, CFG.H);
        for (let i = 0; i < grainData.data.length; i += 4) {
            const grain = Math.random() * 255;
            grainData.data[i] = grain;
            grainData.data[i + 1] = grain;
            grainData.data[i + 2] = grain;
            grainData.data[i + 3] = 255;
        }
        this.ctx.putImageData(grainData, 0, 0);
        this.ctx.restore();

        // Screen flash (on hits) - with color variation
        if (this.screenFlash > 0) {
            const flashColor = this.screenFlash > 0.7 ?
                `rgba(255, 200, 100, ${this.screenFlash * 0.6})` : // Warm flash for big hits
                `rgba(255, 255, 255, ${this.screenFlash * 0.4})`; // White flash for normal hits

            this.ctx.fillStyle = flashColor;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);
        }

        // Enhanced chromatic aberration (on heavy hits)
        if (this.chromaticAberration > 0) {
            const aberrationOffset = this.chromaticAberration * 4;

            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';

            // Radial chromatic aberration from center
            const centerX = CFG.W / 2;
            const centerY = CFG.H / 2;

            // Red channel
            this.ctx.globalAlpha = this.chromaticAberration * 0.4;
            const redGradient = this.ctx.createRadialGradient(
                centerX + aberrationOffset, centerY,
                0,
                centerX + aberrationOffset, centerY,
                CFG.W
            );
            redGradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
            redGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            this.ctx.fillStyle = redGradient;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);

            // Cyan channel
            const cyanGradient = this.ctx.createRadialGradient(
                centerX - aberrationOffset, centerY,
                0,
                centerX - aberrationOffset, centerY,
                CFG.W
            );
            cyanGradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
            cyanGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            this.ctx.fillStyle = cyanGradient;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);

            this.ctx.restore();
        }

        // Radial blur on powerful attacks (if camera shake is high)
        if (this.camera.shake > 0.5) {
            this.ctx.save();
            this.ctx.globalAlpha = this.camera.shake * 0.2;
            this.ctx.filter = `blur(${this.camera.shake * 2}px)`;
            this.ctx.drawImage(this.canvas, 0, 0);
            this.ctx.restore();
        }

        // Damage vignette (when player HP is low)
        if (this.player.hp < this.player.maxHp * 0.3) {
            const healthPercent = this.player.hp / this.player.maxHp;
            const vignetteIntensity = (0.3 - healthPercent) / 0.3;

            const damageVignette = this.ctx.createRadialGradient(
                CFG.W / 2, CFG.H / 2, CFG.H * 0.3,
                CFG.W / 2, CFG.H / 2, CFG.H * 0.8
            );
            damageVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
            damageVignette.addColorStop(0.7, `rgba(80, 0, 0, ${vignetteIntensity * 0.2})`);
            damageVignette.addColorStop(1, `rgba(120, 0, 0, ${vignetteIntensity * 0.5})`);

            this.ctx.fillStyle = damageVignette;
            this.ctx.fillRect(0, 0, CFG.W, CFG.H);
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
