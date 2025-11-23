import { Sprite, useTick } from '@pixi/react';
import { useRef, useState } from 'react';
import { useControls } from '../hooks/useControls';
import { useGameStore } from '../stores/useGameStore';

/**
 * Player Component - The Hero
 * Handles player movement, collision, and state sync
 */
export const Player = ({ texture, map }) => {
  const controls = useControls();

  // Global state actions
  const updatePlayerPosition = useGameStore(state => state.updatePlayerPosition);
  const takeDamage = useGameStore(state => state.takeDamage);
  const gainXP = useGameStore(state => state.gainXP);

  // Local rendering state (for smooth 60fps animation)
  const playerState = useGameStore(state => state.player);
  const [x, setX] = useState(playerState.x);
  const [y, setY] = useState(playerState.y);
  const [facing, setFacing] = useState(1); // 1 = right, -1 = left

  // Movement constants
  const SPEED = 220; // pixels per second
  const TILE_SIZE = 48;

  // Dash state
  const dashTimer = useRef(0);
  const dashSpeed = useRef(0);
  const isDashing = useRef(false);

  // Attack state
  const attackCooldown = useRef(0);

  // Toggle states (to prevent rapid toggling)
  const wasTogglingLighting = useRef(false);

  /**
   * Check if position collides with walls
   */
  const canMoveTo = (newX, newY) => {
    if (!map) return true;

    const tileX = Math.floor(newX / TILE_SIZE);
    const tileY = Math.floor(newY / TILE_SIZE);

    // FIXED: Check if tile is walkable
    // TILE_FLOOR = 1 is walkable, TILE_WALL = 2 and TILE_VOID = 0 are not
    if (map.get && map.get(tileX, tileY) !== map.TILE_FLOOR) {
      return false; // Not walkable (wall or void)
    }

    return true;
  };

  /**
   * Game Loop - 60 FPS
   */
  useTick((delta) => {
    const dt = delta / 60; // Convert to seconds

    // Update cooldowns
    if (dashTimer.current > 0) {
      dashTimer.current -= dt;
      if (dashTimer.current <= 0) {
        isDashing.current = false;
        dashSpeed.current = 0;
      }
    }

    if (attackCooldown.current > 0) {
      attackCooldown.current -= dt;
    }

    // Handle movement
    let vx = 0;
    let vy = 0;

    if (controls.up) vy -= 1;
    if (controls.down) vy += 1;
    if (controls.left) {
      vx -= 1;
      setFacing(-1);
    }
    if (controls.right) {
      vx += 1;
      setFacing(1);
    }

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const magnitude = Math.sqrt(vx * vx + vy * vy);
      vx /= magnitude;
      vy /= magnitude;
    }

    // Handle dash
    if (controls.dash && dashTimer.current <= 0 && (vx !== 0 || vy !== 0)) {
      isDashing.current = true;
      dashTimer.current = 0.2; // 200ms dash
      dashSpeed.current = 800; // Fast dash speed
    }

    // Apply speed
    const currentSpeed = isDashing.current ? dashSpeed.current : SPEED;
    let newX = x + vx * currentSpeed * dt;
    let newY = y + vy * currentSpeed * dt;

    // Collision detection
    if (!canMoveTo(newX, y)) {
      newX = x; // Block X movement
    }
    if (!canMoveTo(x, newY)) {
      newY = y; // Block Y movement
    }

    // Update position
    if (newX !== x || newY !== y) {
      setX(newX);
      setY(newY);

      // Sync with global store (throttled - only when actually moving)
      updatePlayerPosition(newX, newY);
    }

    // Handle attack
    if (controls.attack && attackCooldown.current <= 0) {
      attackCooldown.current = 0.3; // 300ms attack cooldown
      // Attack logic will be handled by combat system
      console.log('[Player] Attack!');
    }

    // FIXED: Toggle lighting (prevent rapid toggling)
    if (controls.toggleLighting && !wasTogglingLighting.current) {
      useGameStore.getState().toggleDarkness();
      wasTogglingLighting.current = true;
    } else if (!controls.toggleLighting) {
      wasTogglingLighting.current = false;
    }
  });

  return (
    <Sprite
      texture={texture}
      x={x}
      y={y}
      anchor={0.5}
      scale={{ x: facing, y: 1 }} // Flip sprite based on facing direction
    />
  );
};
