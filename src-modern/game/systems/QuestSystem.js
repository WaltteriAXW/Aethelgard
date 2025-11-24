/**
 * QuestSystem - Quest tracking, progression, and rewards
 * Supports dynamic quest generation and AI-powered objectives
 */

export class Quest {
  constructor(config) {
    this.id = config.id || `quest_${Date.now()}`;
    this.title = config.title;
    this.description = config.description;
    this.type = config.type; // 'kill', 'collect', 'explore', 'survive'
    this.objectives = config.objectives || [];
    this.rewards = config.rewards || { xp: 0, gold: 0, items: [] };
    this.status = 'active'; // 'active', 'completed', 'failed'
    this.progress = {};
    this.timeLimit = config.timeLimit || null; // seconds, null = no limit
    this.timeRemaining = this.timeLimit;
    this.level = config.level || 1; // Recommended player level

    // Initialize progress tracking
    for (const objective of this.objectives) {
      this.progress[objective.id] = {
        current: 0,
        target: objective.target,
        completed: false,
      };
    }
  }

  /**
   * Update quest progress
   */
  updateProgress(objectiveId, amount = 1) {
    if (this.status !== 'active') return false;

    const progress = this.progress[objectiveId];
    if (!progress || progress.completed) return false;

    progress.current = Math.min(progress.current + amount, progress.target);

    if (progress.current >= progress.target) {
      progress.completed = true;
    }

    // Check if all objectives completed
    if (this.isComplete()) {
      this.status = 'completed';
      return { questCompleted: true, rewards: this.rewards };
    }

    return { updated: true, progress: progress };
  }

  /**
   * Update time-limited quest
   */
  updateTime(dt) {
    if (this.timeLimit && this.status === 'active') {
      this.timeRemaining -= dt;

      if (this.timeRemaining <= 0) {
        this.status = 'failed';
        return { questFailed: true };
      }
    }
    return null;
  }

  /**
   * Check if quest is complete
   */
  isComplete() {
    return Object.values(this.progress).every(p => p.completed);
  }

  /**
   * Get completion percentage
   */
  getCompletionPercent() {
    const total = Object.values(this.progress).reduce((sum, p) => sum + p.target, 0);
    const current = Object.values(this.progress).reduce((sum, p) => sum + p.current, 0);
    return (current / total) * 100;
  }

  /**
   * Get human-readable progress text
   */
  getProgressText() {
    const texts = [];
    for (const obj of this.objectives) {
      const progress = this.progress[obj.id];
      const status = progress.completed ? '✓' : `${progress.current}/${progress.target}`;
      texts.push(`${obj.description}: ${status}`);
    }
    return texts;
  }
}

export class QuestSystem {
  constructor() {
    this.activeQuests = [];
    this.completedQuests = [];
    this.questTemplates = this.createQuestTemplates();
    this.nextQuestId = 0;
  }

