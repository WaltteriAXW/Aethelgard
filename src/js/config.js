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
    PLAYER_START_HP: 100,
    PLAYER_START_MANA: 100,

    // Enemy settings
    ENEMY_COUNT: 25,
    ENEMY_HP: 50,
    ENEMY_AGGRO_RANGE: 300,
    ENEMY_ATTACK_RANGE: 30,
    ENEMY_SPAWN_MIN_DISTANCE: 300,

    // Combat settings
    BASE_ATTACK_DAMAGE: 10,
    LEVEL_DAMAGE_BONUS: 5,
    HIT_STOP_DURATION: 0.08,    // Stronger hit freeze
    KNOCKBACK_FORCE: 600,
    GORE_ENABLED: true,

    // Progression settings
    XP_PER_KILL: 50,
    XP_PER_LEVEL: 100,
    HP_PER_LEVEL: 20,
    MANA_PER_LEVEL: 15,

    // DIABLO-LIKE LIGHTING SETTINGS
    DARKNESS_ENABLED: true,         // Enable fog of war
    DARKNESS_OPACITY: 0.92,         // Near-total darkness (90%+ black)
    VISION_RADIUS: 180,             // Player's vision circle (smaller = more claustrophobic)
    PLAYER_LIGHT_RADIUS: 150,       // Reduced light radius
    LOOT_LIGHT_RADIUS: 80,
    ENEMY_LIGHT_RADIUS: 40,
    LIGHT_FALLOFF: 0.6,             // How quickly light fades (0.5-0.8 for harsh falloff)

    // VISUAL STYLE
    FILM_GRAIN_INTENSITY: 0.08,     // Gritty overlay noise
    COLOR_DESATURATION: 0.2,        // Reduce color saturation for Gothic look
    VIGNETTE_INTENSITY: 0.3,        // Dark corners

    // Gore and corpses
    CORPSE_FADE_TIME: 30,           // Seconds before corpses fade
    BLOOD_STAIN_DURATION: 60,       // Blood stays longer
    MAX_CORPSES: 50,                // Limit for performance

    // Quest settings
    QUEST_ENEMY_GOAL: 10,

    // Loot settings
    LOOT_BEAM_HEIGHT: 120,          // Height of colored loot beam
    LOOT_RARITIES: ['common', 'uncommon', 'rare', 'epic', 'legendary']
};
