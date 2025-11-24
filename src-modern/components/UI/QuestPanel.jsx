import React, { useState } from 'react';
import './QuestPanel.css';

/**
 * QuestPanel - Shows active quests, achievements, and progression
 */
export const QuestPanel = ({ quests = [], achievements = [], onSelectTab }) => {
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' or 'achievements'
  const [minimized, setMinimized] = useState(false);

  const activeQuests = quests.filter(q => q.status === 'active');
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.length;
  const completionPercent = achievements.length > 0
    ? (unlockedAchievements.length / totalAchievements * 100).toFixed(0)
    : 0;

  if (minimized) {
    return (
      <div className="quest-panel minimized">
        <button
          className="expand-button"
          onClick={() => setMinimized(false)}
          title="Show Quests & Achievements"
        >
          📜 {activeQuests.length} | 🏆 {unlockedAchievements.length}/{totalAchievements}
        </button>
      </div>
    );
  }

  return (
    <div className="quest-panel">
      <div className="quest-panel-header">
        <div className="quest-tabs">
          <button
            className={`quest-tab ${activeTab === 'quests' ? 'active' : ''}`}
            onClick={() => setActiveTab('quests')}
          >
            📜 Quests ({activeQuests.length})
          </button>
          <button
            className={`quest-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements ({completionPercent}%)
          </button>
        </div>
        <button
          className="minimize-button"
          onClick={() => setMinimized(true)}
          title="Minimize"
        >
          ─
        </button>
      </div>

      <div className="quest-panel-content">
        {activeTab === 'quests' ? (
          <QuestList quests={activeQuests} />
        ) : (
          <AchievementList achievements={achievements} />
        )}
      </div>
    </div>
  );
};

/**
 * QuestList - Display active quests
 */
const QuestList = ({ quests }) => {
  if (quests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📜</div>
        <div className="empty-text">No active quests</div>
        <div className="empty-hint">Complete enemies to unlock quests!</div>
      </div>
    );
  }

  return (
    <div className="quest-list">
      {quests.map(quest => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </div>
  );
};

/**
 * QuestCard - Individual quest display
 */
const QuestCard = ({ quest }) => {
  const completionPercent = quest.getCompletionPercent();
  const progressTexts = quest.getProgressText();

  return (
    <div className="quest-card">
      <div className="quest-header">
        <div className="quest-title">{quest.title}</div>
        <div className="quest-level">Lv.{quest.level}</div>
      </div>

      <div className="quest-description">{quest.description}</div>

      <div className="quest-objectives">
        {progressTexts.map((text, i) => (
          <div key={i} className="quest-objective">
            {text}
          </div>
        ))}
      </div>

      <div className="quest-progress-bar">
        <div
          className="quest-progress-fill"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <div className="quest-rewards">
        <div className="reward">⭐ {quest.rewards.xp} XP</div>
        <div className="reward">💰 {quest.rewards.gold} Gold</div>
      </div>

      {quest.timeRemaining !== null && (
        <div className="quest-timer">
          ⏱️ {Math.ceil(quest.timeRemaining)}s remaining
        </div>
      )}
    </div>
  );
};

/**
 * AchievementList - Display achievements
 */
const AchievementList = ({ achievements }) => {
  const rarityOrder = ['legendary', 'epic', 'rare', 'common'];
  const sortedAchievements = [...achievements].sort((a, b) => {
    // Sort by: unlocked first, then by rarity, then by progress
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    if (rarityDiff !== 0) return rarityDiff;
    return b.getPercentage() - a.getPercentage();
  });

  return (
    <div className="achievement-list">
      {sortedAchievements.map(achievement => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
};

/**
 * AchievementCard - Individual achievement display
 */
const AchievementCard = ({ achievement }) => {
  const percent = achievement.getPercentage();
  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };

  return (
    <div
      className={`achievement-card ${achievement.unlocked ? 'unlocked' : ''} ${achievement.rarity}`}
      style={{ borderColor: rarityColors[achievement.rarity] }}
    >
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-details">
        <div className="achievement-title">
          {achievement.getDisplayTitle()}
          {achievement.unlocked && <span className="unlock-check">✓</span>}
        </div>
        <div className="achievement-description">
          {achievement.getDisplayDescription()}
        </div>
        {!achievement.unlocked && (
          <div className="achievement-progress">
            <div className="achievement-progress-bar">
              <div
                className="achievement-progress-fill"
                style={{
                  width: `${percent}%`,
                  backgroundColor: rarityColors[achievement.rarity]
                }}
              />
            </div>
            <div className="achievement-progress-text">
              {achievement.progress}/{achievement.requirement.target} ({percent.toFixed(0)}%)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
