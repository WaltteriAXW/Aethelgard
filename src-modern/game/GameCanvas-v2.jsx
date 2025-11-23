import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { generateAllTextures } from './utils/textureGenerator';
import { MapSystem } from './systems/MapSystem';
import { CombatSystem } from './systems/CombatSystem';
import { EnemyManager } from './systems/EnemySystem';
import { ParticleSystem } from './systems/ParticleSystem';
import { LootManager } from './systems/LootSystem';
import { FloatingTextManager } from './systems/AnimationSystem';
import { CameraEffects } from './systems/CameraEffects';
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
  const enemyContainerRef = useRef(null);
  const particleGraphicsRef = useRef(null);
  const lootContainerRef = useRef(null);
  const floatingTextGraphicsRef = useRef(null);
  const flashGraphicsRef = useRef(null);
  const gameDataRef = useRef({
    map: null,
    textures: null,
    playerX: 400,
    playerY: 300,
    cameraX: 0,
    cameraY: 0,
    playerFacingRight: true,
    playerHp: 100,
    playerMaxHp: 100,
    gold: 0,
    combatSystem: null,
    enemyManager: null,
    particleSystem: null,
    lootManager: null,
    floatingTextManager: null,
    cameraEffects: null,
  });
  const [initStatus, setInitStatus] = useState('Initializing...');

  const controls = useControls();
  const controlsRef = useRef(controls); // Store in ref to avoid stale closure
  const updatePlayerPosition = useGameStore(state => state.updatePlayerPosition);
  const updatePlayerStats = useGameStore(state => state.updatePlayerStats);
  const playerState = useGameStore(state => state.player);
  const lighting = useGameStore(state => state.lighting);

  // Update controls ref whenever controls change
  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

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

      // Initialize game systems
      const combatSystem = new CombatSystem();
      const enemyManager = new EnemyManager(map, TILE_SIZE);
      const particleSystem = new ParticleSystem();
      const lootManager = new LootManager();
      const floatingTextManager = new FloatingTextManager();
      const cameraEffects = new CameraEffects();

      gameDataRef.current.combatSystem = combatSystem;
      gameDataRef.current.enemyManager = enemyManager;
      gameDataRef.current.particleSystem = particleSystem;
      gameDataRef.current.lootManager = lootManager;
      gameDataRef.current.floatingTextManager = floatingTextManager;
      gameDataRef.current.cameraEffects = cameraEffects;

      console.log('[GameCanvas] Systems initialized:', {
        combatSystem,
        enemyManager,
        particleSystem,
        lootManager,
        floatingTextManager,
        cameraEffects
      });

      // Create containers
      const worldContainer = new PIXI.Container();
      const uiContainer = new PIXI.Container();

      // Create map graphics
      const mapGraphics = new PIXI.Graphics();
      mapGraphicsRef.current = mapGraphics;
      worldContainer.addChild(mapGraphics);

      // Create enemy container
      const enemyContainer = new PIXI.Container();
      enemyContainerRef.current = enemyContainer;
      worldContainer.addChild(enemyContainer);

      // Create loot container
      const lootContainer = new PIXI.Container();
      lootContainerRef.current = lootContainer;
      worldContainer.addChild(lootContainer);

      // Create player sprite
      const playerSprite = new PIXI.Sprite(textures.hero);
      playerSprite.anchor.set(0.5);
      playerSprite.x = spawn.x;
      playerSprite.y = spawn.y;
      // Make player larger and more visible
      playerSprite.scale.set(2, 2); // 2x larger than tiles
      playerSpriteRef.current = playerSprite;
      worldContainer.addChild(playerSprite);
      console.log('[GameCanvas] Player sprite created:', {
        position: { x: playerSprite.x, y: playerSprite.y },
        size: { width: playerSprite.width, height: playerSprite.height },
        scale: playerSprite.scale
      });

      // Create particle graphics (rendered on top of player)
      const particleGraphics = new PIXI.Graphics();
      particleGraphicsRef.current = particleGraphics;
      worldContainer.addChild(particleGraphics);

      // Create floating text graphics (rendered on top of particles)
      const floatingTextGraphics = new PIXI.Graphics();
      floatingTextGraphicsRef.current = floatingTextGraphics;
      worldContainer.addChild(floatingTextGraphics);

      // Create lighting overlay
      const lightingGraphics = new PIXI.Graphics();
      lightingGraphicsRef.current = lightingGraphics;
      uiContainer.addChild(lightingGraphics);

      // Create flash overlay (for screen flash effects)
      const flashGraphics = new PIXI.Graphics();
      flashGraphicsRef.current = flashGraphics;
      uiContainer.addChild(flashGraphics);

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
    const combatSystem = data.combatSystem;
    const enemyManager = data.enemyManager;
    const particleSystem = data.particleSystem;
    const lootManager = data.lootManager;
    const floatingTextManager = data.floatingTextManager;
    const cameraEffects = data.cameraEffects;

    if (!playerSprite || !map || !combatSystem || !enemyManager || !particleSystem || !lootManager || !floatingTextManager || !cameraEffects) return;

    // Update systems
    combatSystem.update(dt);
    particleSystem.update(dt);
    lootManager.update(dt);
    floatingTextManager.update(dt);
    cameraEffects.update(dt);

    // Handle movement
    let vx = 0;
    let vy = 0;

    // Use controlsRef to get current controls (avoid stale closure)
    const currentControls = controlsRef.current;
    if (currentControls.up) vy -= 1;
    if (currentControls.down) vy += 1;
    if (currentControls.left) vx -= 1;
    if (currentControls.right) vx += 1;

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
        const facingRight = vx > 0;
        data.playerFacingRight = facingRight;
        playerSprite.scale.x = facingRight ? 2 : -2;
      }

      // Update store (throttled)
      if (Math.random() < 0.1) {
        updatePlayerPosition(newX, newY);
        updatePlayerStats({
          hp: data.playerHp,
          gold: data.gold,
        });
      }
    }

    // Handle attack
    if (currentControls.attack) {
      if (combatSystem.tryAttack(data.playerX, data.playerY, data.playerFacingRight)) {
        // Create slash effect
        const attackAngle = data.playerFacingRight ? 0 : Math.PI;
        const slashX = data.playerX + Math.cos(attackAngle) * 50;
        const slashY = data.playerY;
        particleSystem.createSlashEffect(slashX, slashY, attackAngle);

        // Light screen shake for attack
        cameraEffects.addShake(0.3);

        // Check hits
        const hitbox = combatSystem.getAttackHitbox(data.playerX, data.playerY);
        if (hitbox) {
          const hits = enemyManager.checkCombatHits(hitbox);
          for (const hit of hits) {
            // Damage particles and text
            particleSystem.createDamageEffect(hit.enemy.x, hit.enemy.y);
            floatingTextManager.addDamageNumber(hit.enemy.x, hit.enemy.y - 20, hitbox.damage);

            // Screen shake on hit
            cameraEffects.addShake(0.5);

            if (hit.died) {
              // Death effects
              particleSystem.createDeathEffect(hit.enemy.x, hit.enemy.y);
              cameraEffects.addShake(0.8); // Bigger shake on death
              cameraEffects.addFlash(0.3, 0xff4444); // Red flash

              // Drop loot
              lootManager.spawnLoot(hit.enemy.x, hit.enemy.y);
            }
          }
        }
      }
    }

    // Handle item pickup
    if (currentControls.interact) {
      const collected = lootManager.checkPickups(data.playerX, data.playerY);
      for (const item of collected) {
        if (item.value > 0) {
          data.gold += item.value;
          floatingTextManager.addGoldNumber(data.playerX, data.playerY - 20, item.value);
        }
        if (item.heal > 0) {
          data.playerHp = Math.min(data.playerMaxHp, data.playerHp + item.heal);
          floatingTextManager.addHealNumber(data.playerX, data.playerY - 20, item.heal);
        }
        particleSystem.createLootEffect(data.playerX, data.playerY);
      }
    }

    // Update enemies
    const enemyActions = enemyManager.update(dt, data.playerX, data.playerY);
    for (const action of enemyActions) {
      if (action.type === 'attack') {
        // Player takes damage
        data.playerHp = Math.max(0, data.playerHp - action.damage);
        particleSystem.createDamageEffect(data.playerX, data.playerY);
        floatingTextManager.addDamageNumber(data.playerX, data.playerY - 30, action.damage);

        // Screen shake and red flash when hit
        cameraEffects.addShake(0.6);
        cameraEffects.addFlash(0.4, 0xff0000);
      }
    }

    // Update camera with shake
    const targetCamX = data.playerX - CANVAS_WIDTH / 2;
    const targetCamY = data.playerY - CANVAS_HEIGHT / 2;
    data.cameraX += (targetCamX - data.cameraX) * 0.1;
    data.cameraY += (targetCamY - data.cameraY) * 0.1;

    // Apply shake offset
    const shake = cameraEffects.getShakeOffset();

    // Move world container with shake
    const worldContainer = appRef.current.stage.children[0];
    worldContainer.x = -Math.floor(data.cameraX) + shake.x;
    worldContainer.y = -Math.floor(data.cameraY) + shake.y;

    // Render everything
    renderMap();
    renderEnemies();
    renderLoot();
    renderParticles();
    renderFloatingText();
    renderLighting();
    renderFlash();
  };

  /**
   * Render the tilemap - Enhanced Tier 1 Edition
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
          // Enhanced floor with subtle variation
          const variation = ((x + y) % 3) * 0.05;
          const baseColor = 0x3d5a40;
          g.rect(px, py, TILE_SIZE, TILE_SIZE).fill(baseColor);

          // Add subtle grid
          g.rect(px, py, TILE_SIZE, TILE_SIZE).stroke({
            color: 0x2a3d2e,
            width: 1,
            alpha: 0.3,
          });
        } else if (tile === map.TILE_WALL) {
          // Enhanced walls with depth
          g.rect(px, py, TILE_SIZE, TILE_SIZE).fill(0x2b2d42);

          // Add highlight on top edge
          g.rect(px, py, TILE_SIZE, 4).fill({ color: 0x3f4153, alpha: 0.6 });

          // Add border
          g.rect(px, py, TILE_SIZE, TILE_SIZE).stroke({
            color: 0x1a1c2e,
            width: 2,
          });
        }
      }
    }
  };

  /**
   * Render enemies
   */
  const renderEnemies = () => {
    const container = enemyContainerRef.current;
    const data = gameDataRef.current;
    const enemyManager = data.enemyManager;
    const textures = data.textures;

    if (!container || !enemyManager || !textures) return;

    // Clear existing sprites
    container.removeChildren();

    // Create sprite for each enemy
    const enemies = enemyManager.getEnemies();
    for (const enemy of enemies) {
      const texture = textures[enemy.type] || textures.skel;
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.x = enemy.x;
      sprite.y = enemy.y;
      sprite.scale.set(2, 2);

      // Flash red when stunned
      if (enemy.stunned) {
        sprite.tint = 0xff3333;
      }

      container.addChild(sprite);

      // Draw health bar
      const hpBar = new PIXI.Graphics();
      const hpPercent = enemy.getHealthPercent();
      const barWidth = 40;
      const barHeight = 4;
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - 30;

      // Background
      hpBar.rect(barX, barY, barWidth, barHeight).fill(0x000000);
      // Health fill
      hpBar.rect(barX, barY, barWidth * hpPercent, barHeight).fill(0xff0000);

      container.addChild(hpBar);
    }
  };

  /**
   * Render loot items
   */
  const renderLoot = () => {
    const container = lootContainerRef.current;
    const data = gameDataRef.current;
    const lootManager = data.lootManager;

    if (!container || !lootManager) return;

    // Clear existing items
    container.removeChildren();

    // Render each loot item
    const items = lootManager.getItems();
    for (const item of items) {
      const bobOffset = item.getBobOffset();
      const graphics = new PIXI.Graphics();

      // Draw loot as colored circle
      graphics.circle(item.x, item.y + bobOffset, item.properties.size).fill(item.properties.color);

      // Add glow/outline
      graphics.circle(item.x, item.y + bobOffset, item.properties.size + 2).stroke({
        color: 0xffffff,
        width: 1,
        alpha: 0.5,
      });

      container.addChild(graphics);
    }
  };

  /**
   * Render particle effects - ENHANCED with glow and trails
   */
  const renderParticles = () => {
    const g = particleGraphicsRef.current;
    const data = gameDataRef.current;
    const particleSystem = data.particleSystem;

    if (!g || !particleSystem) return;

    g.clear();

    const particles = particleSystem.getParticles();
    for (const particle of particles) {
      const alpha = particle.getAlpha();
      const size = particle.getSize();

      // Draw trail if enabled
      if (particle.trail && particle.trailHistory.length > 0) {
        for (let i = 0; i < particle.trailHistory.length; i++) {
          const pos = particle.trailHistory[i];
          const trailAlpha = alpha * (i / particle.trailHistory.length) * 0.5;
          const trailSize = size * (i / particle.trailHistory.length);
          g.circle(pos.x, pos.y, trailSize).fill({
            color: particle.color,
            alpha: trailAlpha,
          });
        }
      }

      // Draw main particle
      g.circle(particle.x, particle.y, size).fill({
        color: particle.color,
        alpha: alpha,
      });

      // Draw glow if enabled
      if (particle.glow) {
        g.circle(particle.x, particle.y, size + 4).fill({
          color: particle.color,
          alpha: alpha * 0.3,
        });
      }
    }
  };

  /**
   * Render floating text (damage numbers, gold, etc)
   */
  const renderFloatingText = () => {
    const g = floatingTextGraphicsRef.current;
    const data = gameDataRef.current;
    const floatingTextManager = data.floatingTextManager;

    if (!g || !floatingTextManager) return;

    g.clear();

    const texts = floatingTextManager.getTexts();
    for (const text of texts) {
      const alpha = text.getAlpha();
      const scale = text.getScale();
      const size = text.size * scale;

      // Draw shadow
      g.text({
        text: text.text,
        x: text.x + 2,
        y: text.y + 2,
        style: {
          fontFamily: 'monospace',
          fontSize: size,
          fill: 0x000000,
          fontWeight: 'bold',
          alpha: alpha * 0.5,
        },
      });

      // Draw main text
      g.text({
        text: text.text,
        x: text.x,
        y: text.y,
        style: {
          fontFamily: 'monospace',
          fontSize: size,
          fill: text.color,
          fontWeight: 'bold',
          alpha: alpha,
        },
      });
    }
  };

  /**
   * Render flash overlay (screen flash effects)
   */
  const renderFlash = () => {
    const g = flashGraphicsRef.current;
    const data = gameDataRef.current;
    const cameraEffects = data.cameraEffects;

    if (!g || !cameraEffects) return;

    g.clear();

    const flash = cameraEffects.getFlash();
    if (flash.intensity > 0) {
      g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).fill({
        color: flash.color,
        alpha: flash.intensity,
      });
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
    <div
      ref={canvasRef}
      style={{
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        margin: '0 auto',
      }}
    />
  );
};
