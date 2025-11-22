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

        this.camera = { x: 0, y: 0, shake: 0 };
        this.state = 'MENU';
        this.lastTime = 0;
        this.hitStopTimer = 0;
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

        // Update camera shake
        if (this.camera.shake > 0) {
            this.camera.shake = Math.max(0, this.camera.shake - dt * 10);
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear background
        this.ctx.fillStyle = '#2b2d42';
        this.ctx.fillRect(0, 0, CFG.W, CFG.H);

        // Apply camera shake
        const cameraX = Math.floor(
            this.camera.x + (Math.random() - 0.5) * this.camera.shake * 5
        );
        const cameraY = Math.floor(
            this.camera.y + (Math.random() - 0.5) * this.camera.shake * 5
        );

        // Draw world
        this.ctx.save();
        this.ctx.translate(-cameraX, -cameraY);

        this.map.draw(this.ctx, { x: cameraX, y: cameraY });
        this.entities.forEach(entity => entity.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));

        this.ctx.restore();

        // Draw lighting overlay
        this.drawLighting(cameraX, cameraY);

        // Draw minimap
        this.drawMinimap();
    }

    /**
     * Draw lighting layer
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     */
    drawLighting(cameraX, cameraY) {
        // Clear lighting canvas
        this.lightCtx.clearRect(0, 0, CFG.W, CFG.H);

        // Draw dusk overlay
        this.lightCtx.globalCompositeOperation = 'source-over';
        this.lightCtx.fillStyle = `rgba(20, 25, 60, ${CFG.LIGHT_OPACITY})`;
        this.lightCtx.fillRect(0, 0, CFG.W, CFG.H);

        // Cut out light areas
        this.lightCtx.globalCompositeOperation = 'destination-out';

        // Player light
        this.drawLight(
            this.player.x - cameraX + 16,
            this.player.y - cameraY + 16,
            CFG.PLAYER_LIGHT_RADIUS
        );

        // Loot lights
        this.entities.forEach(entity => {
            if (entity.spriteKey === 'orb') {
                this.drawLight(
                    entity.x - cameraX + 8,
                    entity.y - cameraY + 8,
                    CFG.LOOT_LIGHT_RADIUS
                );
            }
        });

        // Apply lighting to main canvas
        this.ctx.drawImage(this.lightCanvas, 0, 0);
    }

    /**
     * Draw a light source
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Light radius
     */
    drawLight(x, y, radius) {
        const gradient = this.lightCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        this.lightCtx.fillStyle = gradient;
        this.lightCtx.beginPath();
        this.lightCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.lightCtx.fill();
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
                    this.minimapCtx.fillStyle = '#6c8c4a';
                    this.minimapCtx.fillRect(mmX, mmY, tileSize, tileSize);
                } else if (tile === this.map.TILE_WALL) {
                    this.minimapCtx.fillStyle = '#3a4a20';
                    this.minimapCtx.fillRect(mmX, mmY, tileSize, tileSize);
                }
            }
        }

        // Draw enemies
        this.entities.forEach(entity => {
            if (entity === this.player) return;

            const mmX = Math.floor((entity.x / CFG.TILE) * scale);
            const mmY = Math.floor((entity.y / CFG.TILE) * scale);

            this.minimapCtx.fillStyle = '#e63946';
            this.minimapCtx.fillRect(mmX - 1, mmY - 1, 2, 2);
        });

        // Draw player
        const playerMmX = Math.floor((this.player.x / CFG.TILE) * scale);
        const playerMmY = Math.floor((this.player.y / CFG.TILE) * scale);

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
}

// Create global game instance
window.game = new Game();

// Expose init function globally for start button
window.initGame = () => {
    window.game.init();
};
