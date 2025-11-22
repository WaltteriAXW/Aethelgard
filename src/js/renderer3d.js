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
        // Create scene with dark background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);

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
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(CFG.W, CFG.H);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Enable shadows for dramatic lighting
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Setup fog for atmospheric depth
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);

        // Initialize materials
        this.initMaterials();

        // Setup lighting
        this.setupLighting();

        // Initialize particle geometry
        this.particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);

        console.log('[Renderer3D] Initialized with Three.js r158');
    }

    /**
     * Initialize materials for different surface types
     */
    initMaterials() {
        // Floor material - dark stone with subtle texture
        this.materials.floor = new THREE.MeshStandardMaterial({
            color: 0x2a3a2a,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: false
        });

        // Wall material - darker stone with more depth
        this.materials.wall = new THREE.MeshStandardMaterial({
            color: 0x1a2a1a,
            roughness: 0.95,
            metalness: 0.05,
            flatShading: false
        });

        // Player material - blue armor
        this.materials.player = new THREE.MeshStandardMaterial({
            color: 0x3366aa,
            roughness: 0.4,
            metalness: 0.6,
            emissive: 0x1144aa,
            emissiveIntensity: 0.2
        });

        // Enemy materials
        this.materials.skeleton = new THREE.MeshStandardMaterial({
            color: 0xe0e0d8,
            roughness: 0.8,
            metalness: 0.1,
            emissive: 0xff0000,
            emissiveIntensity: 0.3
        });

        this.materials.wraith = new THREE.MeshStandardMaterial({
            color: 0x9966dd,
            roughness: 0.3,
            metalness: 0.2,
            emissive: 0x6644bb,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.85
        });

        this.materials.golem = new THREE.MeshStandardMaterial({
            color: 0x667788,
            roughness: 1.0,
            metalness: 0.3,
            emissive: 0xff7700,
            emissiveIntensity: 0.4
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
     * Setup dramatic Diablo-style lighting
     */
    setupLighting() {
        // Very dark ambient light (moonlight through cracks)
        this.lights.ambient = new THREE.AmbientLight(0x404060, 0.15);
        this.scene.add(this.lights.ambient);

        // Player's torch (main light source - follows player)
        this.lights.player = new THREE.PointLight(0xffaa55, 3, 25, 2);
        this.lights.player.position.set(0, 5, 0);
        this.lights.player.castShadow = true;

        // Shadow quality settings
        this.lights.player.shadow.mapSize.width = 1024;
        this.lights.player.shadow.mapSize.height = 1024;
        this.lights.player.shadow.camera.near = 0.5;
        this.lights.player.shadow.camera.far = 50;

        this.scene.add(this.lights.player);

        // Subtle rim light from above (for character definition)
        const rimLight = new THREE.DirectionalLight(0x8899aa, 0.3);
        rimLight.position.set(5, 20, 5);
        this.scene.add(rimLight);
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

        // Smooth camera following
        this.cameraTarget.x += (targetX - this.cameraTarget.x) * 0.1;
        this.cameraTarget.y += (targetZ - this.cameraTarget.y) * 0.1;

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

        // Flicker player light for atmosphere
        if (this.lights.player) {
            const flicker = 1 + Math.sin(Date.now() * 0.003) * 0.1;
            this.lights.player.intensity = 3 * flicker;
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
