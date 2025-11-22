/**
 * Character Classes System
 * Defines all playable character classes with stats, skills, and playstyles
 */

import { CFG } from './config.js';

export const CLASSES = {
    WARRIOR: {
        name: 'Warrior',
        description: 'Master of melee combat with high health and devastating strikes',
        color: '#e63946',
        icon: '⚔️',

        // Base stats
        baseHp: 150,
        baseMana: 50,
        baseSpeed: 200,
        baseDamage: 15,

        // Stat scaling per level
        hpPerLevel: 25,
        manaPerLevel: 5,

        // Primary attributes
        strength: 15,
        dexterity: 8,
        intelligence: 5,
        vitality: 12,

        // Skills (will be implemented in skill system)
        skills: [
            {
                id: 'whirlwind',
                name: 'Whirlwind',
                key: '1',
                manaCost: 20,
                cooldown: 6,
                description: 'Spin in a deadly circle, damaging all nearby enemies'
            },
            {
                id: 'warcry',
                name: 'War Cry',
                key: '2',
                manaCost: 15,
                cooldown: 10,
                description: 'Unleash a powerful shout that stuns enemies and boosts damage'
            },
            {
                id: 'cleave',
                name: 'Cleave',
                key: '3',
                manaCost: 10,
                cooldown: 4,
                description: 'Powerful swing that hits multiple enemies in front'
            },
            {
                id: 'berserk',
                name: 'Berserk',
                key: '4',
                manaCost: 30,
                cooldown: 15,
                description: 'Enter rage mode: increased damage and speed but lower defense'
            }
        ]
    },

    ROGUE: {
        name: 'Rogue',
        description: 'Swift assassin with deadly precision and shadow powers',
        color: '#b185db',
        icon: '🗡️',

        baseHp: 80,
        baseMana: 100,
        baseSpeed: 280,
        baseDamage: 12,

        hpPerLevel: 15,
        manaPerLevel: 15,

        strength: 8,
        dexterity: 15,
        intelligence: 10,
        vitality: 7,

        skills: [
            {
                id: 'backstab',
                name: 'Backstab',
                key: '1',
                manaCost: 15,
                cooldown: 5,
                description: 'Teleport behind target and deal massive critical damage'
            },
            {
                id: 'shadowstep',
                name: 'Shadow Step',
                key: '2',
                manaCost: 20,
                cooldown: 8,
                description: 'Become invisible and dash forward, leaving shadow clones'
            },
            {
                id: 'poisonblade',
                name: 'Poison Blade',
                key: '3',
                manaCost: 12,
                cooldown: 6,
                description: 'Next 3 attacks deal poison damage over time'
            },
            {
                id: 'fanofknives',
                name: 'Fan of Knives',
                key: '4',
                manaCost: 25,
                cooldown: 10,
                description: 'Throw knives in all directions, hitting everything nearby'
            }
        ]
    },

    MAGE: {
        name: 'Mage',
        description: 'Wielder of elemental magic with devastating spells',
        color: '#1e90ff',
        icon: '🔮',

        baseHp: 60,
        baseMana: 150,
        baseSpeed: 180,
        baseDamage: 8,

        hpPerLevel: 12,
        manaPerLevel: 25,

        strength: 5,
        dexterity: 7,
        intelligence: 15,
        vitality: 8,

        skills: [
            {
                id: 'fireball',
                name: 'Fireball',
                key: '1',
                manaCost: 20,
                cooldown: 3,
                description: 'Launch an explosive fireball that deals area damage'
            },
            {
                id: 'frostnova',
                name: 'Frost Nova',
                key: '2',
                manaCost: 25,
                cooldown: 8,
                description: 'Freeze all nearby enemies solid for 3 seconds'
            },
            {
                id: 'teleport',
                name: 'Teleport',
                key: '3',
                manaCost: 30,
                cooldown: 6,
                description: 'Instantly teleport to cursor location'
            },
            {
                id: 'meteor',
                name: 'Meteor',
                key: '4',
                manaCost: 50,
                cooldown: 12,
                description: 'Call down a massive meteor that obliterates an area'
            }
        ]
    },

    PALADIN: {
        name: 'Paladin',
        description: 'Holy warrior who balances offense and defense with light magic',
        color: '#ffb703',
        icon: '✨',

        baseHp: 120,
        baseMana: 80,
        baseSpeed: 210,
        baseDamage: 12,

        hpPerLevel: 20,
        manaPerLevel: 12,

        strength: 12,
        dexterity: 8,
        intelligence: 10,
        vitality: 10,

        skills: [
            {
                id: 'holysmite',
                name: 'Holy Smite',
                key: '1',
                manaCost: 15,
                cooldown: 4,
                description: 'Strike with holy light, dealing extra damage to undead'
            },
            {
                id: 'divineprotection',
                name: 'Divine Shield',
                key: '2',
                manaCost: 25,
                cooldown: 15,
                description: 'Become invulnerable for 3 seconds'
            },
            {
                id: 'heal',
                name: 'Holy Heal',
                key: '3',
                manaCost: 20,
                cooldown: 8,
                description: 'Restore 50% of maximum health instantly'
            },
            {
                id: 'consecration',
                name: 'Consecration',
                key: '4',
                manaCost: 30,
                cooldown: 10,
                description: 'Create holy ground that damages enemies standing in it'
            }
        ]
    }
};

/**
 * Get class by name
 * @param {string} className - Class name (WARRIOR, ROGUE, MAGE, PALADIN)
 * @returns {Object} Class definition
 */
export function getClass(className) {
    return CLASSES[className.toUpperCase()];
}

/**
 * Get all available classes as array
 * @returns {Array} Array of class definitions
 */
export function getAllClasses() {
    return Object.values(CLASSES);
}
