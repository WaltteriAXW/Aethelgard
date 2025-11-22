# Aethelgard - 3D Rendering System

## Overview

Aethelgard now features a **Modern Diablo-style 3D rendering engine** built with Three.js WebGL. This provides dramatic atmospheric lighting, real-time shadows, and an isometric perspective that brings the dungeon crawler to life.

## Architecture

### Dual Rendering Modes

The game supports both 2D Canvas and 3D WebGL rendering:

- **2D Mode**: Original Canvas-based rendering (lightweight, compatible)
- **3D Mode**: Three.js WebGL rendering (Modern Diablo aesthetic)

Toggle in `src/js/config.js`:
```javascript
USE_3D_RENDERER: true  // Set to false for 2D mode
```

### Key Components

#### 1. Renderer3D Module (`src/js/renderer3d.js`)

Core 3D rendering system:

```javascript
import { Renderer3D } from './renderer3d.js';

const renderer = new Renderer3D(canvas);
renderer.init();
renderer.generateMap(mapSystem);
renderer.render(gameInstance);
```

**Features:**
- Isometric orthographic camera (Diablo viewing angle)
- Dynamic point lighting with shadows
- Procedural 3D mesh generation from 2D tile data
- Entity mesh caching and management
- Particle system support

#### 2. Isometric Camera System

The camera uses **orthographic projection** (no perspective distortion) positioned at a 45° angle:

```javascript
// Camera setup
const camera = new THREE.OrthographicCamera(
    -viewSize * aspect,  // left
    viewSize * aspect,   // right
    viewSize,            // top
    -viewSize,           // bottom
    0.1,                 // near
    1000                 // far
);

camera.position.set(25, 25, 25);  // Isometric angle
camera.lookAt(0, 0, 0);
```

**Smooth Following:**
- Camera smoothly follows player using lerp interpolation
- Maintains fixed isometric offset for consistent viewing angle

#### 3. Dynamic Lighting System

**Light Sources:**

