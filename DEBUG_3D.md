# 3D Rendering Debug Guide

## Quick Test: Is 3D Working?

### 1. Open Browser Console
Press `F12` → Click "Console" tab

### 2. Look for These Messages

**✅ SUCCESS (3D is working):**
```
[Game] Attempting to initialize 3D renderer...
[Renderer3D] Starting initialization...
[Renderer3D] Lighting setup complete:
[Renderer3D] ✅ Initialized successfully
[Renderer3D] Generated map: 1234 floors, 567 walls
```

**❌ FAILURE (3D not working):**
```
[Game] THREE.js not loaded yet, waiting...
[Renderer3D] THREE.js is not loaded! Cannot initialize 3D renderer.
[Game] THREE.js failed to load, using 2D fallback
```

---

## Problem: Black Screen

### Cause 1: Three.js Not Loading from CDN

**Symptoms:**
- Console shows: `THREE is not defined`
- Fallback to 2D mode

**Solutions:**
1. Check internet connection
2. Verify CDN is accessible: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js`
3. Download Three.js locally and change HTML to:
   ```html
   <script src="lib/three.min.js"></script>
   ```

### Cause 2: Too Dark (Fog of War + Dim Lighting)

**Current Settings:**
- Ambient light: 0.4 intensity (was 0.15)
- Player torch: 5.0 intensity (was 3.0)
- Background: #1a1a2e (dark blue-grey)

**Quick Fix - Make it Brighter:**

Edit `src/js/renderer3d.js`:

```javascript
// Line 181 - Increase ambient light
this.lights.ambient = new THREE.AmbientLight(0x808080, 0.8); // Much brighter

// Line 185 - Increase torch intensity
this.lights.player = new THREE.PointLight(0xffaa55, 10, 40, 2); // Brighter + larger radius

// Line 53 - Lighter background
this.scene.background = new THREE.Color(0x2a2a3e); // Less dark
```

### Cause 3: Camera Looking at Wrong Place

**Debug: Where is the camera?**

Add to `src/js/renderer3d.js` in `render()` function:
```javascript
// After line 455
console.log(`Camera target: (${this.cameraTarget.x}, ${this.cameraTarget.y})`);
console.log(`Camera position: (${this.camera.position.x}, ${this.camera.position.y}, ${this.camera.position.z})`);
```

**Expected values:**
- Target should be around `(25, 25)` (center of 50x50 map)
- Camera should be at `(50, 25, 50)` (target + 25 offset)

**If camera is at (0, 0, 0):** The camera update is not running properly.

### Cause 4: No Meshes Generated

**Debug: How many meshes?**

Check console for:
```
[Renderer3D] Generated map: XXXX floors, YYYY walls
```

**If it says "0 floors, 0 walls":**
- Map generation failed
- Check `map.js` for errors

---

## Quick Toggle: Force 2D Mode

**Option 1: Config File**

Edit `src/js/config.js`:
```javascript
USE_3D_RENDERER: false  // Temporarily disable 3D
```

**Option 2: Browser Console**

```javascript
// Force 2D mode and reload
localStorage.setItem('force2D', 'true');
location.reload();
```

Then in `game.js` constructor:
```javascript
this.use3D = !localStorage.getItem('force2D') && CFG.USE_3D_RENDERER;
```

---

## Visual Debugging

### Add Helper Grid

In `renderer3d.js` `init()` function, after line 107:

```javascript
// Grid helper (shows X/Z plane)
const gridHelper = new THREE.GridHelper(50, 50, 0x00ff00, 0x444444);
this.scene.add(gridHelper);

// Axis helper (Red=X, Green=Y, Blue=Z)
const axisHelper = new THREE.AxesHelper(10);
this.scene.add(axisHelper);
```

**What you should see:**
- Green grid on the floor
- Red/Green/Blue axes showing orientation

### Add Bright Test Cube

In `renderer3d.js` `init()` function:

```javascript
// Bright test cube at origin
const testGeo = new THREE.BoxGeometry(2, 2, 2);
const testMat = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Bright magenta
const testCube = new THREE.Mesh(testGeo, testMat);
testCube.position.set(0, 1, 0);
this.scene.add(testCube);
```

**If you DON'T see the bright magenta cube:**
- Camera is not positioned correctly
- Renderer is not actually rendering

---

## Performance Check

### FPS Counter

Add to HTML:
```html
<div style="position: fixed; top: 10px; left: 10px; color: lime; font-family: monospace; z-index: 9999;">
    FPS: <span id="fps">60</span>
</div>
```

Add to `game.js` in `loop()`:
```javascript
// Calculate FPS
const currentTime = Date.now();
const fps = Math.round(1000 / (currentTime - this.lastFPSTime));
this.lastFPSTime = currentTime;
document.getElementById('fps').textContent = fps;
```

**Target: 60 FPS**
- Below 30 FPS: Performance issues
- Below 15 FPS: Unplayable

### Shadow Performance

Shadows are expensive! Disable temporarily:

```javascript
// In renderer3d.js setupLighting()
this.lights.player.castShadow = false; // Disable shadows

// In renderer3d.js init()
this.renderer.shadowMap.enabled = false; // Disable shadow system
```

---

## Common Issues

### Issue: Everything is Magenta

**Cause:** Materials are not loading properly

**Fix:** Check material initialization in `initMaterials()`

### Issue: Entities Visible But No Map

**Cause:** Map meshes not being created

**Fix:** Check `generateMap()` is being called with valid MapSystem

### Issue: Map Visible But No Entities

**Cause:** Entity mesh creation failing

**Fix:** Check `createEntityMesh()` for errors

### Issue: Flickering/Glitching

**Cause:** Z-fighting (meshes too close together)

**Fix:**
```javascript
// In renderer3d.js camera setup
this.camera.near = 0.1; // Increase from 0.01
this.camera.far = 500;  // Decrease from 1000
```

---

## Nuclear Option: Complete Reset

1. Clear browser cache
2. Hard refresh: `Ctrl+Shift+R`
3. Check console for ANY red errors
4. If still black, switch to 2D mode
5. Report console errors to developer

---

## Console Commands for Testing

```javascript
// In browser console while game is running

// Check if 3D is active
console.log(window.game.use3D);

// Check renderer state
console.log(window.game.renderer3d);

// Count entities
console.log(window.game.entities.length);

// Check camera position
console.log(window.game.renderer3d.camera.position);

// Force render one frame
window.game.renderer3d.render(window.game);

// Check scene children (should have floors, walls, entities)
console.log(window.game.renderer3d.scene.children.length);
```

---

## Expected Console Output (Normal Startup)

```
[SW] Registered successfully: ...
[Simplex Noise] Initialized
[Game] Attempting to initialize 3D renderer...
[Renderer3D] Starting initialization...
[Renderer3D] Lighting setup complete:
- Ambient: 0.4
- Player torch: 5 (radius: 30)
- Rim light: 0.5
[Renderer3D] ✅ Initialized successfully
[Renderer3D] - Scene background: 1a1a2e
[Renderer3D] - Canvas size: 1024x576
[Renderer3D] - Camera position: (25, 25, 25)
[Renderer3D] - Shadows enabled: true
[Game] 3D renderer initialized successfully
[Renderer3D] Generated map: 1847 floors, 1253 walls
[Audio] Initialized Web Audio API
[Quest] Initialized: Defeat 10 enemies
```

If your console looks like this, 3D mode is working correctly!
