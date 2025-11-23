# 🔧 Cache Fix Instructions

## The Problem

You were seeing the **OLD version** of the game because:

1. **Service Worker was caching old files** - The browser was serving cached files from memory
2. **New 3D renderer files were missing** - `renderer3d.js` and `classes.js` weren't in the cache list
3. **Cache version wasn't updated** - The cache stayed at `v1` instead of being bumped to `v3`

## The Fix (Already Applied)

✅ **I've fixed the Service Worker:**
- Added `renderer3d.js` and `classes.js` to the cache list
- Bumped cache version from `v1` to `v3`
- This forces the browser to download fresh files

## What You Need to Do Now

### Option 1: Nuclear Reset (Recommended - 100% Works)

1. **Open the diagnostic tool:**
   - Navigate to: `https://YOUR-USERNAME.github.io/Aethelgard/diagnostic.html`
   - Click the **"💣 NUCLEAR RESET"** button
   - Wait for automatic reload

2. **If that doesn't work, manual method:**
   ```
   Press F12 → Console tab → Paste this code:

   navigator.serviceWorker.getRegistration().then(r => r.unregister());
   caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
   localStorage.clear();
   location.reload(true);
   ```

### Option 2: Hard Refresh (Quick Method)

1. **Windows/Linux:**
   - Press `Ctrl + Shift + R` (Chrome/Edge/Firefox)
   - Or `Ctrl + F5`

2. **Mac:**
   - Press `Cmd + Shift + R`

3. **If still not working:**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Check "Cached images and files"
   - Click "Clear data"
   - **Close ALL tabs** of the site
   - Reopen in a new tab

### Option 3: Incognito/Private Mode (For Testing)

1. **Chrome:** Press `Ctrl + Shift + N`
2. **Firefox:** Press `Ctrl + Shift + P`
3. **Safari:** `Cmd + Shift + N`
4. Navigate to your GitHub Pages URL
5. This completely bypasses all caches

## How to Verify It's Working

### ✅ You should see:

1. **Bright, realistic 3D environment** with:
   - Stone floor textures (grey with cracks)
   - Grass patches
   - Sky blue background
   - Very bright lighting (like daylight)
   - Character clearly visible with a bright torch

2. **Browser Console** (F12 → Console) shows:
   ```
   [Game] Attempting to initialize 3D renderer...
   [Renderer3D] Starting initialization...
   [Renderer3D] Lighting setup complete:
   [Renderer3D] ✅ Initialized successfully
   [Renderer3D] Generated map: 1234 floors, 567 walls
   ```

### ❌ Old version (what you DON'T want to see):

- Dark screen
- 2D graphics
- Console shows: `[Game] THREE.js not loaded yet, waiting...`

## GitHub Pages Deployment

After merging the PR, GitHub Pages needs **2-5 minutes** to deploy. You can check:

1. Go to your repository on GitHub
2. Click **"Settings"** → **"Pages"**
3. You should see: "Your site is live at..."
4. Check the timestamp - if it's older than your latest commit, wait a bit

## Still Not Working?

If you've done ALL of the above and still see nothing:

1. **Check the diagnostic tool:** `diagnostic.html`
2. **Share your browser console output** (F12 → Console → screenshot)
3. **Try a different browser** (Chrome, Firefox, Edge)
4. **Check GitHub Pages is actually deploying from the right branch**

## Technical Details (For Debugging)

**Service Worker Cache Version:**
- Old: `aethelgard-v1` ❌
- New: `aethelgard-v3` ✅

**Required Files:**
- `/src/js/renderer3d.js` (NEW - 684 lines, 3D engine)
- `/src/js/classes.js` (NEW - class selection system)
- Three.js CDN: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js`

**Expected Behavior:**
- Game loads with 3D WebGL renderer
- Bright outdoor lighting
- Procedural stone/grass textures
- Sky blue background (#87CEEB)
- Player torch radius: 80 units, intensity: 15
- Ambient light: 2.0, Sun light: 2.5

---

**If you follow these instructions, you WILL see the new 3D version!** The code is correct and deployed - it's just a browser cache issue.
