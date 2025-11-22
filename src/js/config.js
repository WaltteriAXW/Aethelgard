/**
 * Game Configuration
 * Central configuration for all game constants and settings
 */

export const CFG = {
    TILE: 48,           // Tile size in pixels
    W: 1024,            // Canvas width
    H: 576,             // Canvas height
    SCALE: 3,           // Sprite scale multiplier

    // Map generation settings
    MAP_WIDTH: 50,
    MAP_HEIGHT: 50,
    MAP_FILL_RATIO: 0.45,

    // Player settings
    PLAYER_SPEED: 220,
    DASH_DURATION: 0.2,
    DASH_SPEED: 800,
    COMBO_TIMEOUT: 0.5,

    // Enemy settings
    ENEMY_COUNT: 20,
    ENEMY_HP: 50,
    ENEMY_AGGRO_RANGE: 300,
    ENEMY_ATTACK_RANGE: 30,
    ENEMY_SPAWN_MIN_DISTANCE: 300,

    // Combat settings
    BASE_ATTACK_DAMAGE: 10,
    LEVEL_DAMAGE_BONUS: 5,

    // Progression settings
    XP_PER_KILL: 50,
    XP_PER_LEVEL: 100,
    HP_PER_LEVEL: 20,

    // Lighting settings
    LIGHT_OPACITY: 0.35,        // Dusk lighting overlay
    PLAYER_LIGHT_RADIUS: 200,
    LOOT_LIGHT_RADIUS: 100,

    // Quest settings
    QUEST_ENEMY_GOAL: 10
};
