import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { generateAllTextures } from './utils/textureGenerator';
import { MapSystem } from './systems/MapSystem';
import { useGameStore } from './stores/useGameStore';
import { useControls } from './hooks/useControls';

/**
 * GameCanvas V2 - Direct Pixi.js Integration
 * More reliable than @pixi/react for complex games
 */
export const GameCanvas = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const playerSpriteRef = useRef(null);
  const mapGraphicsRef = useRef(null);
  const lightingGraphicsRef = useRef(null);
  const gameDataRef = useRef({
    map: null,
    textures: null,
    playerX: 400,
    playerY: 300,
    cameraX: 0,
    cameraY: 0,
  });
  const [initStatus, setInitStatus] = useState('Initializing...');

  const controls = useControls();
  const updatePlayerPosition = useGameStore(state => state.updatePlayerPosition);
  const playerState = useGameStore(state => state.player);
  const lighting = useGameStore(state => state.lighting);

  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 576;
  const TILE_SIZE = 48;
  const SPEED = 220;

  /**
   * Initialize Pixi.js Application
   */
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    console.log('[GameCanvas] Initializing Pixi.js...');
    setInitStatus('Creating Pixi app...');

    // Create Pixi Application
    const app = new PIXI.Application();
    appRef.current = app;

    app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      background: 0x1a1a1a, // Slightly lighter background for better visibility
      antialias: false,
    }).then(() => {
      console.log('[GameCanvas] App initialized, appending canvas...');
      setInitStatus('App initialized, appending canvas...');

      if (!canvasRef.current) {
        console.error('[GameCanvas] ❌ canvasRef.current is null after init!');
        setInitStatus('ERROR: canvasRef is null!');
        return;
      }

      canvasRef.current.appendChild(app.canvas);
      console.log('[GameCanvas] Canvas appended to DOM');
      setInitStatus('Canvas appended, generating textures...');

      // Generate textures
      const textures = generateAllTextures();
      gameDataRef.current.textures = textures;

      // Generate map
      const map = new MapSystem(50, 50);
      const spawn = map.generate();
      gameDataRef.current.map = map;
      gameDataRef.current.playerX = spawn.x;
      gameDataRef.current.playerY = spawn.y;

      // Create containers
      const worldContainer = new PIXI.Container();
      const uiContainer = new PIXI.Container();

      // Create map graphics
      const mapGraphics = new PIXI.Graphics();
      mapGraphicsRef.current = mapGraphics;
      worldContainer.addChild(mapGraphics);

      // Create player sprite
      const playerSprite = new PIXI.Sprite(textures.hero);
      playerSprite.anchor.set(0.5);
      playerSprite.x = spawn.x;
      playerSprite.y = spawn.y;
      playerSpriteRef.current = playerSprite;
      worldContainer.addChild(playerSprite);

      // Create lighting overlay
      const lightingGraphics = new PIXI.Graphics();
      lightingGraphicsRef.current = lightingGraphics;
      uiContainer.addChild(lightingGraphics);

      app.stage.addChild(worldContainer);
      app.stage.addChild(uiContainer);

      // Initialize camera to center on player
      gameDataRef.current.cameraX = spawn.x - CANVAS_WIDTH / 2;
      gameDataRef.current.cameraY = spawn.y - CANVAS_HEIGHT / 2;
      worldContainer.x = -Math.floor(gameDataRef.current.cameraX);
      worldContainer.y = -Math.floor(gameDataRef.current.cameraY);

      // Do initial render BEFORE starting game loop
      // Render initial map state
      const startX = Math.max(0, Math.floor(gameDataRef.current.cameraX / TILE_SIZE) - 1);
      const endX = Math.min(map.width, Math.ceil((gameDataRef.current.cameraX + CANVAS_WIDTH) / TILE_SIZE) + 1);
      const startY = Math.max(0, Math.floor(gameDataRef.current.cameraY / TILE_SIZE) - 1);
      const endY = Math.min(map.height, Math.ceil((gameDataRef.current.cameraY + CANVAS_HEIGHT) / TILE_SIZE) + 1);

      let floorCount = 0;
      let wallCount = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const tile = map.get(x, y);
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          if (tile === map.TILE_FLOOR) {
            mapGraphics.rect(px, py, TILE_SIZE, TILE_SIZE).fill(0x3d5a40);
            floorCount++;
          } else if (tile === map.TILE_WALL) {
            mapGraphics.rect(px, py, TILE_SIZE, TILE_SIZE).fill(0x2b2d42);
            wallCount++;
          }
        }
      }

      console.log('[GameCanvas] Initial render complete:', { floorCount, wallCount });

      // DEBUG: Add a bright test rectangle at screen center to verify rendering
      const testRect = new PIXI.Graphics();
      testRect.rect(CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2 - 50, 100, 100).fill(0xff0000); // Bright red
      uiContainer.addChild(testRect);
      console.log('[GameCanvas] DEBUG: Added red test rectangle at screen center');

      // Update store
      updatePlayerPosition(spawn.x, spawn.y);
      useGameStore.getState().startGame();

      console.log('[GameCanvas] ✅ Initialized!', {
        playerPos: { x: spawn.x, y: spawn.y },
        cameraPos: { x: gameDataRef.current.cameraX, y: gameDataRef.current.cameraY },
        tiles: { startX, endX, startY, endY }
      });

      setInitStatus('✅ Ready!');

      // Start game loop
      app.ticker.add((ticker) => gameLoop(ticker.deltaTime));
    }).catch(error => {
      console.error('[GameCanvas] ❌ Initialization failed:', error);
      console.error('[GameCanvas] Error stack:', error.stack);
      setInitStatus(`ERROR: ${error.message}`);
    });

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  /**
   * Game Loop - 60 FPS
   */
  const gameLoop = (delta) => {
    const dt = delta / 60;
    const data = gameDataRef.current;
    const map = data.map;
    const playerSprite = playerSpriteRef.current;

    if (!playerSprite || !map) return;

    // Handle movement
    let vx = 0;
    let vy = 0;

    if (controls.up) vy -= 1;
    if (controls.down) vy += 1;
    if (controls.left) vx -= 1;
    if (controls.right) vx += 1;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const mag = Math.sqrt(vx * vx + vy * vy);
      vx /= mag;
      vy /= mag;
    }

    // Move player
    const newX = data.playerX + vx * SPEED * dt;
    const newY = data.playerY + vy * SPEED * dt;

    // Simple collision (check if tile is walkable)
    const tileX = Math.floor(newX / TILE_SIZE);
    const tileY = Math.floor(newY / TILE_SIZE);
    const canMove = map.get(tileX, tileY) === map.TILE_FLOOR;

    if (canMove) {
      data.playerX = newX;
      data.playerY = newY;
      playerSprite.x = newX;
      playerSprite.y = newY;

      // Update facing
      if (vx !== 0) {
        playerSprite.scale.x = vx > 0 ? 1 : -1;
      }

      // Update store (throttled)
      if (Math.random() < 0.1) {
        updatePlayerPosition(newX, newY);
      }
    }

    // Update camera
    const targetCamX = data.playerX - CANVAS_WIDTH / 2;
    const targetCamY = data.playerY - CANVAS_HEIGHT / 2;
    data.cameraX += (targetCamX - data.cameraX) * 0.1;
    data.cameraY += (targetCamY - data.cameraY) * 0.1;

    // Move world container
    const worldContainer = appRef.current.stage.children[0];
    worldContainer.x = -Math.floor(data.cameraX);
    worldContainer.y = -Math.floor(data.cameraY);

    // Render map
    renderMap();

    // Render lighting
    renderLighting();
  };

  /**
   * Render the tilemap
   */
  const renderMap = () => {
    const g = mapGraphicsRef.current;
    const data = gameDataRef.current;
    const map = data.map;

    if (!g || !map) return;

    g.clear();

    // Only render visible tiles
    const startX = Math.max(0, Math.floor(data.cameraX / TILE_SIZE) - 1);
    const endX = Math.min(map.width, Math.ceil((data.cameraX + CANVAS_WIDTH) / TILE_SIZE) + 1);
    const startY = Math.max(0, Math.floor(data.cameraY / TILE_SIZE) - 1);
    const endY = Math.min(map.height, Math.ceil((data.cameraY + CANVAS_HEIGHT) / TILE_SIZE) + 1);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map.get(x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (tile === map.TILE_FLOOR) {
          g.rect(px, py, TILE_SIZE, TILE_SIZE).fill(0x3d5a40);
        } else if (tile === map.TILE_WALL) {
          g.rect(px, py, TILE_SIZE, TILE_SIZE).fill(0x2b2d42);
        }
      }
    }
  };

  /**
   * Render lighting overlay
   * SIMPLIFIED VERSION - Creates a basic fog of war effect
   */
  const renderLighting = () => {
    const g = lightingGraphicsRef.current;
    const data = gameDataRef.current;

    if (!g) return;

    g.clear();

    if (!lighting.enabled) return;

    // Calculate player screen position
    const playerScreenX = data.playerX - data.cameraX;
    const playerScreenY = data.playerY - data.cameraY;

    // FIXED APPROACH: Use multiple circles with decreasing alpha
    // to create a smooth fog of war gradient

    // Draw the outer darkness layer
    g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).fill({ color: 0x000000, alpha: lighting.darknessOpacity });

    // Use ERASE blend mode to cut out the visible area
    g.blendMode = 'erase';

    // Draw gradient circles from center to edge
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const radius = lighting.visionRadius * ratio;
      const alpha = 1 - ratio; // Fade from opaque to transparent

      g.circle(playerScreenX, playerScreenY, radius).fill({ color: 0xffffff, alpha: alpha * 0.8 });
    }

    // Reset blend mode
    g.blendMode = 'normal';
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={canvasRef}
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          margin: '0 auto',
        }}
      />
      {/* Debug status overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 0, 0, 0.8)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '14px',
        pointerEvents: 'none',
        zIndex: 9999,
      }}>
        {initStatus}
      </div>
    </div>
  );
};