1. **Ambient Light** (0.15 intensity)
   - Dark blue/grey moonlight (#404060)
   - Very low intensity for oppressive atmosphere

2. **Player Torch** (Point Light)
   - Warm orange/yellow (#ffaa55)
   - Intensity: 3.0 with flickering
   - Radius: 25 units
   - Follows player position
   - Casts shadows

3. **Rim Light** (Directional)
   - Subtle top-down lighting (#8899aa)
   - Intensity: 0.3
   - Defines character silhouettes

**Shadow Configuration:**
```javascript
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

#### 4. Material System

**Surface Materials:**

- **Floor**: Dark stone (`#2a3a2a`)
  - Roughness: 0.9
  - Metalness: 0.1
  - Receives shadows

- **Wall**: Darker stone (`#1a2a1a`)
  - Roughness: 0.95
  - Metalness: 0.05
  - Casts and receives shadows

**Character Materials:**

- **Player**: Blue armor with emissive glow
- **Skeleton**: Bone white with red emissive eyes
- **Wraith**: Ethereal purple with transparency
- **Golem**: Rocky grey with orange emissive core
- **Loot**: Golden with high emissive intensity

All materials use `MeshStandardMaterial` for physically-based rendering.

#### 5. Coordinate System Conversion

The game logic operates in 2D tile coordinates, which are converted to 3D:

```javascript
// 2D to 3D conversion
const worldX = entity.x / CFG.TILE;  // X-axis (horizontal)
const worldY = 1.0;                   // Y-axis (elevation)
const worldZ = entity.y / CFG.TILE;  // Z-axis (depth)
```

**Coordinate Mapping:**
- 2D X → 3D X (left/right)
- 2D Y → 3D Z (forward/back)
- 3D Y = elevation (height above ground)

#### 6. Particle System

Particles are converted from 2D to 3D spheres:

```javascript
// Particle rendering
particles.forEach(particle => {
    const mesh = new THREE.Mesh(
        sphereGeometry,
        new MeshBasicMaterial({
            color: parseColor(particle.color),
            transparent: true,
            opacity: particle.life
        })
    );
    mesh.position.set(
        particle.x / CFG.TILE,
        1.0,
        particle.y / CFG.TILE
    );
});
```

## Configuration Options

### In `config.js`:

```javascript
// 3D RENDERING SETTINGS
USE_3D_RENDERER: true,          // Enable 3D mode
SHADOW_QUALITY: 'medium',       // 'low', 'medium', 'high'
ISOMETRIC_ANGLE: 45,            // Camera angle
CAMERA_ZOOM: 20,                // Zoom level (lower = closer)
ENABLE_BLOOM: false,            // Post-processing bloom
ENABLE_ANTIALIASING: true       // Edge smoothing
```

### Shadow Quality Presets:

**Low**: 512x512 shadow maps
**Medium**: 1024x1024 shadow maps (default)
**High**: 2048x2048 shadow maps (performance impact)

## Performance Considerations

### Optimization Techniques:

1. **Geometry Reuse**
   - Single geometry instance for walls/floors
   - Instanced rendering for repeated meshes

2. **Mesh Caching**
   - Entity meshes cached in Map
   - Only create/destroy on entity spawn/death

3. **Culling**
   - Three.js frustum culling automatically enabled
   - Fog hides distant objects

4. **Material Sharing**
   - All floors share one material instance
   - All walls share one material instance
   - Reduces draw calls

### Typical Performance:

- **Map Generation**: ~50-100ms (50x50 tiles)
- **Render Loop**: 60 FPS on modern hardware
- **Memory**: ~50MB GPU memory for 2500 tiles

## Visual Effects

### Atmospheric Fog

```javascript
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);
```

Creates depth perception and hides map edges naturally.

### Light Flickering

```javascript
const flicker = 1 + Math.sin(Date.now() * 0.003) * 0.1;
light.intensity = baseIntensity * flicker;
```

Simulates torch movement and adds dynamism.

### Breathing Animation

Entity meshes subtly pulse:
```javascript
const breathe = Math.sin(entity.animTime * 2) * 0.05;
mesh.position.y = 1 + breathe;
```

## Comparison: 2D vs 3D

| Feature | 2D Canvas | 3D WebGL |
|---------|-----------|----------|
| Shadows | Simulated with overlays | Real-time dynamic |
| Lighting | Additive blending | Point lights with falloff |
| Depth | Layered drawing | True Z-buffer |
| Performance | ~100 draw calls | ~50 draw calls (instancing) |
| Browser Support | 99%+ | 95%+ (WebGL required) |
| Mobile | Excellent | Good (requires WebGL) |

## Future Enhancements

### Planned Features:

1. **Bloom Post-Processing**
   - Glowing loot and magic effects
   - Requires EffectComposer from Three.js

2. **Normal Mapping**
   - Detailed wall/floor textures
   - Simulates surface detail without geometry

3. **Particle Trails**
   - Motion blur for fast-moving entities
   - Requires custom shader

4. **God Rays**
   - Volumetric lighting from loot orbs
   - Requires post-processing pass

5. **Dynamic Decals**
   - Blood splatters on floor
   - Requires render target swapping

## Troubleshooting

### Black Screen

**Problem**: Screen is completely black
**Solution**: Check browser console for WebGL errors
```javascript
// Test WebGL support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
console.log('WebGL supported:', !!gl);
```

### Low FPS

**Problem**: Game runs slowly in 3D mode
**Solutions**:
1. Lower shadow quality in config
2. Disable antialiasing
3. Reduce map size (CFG.MAP_WIDTH/HEIGHT)
4. Switch to 2D mode

### Entities Not Visible

**Problem**: Can see map but not characters
**Solution**: Check entity materials have correct emissive properties:
```javascript
material.emissive = new THREE.Color(0xff0000);
material.emissiveIntensity = 0.3;
```

### Shadows Missing

**Problem**: No shadows appear
**Solution**:
1. Ensure `renderer.shadowMap.enabled = true`
2. Check meshes have `castShadow`/`receiveShadow` enabled
3. Verify light has `castShadow = true`

## Development Tips

### Adding New Entity Types

1. Create material in `initMaterials()`:
```javascript
this.materials.newEnemy = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.8,
    emissive: 0x880000,
    emissiveIntensity: 0.4
});
```

2. Add case in `createEntityMesh()`:
```javascript
case 'newEnemy':
    geometry = new THREE.SphereGeometry(0.5, 16, 16);
    material = this.materials.newEnemy;
    break;
```

### Debugging Camera

Toggle debug helpers:
```javascript
// In renderer3d.js init()
const cameraHelper = new THREE.CameraHelper(this.camera);
this.scene.add(cameraHelper);

const gridHelper = new THREE.GridHelper(50, 50);
this.scene.add(gridHelper);
```

### Inspecting Scene Graph

Use browser devtools:
```javascript
// In console
console.log(window.game.renderer3d.scene);
console.log(window.game.renderer3d.meshCache);
```

## Credits

- **Three.js**: https://threejs.org
- **Inspiration**: Diablo 3/4 lighting and atmosphere
- **Architecture**: Modular design keeps 2D game logic intact

## License

Same as main Aethelgard project (MIT)
