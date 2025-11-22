/**
 * Three.js 3D Renderer
 * Modern Diablo-style isometric rendering with dynamic lighting
 */

import { CFG } from './config.js';

export class Renderer3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = {
            ambient: null,
            player: null,
            loot: []
        };

        // Mesh caches
        this.meshCache = new Map();
        this.wallMeshes = [];
        this.floorMeshes = [];
        this.particleMeshes = [];

        // Materials (will be initialized in init())
        this.materials = {};

        // Post-processing
        this.fog = null;

        // Camera target for smooth following
        this.cameraTarget = { x: 0, y: 0 };

        // Particle geometry (reuse for all particles)
        this.particleGeometry = null;
    }

    /**
     * Initialize the 3D rendering system
     */
    init() {
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('[Renderer3D] THREE.js is not loaded! Cannot initialize 3D renderer.');
            return false;
        }

        console.log('[Renderer3D] Starting initialization...');

        // Create scene with natural sky background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue (realistic outdoor color)

        // Setup isometric orthographic camera (Diablo-style)
        const aspect = CFG.W / CFG.H;
        const viewSize = 20; // Zoom level - smaller = more zoomed in

        this.camera = new THREE.OrthographicCamera(
            -viewSize * aspect, // left
            viewSize * aspect,  // right
            viewSize,           // top
            -viewSize,          // bottom
            0.1,                // near
            1000                // far
        );

        // Position camera for isometric view (Diablo angle: 45° from above)
        this.camera.position.set(25, 25, 25);
        this.camera.lookAt(0, 0, 0);

        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: CFG.ENABLE_ANTIALIASING,
            alpha: false
        });

        // Set canvas size explicitly
        this.canvas.width = CFG.W;
        this.canvas.height = CFG.H;
        this.renderer.setSize(CFG.W, CFG.H, false); // false = don't update style
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance

        // Enable shadows for realistic depth (Skyrim-style)
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // NO FOG - completely clear visibility
        this.scene.fog = null;

        // Initialize materials
        this.initMaterials();

        // Setup lighting
        this.setupLighting();

        // Initialize particle geometry
        this.particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);

        console.log('[Renderer3D] ✅ Initialized successfully');
        console.log(`[Renderer3D] - Scene background: ${this.scene.background.getHexString()}`);
        console.log(`[Renderer3D] - Canvas size: ${this.canvas.width}x${this.canvas.height}`);
        console.log(`[Renderer3D] - Camera position: (${this.camera.position.x}, ${this.camera.position.y}, ${this.camera.position.z})`);
        console.log(`[Renderer3D] - Shadows enabled: ${this.renderer.shadowMap.enabled}`);

        return true;
    }

    /**
     * Generate procedural stone texture (realistic grey stone with cracks)
     */
    generateStoneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base stone color (light grey)
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, 256, 256);

        // Add noise for stone texture
        const imageData = ctx.getImageData(0, 0, 256, 256);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 60;
            imageData.data[i] += noise;     // R
            imageData.data[i + 1] += noise; // G
            imageData.data[i + 2] += noise; // B
        }
        ctx.putImageData(imageData, 0, 0);

        // Add darker cracks and variations
        for (let i = 0; i < 15; i++) {
            ctx.strokeStyle = `rgba(50, 50, 50, ${0.3 + Math.random() * 0.3})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 100);
            ctx.stroke();
        }

        // Add stone blocks (Skyrim-style)
        ctx.strokeStyle = 'rgba(60, 60, 60, 0.4)';
        ctx.lineWidth = 2;
        for (let y = 0; y < 256; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y);
            ctx.stroke();
        }
        for (let x = 0; x < 256; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 256);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Generate procedural grass texture (green grass with dirt)
     */
    generateGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base grass color (earthy green)
        ctx.fillStyle = '#4a6a3a';
        ctx.fillRect(0, 0, 256, 256);

        // Add grass noise
        const imageData = ctx.getImageData(0, 0, 256, 256);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 40;
            imageData.data[i] += noise - 10;     // R (slightly darker)
            imageData.data[i + 1] += noise;      // G
            imageData.data[i + 2] += noise - 20; // B (less blue)
        }
        ctx.putImageData(imageData, 0, 0);

        // Add dirt patches
        for (let i = 0; i < 25; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = 5 + Math.random() * 15;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(90, 70, 50, 0.6)');
            gradient.addColorStop(1, 'rgba(90, 70, 50, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }

        // Add grass blades (darker strokes)
        for (let i = 0; i < 100; i++) {
            ctx.strokeStyle = `rgba(30, 50, 20, ${0.2 + Math.random() * 0.3})`;
            ctx.lineWidth = 0.5 + Math.random();
            ctx.beginPath();
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 8);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Generate normal map for stone (adds depth)
     */
    generateStoneNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base normal (pointing up = light blue)
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, 256, 256);

        // Add height variations
        const imageData = ctx.getImageData(0, 0, 256, 256);
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const i = (y * 256 + x) * 4;
                const height = Math.random() * 30;
                imageData.data[i] = 128 + height; // R (X normal)
                imageData.data[i + 1] = 128 + height; // G (Y normal)
                imageData.data[i + 2] = 200 + Math.random() * 55; // B (Z normal - pointing up)
            }
        }
        ctx.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Initialize materials for different surface types
     */
    initMaterials() {
        // Generate textures
        const stoneTexture = this.generateStoneTexture();
        const grassTexture = this.generateGrassTexture();
        const stoneNormalMap = this.generateStoneNormalMap();

        // Floor material - Realistic grass texture (bright, no haze)
        this.materials.floor = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.9,
            metalness: 0.0,
            flatShading: false,
            emissive: 0x3a4a3a, // Self-illumination for clear visibility
            emissiveIntensity: 0.4
        });

        // Wall material - Realistic stone texture with normal map (bright, no haze)
        this.materials.wall = new THREE.MeshStandardMaterial({
            map: stoneTexture,
            normalMap: stoneNormalMap,
            normalScale: new THREE.Vector2(0.5, 0.5),
            roughness: 0.8,
            metalness: 0.0,
            flatShading: false,
            emissive: 0x2a2a2a, // Self-illumination for clear visibility
            emissiveIntensity: 0.4
        });

        // Player material - BRIGHT blue armor with strong glow
        this.materials.player = new THREE.MeshStandardMaterial({
            color: 0x5588dd, // Brighter blue
            roughness: 0.3,
            metalness: 0.7,
            emissive: 0x3366cc,
            emissiveIntensity: 0.5 // Much stronger glow
        });

        // Enemy materials - MUCH BRIGHTER with strong emissive
        this.materials.skeleton = new THREE.MeshStandardMaterial({
            color: 0xffffff, // Pure white bones
            roughness: 0.7,
            metalness: 0.15,
            emissive: 0xff3333,
            emissiveIntensity: 0.6 // Brighter glow
        });

        this.materials.wraith = new THREE.MeshStandardMaterial({
            color: 0xbb88ff, // Brighter purple
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0x8855dd,
            emissiveIntensity: 0.8, // Much brighter glow
            transparent: true,
            opacity: 0.9
        });

        this.materials.golem = new THREE.MeshStandardMaterial({
            color: 0x889999, // Lighter grey
            roughness: 0.9,
            metalness: 0.4,
            emissive: 0xff9933,
            emissiveIntensity: 0.7 // Brighter core
        });

        // Loot material - glowing gold
        this.materials.loot = new THREE.MeshStandardMaterial({
            color: 0xffdd44,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0xffaa00,
            emissiveIntensity: 1.5
        });
    }

    /**
     * Setup bright outdoor lighting (Skyrim-style, no haze)
     */
    setupLighting() {
        // Very bright ambient light (eliminates dark areas)
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 2.0);
        this.scene.add(this.lights.ambient);

        // Main sun (DirectionalLight from above) - VERY BRIGHT
        const sunLight = new THREE.DirectionalLight(0xffffee, 2.5);
        sunLight.position.set(20, 40, 15);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.camera.left = -30;
        sunLight.shadow.camera.right = 30;
        sunLight.shadow.camera.top = 30;
        sunLight.shadow.camera.bottom = -30;
        this.scene.add(sunLight);

        // Player torch/lantern (bright for visibility)
        this.lights.player = new THREE.PointLight(0xffaa55, 15, 80, 2);
        this.lights.player.position.set(0, 5, 0);
        this.lights.player.castShadow = true;
        this.lights.player.shadow.mapSize.width = 1024;
        this.lights.player.shadow.mapSize.height = 1024;
        this.scene.add(this.lights.player);

        // Strong fill light (eliminates shadows)
        const fillLight = new THREE.DirectionalLight(0x6699cc, 1.2);
        fillLight.position.set(-15, 10, -10);
        this.scene.add(fillLight);

        console.log('[Renderer3D] Bright outdoor lighting setup (no fog):');
        console.log(`- Ambient: ${this.lights.ambient.intensity}`);
        console.log(`- Sun: ${sunLight.intensity}`);
        console.log(`- Player torch: ${this.lights.player.intensity} (radius: ${this.lights.player.distance})`);
        console.log(`- Fill light: ${fillLight.intensity}`);
    }

    /**
     * Generate 3D map from tile data
     * @param {MapSystem} mapSystem - Map system instance
     */
    generateMap(mapSystem) {
        // Clear existing meshes
        this.clearMap();

        // Geometries (reuse for performance)
        const wallGeometry = new THREE.BoxGeometry(1, 2.5, 1);
        const floorGeometry = new THREE.PlaneGeometry(1, 1);

        // Generate meshes from map data
        for (let y = 0; y < mapSystem.height; y++) {
            for (let x = 0; x < mapSystem.width; x++) {
                const tile = mapSystem.get(x, y);

                if (tile === mapSystem.TILE_FLOOR) {
                    // Create floor tile
                    const floor = new THREE.Mesh(floorGeometry, this.materials.floor);
                    floor.rotation.x = -Math.PI / 2;
                    floor.position.set(x, 0, y);
                    floor.receiveShadow = true;
                    this.scene.add(floor);
                    this.floorMeshes.push(floor);

                } else if (tile === mapSystem.TILE_WALL) {
                    // Create wall
                    const wall = new THREE.Mesh(wallGeometry, this.materials.wall);
                    wall.position.set(x, 1.25, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.wallMeshes.push(wall);
                }
            }
        }

        console.log(`[Renderer3D] Generated map: ${this.floorMeshes.length} floors, ${this.wallMeshes.length} walls`);
    }

    /**
     * Clear all map meshes from scene
     */
    clearMap() {
        [...this.floorMeshes, ...this.wallMeshes].forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
        });
        this.floorMeshes = [];
        this.wallMeshes = [];
    }

    /**
     * Create or update entity mesh
     * @param {Entity} entity - Game entity
     * @returns {THREE.Mesh} Entity mesh
     */
    getOrCreateEntityMesh(entity) {
        let mesh = this.meshCache.get(entity);

        if (!mesh) {
            // Create mesh based on entity type
            mesh = this.createEntityMesh(entity);
            this.meshCache.set(entity, mesh);
            this.scene.add(mesh);
        }

        // Update mesh position (convert 2D tile coords to 3D world coords)
        const worldX = entity.x / CFG.TILE;
        const worldZ = entity.y / CFG.TILE;

        // Add breathing animation
        const breathe = Math.sin(entity.animTime * 2) * 0.05;
        mesh.position.set(worldX, 1 + breathe, worldZ);

        // Facing direction
        if (entity.face !== undefined) {
            mesh.rotation.y = entity.face > 0 ? Math.PI : 0;
        }

        // Flash effect
        if (entity.flash > 0) {
            const flashIntensity = entity.flash * 2;
            if (mesh.material.emissiveIntensity !== undefined) {
                mesh.material.emissiveIntensity = Math.min(2, flashIntensity);
            }
        }

        return mesh;
    }

    /**
     * Create 3D mesh for entity
     * @param {Entity} entity - Game entity
     * @returns {THREE.Mesh} Created mesh
     */
    createEntityMesh(entity) {
        let geometry, material;

        switch(entity.spriteKey) {
            case 'hero':
                geometry = this.createHeroGeometry();
                material = this.materials.player;
                break;

            case 'skel':
                geometry = new THREE.CapsuleGeometry(0.3, 0.8, 8, 16);
                material = this.materials.skeleton;
                break;

            case 'wraith':
                geometry = new THREE.SphereGeometry(0.4, 16, 16);
                material = this.materials.wraith;
                break;

            case 'golem':
                geometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
                material = this.materials.golem;
                break;

            case 'orb':
                geometry = new THREE.SphereGeometry(0.2, 16, 16);
                material = this.materials.loot;
                break;

            default:
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                material = new THREE.MeshStandardMaterial({ color: 0xff00ff });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    /**
     * Create hero geometry (simple for now, can be enhanced)
     * @returns {THREE.BufferGeometry} Hero geometry
     */
    createHeroGeometry() {
        // Simple capsule for hero body
        const body = new THREE.CapsuleGeometry(0.35, 0.9, 8, 16);
        return body;
    }

    /**
     * Update camera to follow player
     * @param {Object} cameraData - Camera position from game {x, y}
     */
    updateCamera(cameraData) {
        // Convert 2D camera position to 3D world coordinates
        const targetX = cameraData.x / CFG.TILE;
        const targetZ = cameraData.y / CFG.TILE;

        // Smooth camera following (fast on first frame to avoid black screen)
        const lerpSpeed = (this.cameraTarget.x === 0 && this.cameraTarget.y === 0) ? 1.0 : 0.1;
        this.cameraTarget.x += (targetX - this.cameraTarget.x) * lerpSpeed;
        this.cameraTarget.y += (targetZ - this.cameraTarget.y) * lerpSpeed;

        // Update camera position (maintain isometric offset)
        this.camera.position.x = this.cameraTarget.x + 25;
        this.camera.position.z = this.cameraTarget.y + 25;
        this.camera.lookAt(this.cameraTarget.x, 0, this.cameraTarget.y);

        // Update player light position
        if (this.lights.player) {
            this.lights.player.position.x = this.cameraTarget.x;
            this.lights.player.position.z = this.cameraTarget.y;
        }
    }

    /**
     * Remove entity mesh from scene
     * @param {Entity} entity - Entity to remove
     */
    removeEntityMesh(entity) {
        const mesh = this.meshCache.get(entity);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            this.meshCache.delete(entity);
        }
    }

    /**
     * Update particle system
     * @param {Array} particles - Game particles
     */
    updateParticles(particles) {
        // Remove old particle meshes
        this.particleMeshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.particleMeshes = [];

        // Create new particle meshes
        particles.forEach(particle => {
            if (particle.life > 0) {
                // Parse color from particle
                const color = this.parseColor(particle.color);

                const material = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: Math.min(1, particle.life)
                });

                const mesh = new THREE.Mesh(this.particleGeometry, material);

                // Convert 2D position to 3D
                mesh.position.x = particle.x / CFG.TILE;
                mesh.position.y = 1 + (particle.y / CFG.TILE) * 0.1; // Slight elevation
                mesh.position.z = particle.y / CFG.TILE;

                this.scene.add(mesh);
                this.particleMeshes.push(mesh);
            }
        });
    }

    /**
     * Parse color string to THREE.Color
     * @param {string} colorStr - Color string (hex)
     * @returns {number} Parsed color
     */
    parseColor(colorStr) {
        // Simple hex color parser
        if (colorStr.startsWith('#')) {
            return parseInt(colorStr.substring(1), 16);
        }
        return 0xff00ff; // Default magenta
    }

    /**
     * Render the scene
     * @param {Game} game - Game instance
     */
    render(game) {
        if (!this.renderer || !this.scene || !this.camera) {
            console.error('[Renderer3D] Cannot render: renderer not initialized');
            return;
        }

        // Update camera
        this.updateCamera(game.camera);

        // Update all entity meshes
        game.entities.forEach(entity => {
            if (!entity.dead) {
                this.getOrCreateEntityMesh(entity);
            } else {
                this.removeEntityMesh(entity);
            }
        });

        // Update particles
        if (game.particles) {
            this.updateParticles(game.particles);
        }

        // Subtle torch flicker for realism (Skyrim-style)
        if (this.lights.player) {
            const baseIntensity = 15;
            const flickerAmount = Math.sin(Date.now() * 0.003) * 0.5 + Math.random() * 0.3;
            this.lights.player.intensity = baseIntensity + flickerAmount;
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        const aspect = width / height;
        const viewSize = 20;

        this.camera.left = -viewSize * aspect;
        this.camera.right = viewSize * aspect;
        this.camera.top = viewSize;
        this.camera.bottom = -viewSize;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.clearMap();

        // Dispose all cached meshes
        this.meshCache.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
        });
        this.meshCache.clear();

        // Dispose materials
        Object.values(this.materials).forEach(mat => mat.dispose());

        this.renderer.dispose();
    }
}
