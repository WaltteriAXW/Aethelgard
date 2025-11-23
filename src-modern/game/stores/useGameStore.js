import { create } from 'zustand';

/**
 * The Global Game State Store
 * This is the "Brain" - all game data flows through here
 * UI components subscribe to specific slices for optimal performance
 */
export const useGameStore = create((set, get) => ({
  // ============ GAME STATE ============
  gameState: 'MENU', // 'MENU', 'PLAYING', 'PAUSED', 'GAME_OVER'

  // ============ PLAYER STATS ============
  player: {
    x: 400,
    y: 300,
    hp: 100,
    maxHp: 100,
    mana: 100,
    maxMana: 100,
    xp: 0,
    level: 1,
    class: 'WARRIOR',
    isDead: false,
  },

  // ============ CAMERA ============
  camera: {
    x: 0,
    y: 0,
    shake: 0,
  },

  // ============ LIGHTING & VISIBILITY CONFIG ============
  // This is the KEY to solving visibility issues!
  lighting: {
    enabled: true,
    // CRITICAL: Lower opacity = more visibility
    darknessOpacity: 0.3,  // Was 0.75 in old version - NOW MUCH LIGHTER
    // CRITICAL: Larger radius = see further
    visionRadius: 400,     // Was 200 in old version - NOW SEE FURTHER
    lightFalloff: 0.4,     // Was 0.6 - NOW SOFTER EDGES
    playerLightRadius: 200, // Increased from 150
    lootLightRadius: 100,
    enemyLightRadius: 60,
  },

  // ============ ENEMIES ============
  enemies: [],

  // ============ LOOT ============
  loot: [],

  // ============ QUEST ============
  quest: {
    active: false,
    enemiesKilled: 0,
    goal: 10,
  },

  // ============ ACTIONS ============

  // Start the game
  startGame: () => set({ gameState: 'PLAYING' }),

  // Player actions
  updatePlayerPosition: (x, y) => set((state) => ({
    player: { ...state.player, x, y }
  })),

  takeDamage: (amount) => set((state) => {
    const newHp = Math.max(0, state.player.hp - amount);
    return {
      player: {
        ...state.player,
        hp: newHp,
        isDead: newHp === 0
      },
      gameState: newHp === 0 ? 'GAME_OVER' : state.gameState
    };
  }),

  heal: (amount) => set((state) => ({
    player: {
      ...state.player,
      hp: Math.min(state.player.maxHp, state.player.hp + amount)
    }
  })),

  gainXP: (amount) => set((state) => {
    const newXP = state.player.xp + amount;
    const xpNeeded = state.player.level * 100;
    const levelUp = newXP >= xpNeeded;

    if (levelUp) {
      return {
        player: {
          ...state.player,
          xp: newXP - xpNeeded,
          level: state.player.level + 1,
          maxHp: state.player.maxHp + 20,
          hp: state.player.maxHp + 20, // Full heal on level up
          maxMana: state.player.maxMana + 15,
          mana: state.player.maxMana + 15,
        }
      };
    }

    return {
      player: { ...state.player, xp: newXP }
    };
  }),

  // Camera actions
  updateCamera: (x, y) => set({ camera: { x, y, shake: get().camera.shake } }),

  addCameraShake: (intensity) => set((state) => ({
    camera: { ...state.camera, shake: Math.max(state.camera.shake, intensity) }
  })),

  // Enemy actions
  addEnemy: (enemy) => set((state) => ({
    enemies: [...state.enemies, { ...enemy, id: Math.random() }]
  })),

  removeEnemy: (id) => set((state) => ({
    enemies: state.enemies.filter(e => e.id !== id),
    quest: {
      ...state.quest,
      enemiesKilled: state.quest.active ? state.quest.enemiesKilled + 1 : state.quest.enemiesKilled
    }
  })),

  updateEnemy: (id, updates) => set((state) => ({
    enemies: state.enemies.map(e => e.id === id ? { ...e, ...updates } : e)
  })),

  // Loot actions
  addLoot: (loot) => set((state) => ({
    loot: [...state.loot, { ...loot, id: Math.random() }]
  })),

  removeLoot: (id) => set((state) => ({
    loot: state.loot.filter(l => l.id !== id)
  })),

  // Visibility configuration (user can adjust in real-time!)
  updateLighting: (updates) => set((state) => ({
    lighting: { ...state.lighting, ...updates }
  })),

  toggleDarkness: () => set((state) => ({
    lighting: { ...state.lighting, enabled: !state.lighting.enabled }
  })),

  // Quest actions
  startQuest: () => set({
    quest: { active: true, enemiesKilled: 0, goal: 10 }
  }),
}));
