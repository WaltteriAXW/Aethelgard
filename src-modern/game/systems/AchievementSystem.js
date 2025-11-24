/**
 * AchievementSystem - Track player accomplishments and milestones
 * Provides long-term progression goals
 */

export class Achievement {
  constructor(config) {
    this.id = config.id;
    this.title = config.title;
    this.description = config.description;
    this.icon = config.icon || '🏆';
    this.requirement = config.requirement; // { type, target }
    this.progress = 0;
    this.unlocked = false;
    this.unlockedAt = null;
    this.rarity = config.rarity || 'common'; // common, rare, epic, legendary
    this.hidden = config.hidden || false; // Hidden until unlocked
    this.rewards = config.rewards || {};
  }

  /**
   * Update achievement progress
   */
  updateProgress(amount) {
    if (this.unlocked) return false;

    this.progress = Math.min(this.progress + amount, this.requirement.target);

    if (this.progress >= this.requirement.target) {
      this.unlocked = true;
      this.unlockedAt = Date.now();
      return { achieved: true, achievement: this };
    }

    return { progress: this.progress };
  }

  /**
   * Get completion percentage
   */
  getPercentage() {
    return (this.progress / this.requirement.target) * 100;
  }

  /**
   * Get display name (hidden if not unlocked)
   */
  getDisplayTitle() {
    return (this.hidden && !this.unlocked) ? '???' : this.title;
  }

  /**
   * Get display description
   */
  getDisplayDescription() {
    return (this.hidden && !this.unlocked) ? 'Hidden achievement' : this.description;
  }
}

export class AchievementSystem {
  constructor() {
    this.achievements = this.createAchievements();
    this.recentUnlocks = []; // Recently unlocked for notifications
  }

