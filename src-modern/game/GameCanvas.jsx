import { Stage, Container } from '@pixi/react';
import { useEffect, useState, useRef } from 'react';
import { generateAllTextures } from './utils/textureGenerator';
import { MapSystem } from './systems/MapSystem';
import { Map } from './entities/Map';
import { Player } from './entities/Player';
import { LightingOverlay } from './systems/LightingOverlay';
import { useGameStore } from './stores/useGameStore';

/**
 * GameCanvas - The Main Pixi.js Stage
 * This is where the GPU-accelerated magic happens
 */
export const GameCanvas = () => {
  const [textures, setTextures] = useState(null);
  const [map, setMap] = useState(null);
  const [startPos, setStartPos] = useState({ x: 400, y: 300 });

  const gameState = useGameStore(state => state.gameState);
  const playerPos = useGameStore(state => state.player);

  // Camera state (follows player)
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);

  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 576;

  /**
   * Initialize game assets
   */
  useEffect(() => {
    console.log('[GameCanvas] Initializing...');

    // Generate all sprite textures
    const generatedTextures = generateAllTextures();
    setTextures(generatedTextures);

    // Generate map
    const mapSystem = new MapSystem(50, 50);
    const spawn = mapSystem.generate();
    setMap(mapSystem);
    setStartPos(spawn);

    // Update player position in store
    useGameStore.getState().updatePlayerPosition(spawn.x, spawn.y);

    // Start game
    useGameStore.getState().startGame();

    console.log('[GameCanvas] ✅ Initialized! Spawn:', spawn);
  }, []);

  /**
   * Update camera to follow player smoothly
   */
  useEffect(() => {
    if (playerPos) {
      // Smooth camera lerp
      setCameraX(prev => prev + (playerPos.x - CANVAS_WIDTH / 2 - prev) * 0.1);
      setCameraY(prev => prev + (playerPos.y - CANVAS_HEIGHT / 2 - prev) * 0.1);
    }
  }, [playerPos.x, playerPos.y, CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Wait for textures to load
  if (!textures || !map || gameState !== 'PLAYING') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff',
        fontSize: '24px'
      }}>
        Loading Aethelgard...
      </div>
    );
  }

  return (
    <Stage
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      options={{
        background: 0x0a0a0a,
        antialias: false, // Pixel art doesn't need antialiasing
      }}
    >
      {/* Main Game Container - moved by camera */}
      <Container x={-cameraX} y={-cameraY}>
        {/* Map Layer */}
        <Map mapSystem={map} cameraX={cameraX} cameraY={cameraY} />

        {/* Player Layer */}
        <Player texture={textures.hero} map={map} />

        {/* Enemies would go here */}
        {/* <Enemy texture={textures.skel} /> */}
      </Container>

      {/* Lighting Overlay - CRITICAL FOR VISIBILITY */}
      {/* This is NOT moved by camera - it's screen-space */}
      <LightingOverlay
        playerX={playerPos.x}
        playerY={playerPos.y}
        cameraX={cameraX}
        cameraY={cameraY}
      />
    </Stage>
  );
};
