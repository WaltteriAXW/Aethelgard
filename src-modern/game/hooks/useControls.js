import { useEffect, useState } from 'react';

/**
 * The Input Handling Hook - The "Nervous System"
 * Cleanly separates input detection from game logic
 * Returns current input state that components can read
 */
export const useControls = () => {
  const [keys, setKeys] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default browser behaviors (spacebar scrolling, etc.)
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      setKeys(k => ({ ...k, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(k => ({ ...k, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Return a clean interface for game actions
  return {
    // Movement
    up: keys['KeyW'] || keys['ArrowUp'],
    down: keys['KeyS'] || keys['ArrowDown'],
    left: keys['KeyA'] || keys['ArrowLeft'],
    right: keys['KeyD'] || keys['ArrowRight'],

    // Actions
    attack: keys['Space'] || keys['KeyJ'],
    dash: keys['ShiftLeft'] || keys['ShiftRight'],
    interact: keys['KeyE'],

    // Skills
    skill1: keys['Digit1'],
    skill2: keys['Digit2'],

    // UI
    inventory: keys['KeyI'],
    map: keys['KeyM'],
    pause: keys['Escape'],

    // Debug
    toggleLighting: keys['KeyL'],
  };
};