  /**
   * Create quest templates for procedural generation
   */
  createQuestTemplates() {
    return [
      // Kill quests
      {
        type: 'kill',
        titles: [
          'Skeleton Slayer',
          'Undead Hunter',
          'Bone Crusher',
          'Graveyard Cleaner',
        ],
        descriptions: [
          'Defeat {count} skeletons to prove your worth.',
          'The undead plague must be stopped. Kill {count} skeletons.',
          'Clear the graveyard of {count} skeleton warriors.',
        ],
        targets: [5, 10, 15, 20],
        rewards: { xp: [50, 100, 200, 300], gold: [25, 50, 100, 150] },
      },
      {
        type: 'kill',
        titles: [
          'Wraith Vanquisher',
          'Spirit Hunter',
          'Ghost Buster',
          'Ethereal Destroyer',
        ],
        descriptions: [
          'Banish {count} wraiths back to the void.',
          'Hunt down {count} wraiths haunting this realm.',
          'Eliminate {count} spectral threats.',
        ],
        targets: [3, 7, 12, 18],
        rewards: { xp: [75, 150, 250, 400], gold: [40, 80, 120, 200] },
      },
      {
        type: 'kill',
        titles: [
          'Golem Breaker',
          'Stone Crusher',
          'Titan Slayer',
          'Rock Destroyer',
        ],
        descriptions: [
          'Destroy {count} stone golems blocking the path.',
          'Break apart {count} ancient golems.',
          'Defeat {count} massive golem guardians.',
        ],
        targets: [2, 5, 8, 12],
        rewards: { xp: [100, 200, 350, 500], gold: [50, 100, 150, 250] },
      },

      // Collect quests
      {
        type: 'collect',
        titles: [
          'Treasure Hunter',
          'Gold Rush',
          'Wealthy Warrior',
          'Fortune Seeker',
        ],
        descriptions: [
          'Collect {count} gold from defeated enemies.',
          'Amass {count} gold pieces for your journey.',
          'Gather {count} gold to fund your expedition.',
        ],
        targets: [100, 250, 500, 1000],
        rewards: { xp: [50, 100, 200, 400], gold: [50, 100, 200, 400] },
      },

      // Survive quests
      {
        type: 'survive',
        titles: [
          'Survival Test',
          'Endurance Trial',
          'Last Stand',
          'Warrior\'s Resolve',
        ],
        descriptions: [
          'Survive for {count} seconds without dying.',
          'Prove your endurance by surviving {count} seconds.',
          'Stand your ground for {count} seconds.',
        ],
        targets: [60, 120, 180, 300],
        rewards: { xp: [100, 200, 400, 600], gold: [75, 150, 250, 400] },
      },
    ];
  }

  /**
   * Generate a random quest based on player level
   */
  generateQuest(playerLevel = 1) {
    // Select appropriate difficulty based on level
    const difficultyIndex = Math.min(Math.floor(playerLevel / 3), 3);

    // Pick random template
    const template = this.questTemplates[Math.floor(Math.random() * this.questTemplates.length)];

    const title = template.titles[Math.floor(Math.random() * template.titles.length)];
    const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    const target = template.targets[difficultyIndex];
    const xpReward = template.rewards.xp[difficultyIndex];
    const goldReward = template.rewards.gold[difficultyIndex];

    const quest = new Quest({
      id: `quest_${this.nextQuestId++}`,
      title: title,
      description: description.replace('{count}', target),
      type: template.type,
      level: playerLevel,
      objectives: [
        {
          id: 'main',
          description: template.type === 'kill' ? `Enemies defeated` :
                      template.type === 'collect' ? `Gold collected` :
                      `Time survived`,
          target: target,
        },
      ],
      rewards: {
        xp: xpReward,
        gold: goldReward,
      },
      timeLimit: template.type === 'survive' ? target : null,
    });

    return quest;
  }

  /**
   * Add a quest
   */
  addQuest(quest) {
    this.activeQuests.push(quest);
    return quest;
  }

  /**
   * Update quest progress
   */
  updateQuestProgress(type, data = {}) {
    const results = [];

    for (const quest of this.activeQuests) {
      // Kill quest tracking
      if (type === 'enemy_killed' && quest.type === 'kill') {
        const result = quest.updateProgress('main', 1);
        if (result) results.push({ quest, result });
      }

      // Collect quest tracking
      if (type === 'gold_collected' && quest.type === 'collect') {
        const result = quest.updateProgress('main', data.amount || 0);
        if (result) results.push({ quest, result });
      }

      // Survive quest tracking (updated via time)
      if (type === 'time_update' && quest.type === 'survive') {
        const timeResult = quest.updateTime(data.dt || 0);
        if (timeResult) results.push({ quest, result: timeResult });
      }
    }

    // Move completed quests
    this.activeQuests = this.activeQuests.filter(q => {
      if (q.status === 'completed') {
        this.completedQuests.push(q);
        return false;
      }
      return q.status === 'active';
    });

    return results;
  }

  /**
   * Get active quests
   */
  getActiveQuests() {
    return this.activeQuests;
  }

  /**
   * Get completed quest count
   */
  getCompletedCount() {
    return this.completedQuests.length;
  }

  /**
   * Get total XP earned from quests
   */
  getTotalQuestXP() {
    return this.completedQuests.reduce((sum, q) => sum + q.rewards.xp, 0);
  }

  /**
   * Clear all quests
   */
  clear() {
    this.activeQuests = [];
    this.completedQuests = [];
  }
}