  /**
   * Create all achievements
   */
  createAchievements() {
    return [
      // Combat achievements
      new Achievement({
        id: 'first_blood',
        title: 'First Blood',
        description: 'Defeat your first enemy',
        icon: '⚔️',
        requirement: { type: 'kills', target: 1 },
        rarity: 'common',
      }),
      new Achievement({
        id: 'slayer',
        title: 'Slayer',
        description: 'Defeat 50 enemies',
        icon: '⚔️',
        requirement: { type: 'kills', target: 50 },
        rarity: 'common',
      }),
      new Achievement({
        id: 'executioner',
        title: 'Executioner',
        description: 'Defeat 100 enemies',
        icon: '🗡️',
        requirement: { type: 'kills', target: 100 },
        rarity: 'rare',
      }),
      new Achievement({
        id: 'legend',
        title: 'Legend',
        description: 'Defeat 500 enemies',
        icon: '👑',
        requirement: { type: 'kills', target: 500 },
        rarity: 'epic',
      }),
      new Achievement({
        id: 'god_of_war',
        title: 'God of War',
        description: 'Defeat 1000 enemies',
        icon: '⚡',
        requirement: { type: 'kills', target: 1000 },
        rarity: 'legendary',
        hidden: true,
      }),

      // Wealth achievements
      new Achievement({
        id: 'first_coin',
        title: 'First Coin',
        description: 'Collect your first gold',
        icon: '💰',
        requirement: { type: 'gold', target: 1 },
        rarity: 'common',
      }),
      new Achievement({
        id: 'rich',
        title: 'Getting Rich',
        description: 'Accumulate 1000 gold',
        icon: '💰',
        requirement: { type: 'gold', target: 1000 },
        rarity: 'common',
      }),
      new Achievement({
        id: 'wealthy',
        title: 'Wealthy Warrior',
        description: 'Accumulate 5000 gold',
        icon: '💎',
        requirement: { type: 'gold', target: 5000 },
        rarity: 'rare',
      }),
      new Achievement({
        id: 'tycoon',
        title: 'Gold Tycoon',
        description: 'Accumulate 10000 gold',
        icon: '👑',
        requirement: { type: 'gold', target: 10000 },
        rarity: 'epic',
        hidden: true,
      }),

      // Level achievements
      new Achievement({
        id: 'level_5',
        title: 'Novice Warrior',
        description: 'Reach level 5',
        icon: '⭐',
        requirement: { type: 'level', target: 5 },
        rarity: 'common',
      }),
      new Achievement({
        id: 'level_10',
        title: 'Skilled Fighter',
        description: 'Reach level 10',
        icon: '⭐',
        requirement: { type: 'level', target: 10 },
        rarity: 'rare',
      }),
      new Achievement({
        id: 'level_20',
        title: 'Master Warrior',
        description: 'Reach level 20',
        icon: '🌟',
        requirement: { type: 'level', target: 20 },
        rarity: 'epic',
      }),
      new Achievement({
        id: 'level_50',
        title: 'Legendary Hero',
        description: 'Reach level 50',
        icon: '✨',
        requirement: { type: 'level', target: 50 },
        rarity: 'legendary',
        hidden: true,
      }),

      // Quest achievements
      new Achievement({
        id: 'quest_1',
        title: 'Quest Starter',
        description: 'Complete your first quest',
        icon: '📜',
        requirement: { type: 'quests', target: 1 },
        rarity: 'common',
      }),
      new Achievement({
        id: 'quest_10',
        title: 'Quest Hunter',
        description: 'Complete 10 quests',
        icon: '📜',
        requirement: { type: 'quests', target: 10 },
        rarity: 'rare',
      }),
      new Achievement({
        id: 'quest_50',
        title: 'Quest Master',
        description: 'Complete 50 quests',
        icon: '📖',
        requirement: { type: 'quests', target: 50 },
        rarity: 'epic',
        hidden: true,
      }),

      // Survival achievements
      new Achievement({
        id: 'survivor',
        title: 'Survivor',
        description: 'Survive for 5 minutes',
        icon: '🛡️',
        requirement: { type: 'survive_time', target: 300 },
        rarity: 'common',
      }),
      new Achievement({
        id: 'endurance',
        title: 'Endurance Master',
        description: 'Survive for 15 minutes',
        icon: '🛡️',
        requirement: { type: 'survive_time', target: 900 },
        rarity: 'rare',
      }),
      new Achievement({
        id: 'immortal',
        title: 'Immortal',
        description: 'Survive for 30 minutes',
        icon: '💀',
        requirement: { type: 'survive_time', target: 1800 },
        rarity: 'legendary',
        hidden: true,
      }),

      // Special achievements
      new Achievement({
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Kill 10 enemies in 30 seconds',
        icon: '⚡',
        requirement: { type: 'kill_streak', target: 10 },
        rarity: 'epic',
        hidden: true,
      }),
      new Achievement({
        id: 'untouchable',
        title: 'Untouchable',
        description: 'Kill 20 enemies without taking damage',
        icon: '🌟',
        requirement: { type: 'flawless_kills', target: 20 },
        rarity: 'legendary',
        hidden: true,
      }),
    ];
  }

  /**
   * Update achievement progress
   */
  updateProgress(type, value) {
    const unlocked = [];

    for (const achievement of this.achievements) {
      if (achievement.unlocked) continue;
      if (achievement.requirement.type !== type) continue;

      const result = achievement.updateProgress(value);

      if (result && result.achieved) {
        unlocked.push(achievement);
        this.recentUnlocks.push({
          achievement,
          timestamp: Date.now(),
        });
      }
    }

    return unlocked;
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return this.achievements;
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    return this.achievements.filter(a => a.unlocked);
  }

  /**
   * Get recent unlocks (for notifications)
   */
  getRecentUnlocks(maxAge = 5000) {
    const now = Date.now();
    this.recentUnlocks = this.recentUnlocks.filter(u => now - u.timestamp < maxAge);
    return this.recentUnlocks;
  }

  /**
   * Get completion percentage
   */
  getCompletionPercent() {
    const total = this.achievements.length;
    const unlocked = this.achievements.filter(a => a.unlocked).length;
    return (unlocked / total) * 100;
  }

  /**
   * Get achievement by rarity
   */
  getByRarity(rarity) {
    return this.achievements.filter(a => a.rarity === rarity);
  }

  /**
   * Clear all progress
   */
  clear() {
    for (const achievement of this.achievements) {
      achievement.progress = 0;
      achievement.unlocked = false;
      achievement.unlockedAt = null;
    }
    this.recentUnlocks = [];
  }
}
