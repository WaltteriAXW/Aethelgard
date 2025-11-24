import React from 'react';
import './Menu.css';

/**
 * MainMenu - Character selection and game start
 */
export const MainMenu = ({ onStartGame }) => {
  const [selectedClass, setSelectedClass] = React.useState('warrior');

  const classes = [
    {
      id: 'warrior',
      name: 'Warrior',
      icon: '⚔️',
      description: 'Strong melee fighter with high HP',
      stats: { hp: 120, damage: 30, speed: 100 },
    },
    {
      id: 'rogue',
      name: 'Rogue',
      icon: '🗡️',
      description: 'Fast assassin with critical strikes',
      stats: { hp: 80, damage: 25, speed: 150 },
    },
    {
      id: 'mage',
      name: 'Mage',
      icon: '🔮',
      description: 'Powerful spellcaster with magic',
      stats: { hp: 70, damage: 40, speed: 90 },
    },
  ];

  const selectedClassData = classes.find(c => c.id === selectedClass);

  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1 className="game-title">⚔️ AETHELGARD ⚔️</h1>
        <p className="game-subtitle">Dungeon Crawler RPG</p>

        <div className="character-selection">
          <h2>Choose Your Hero</h2>

          <div className="class-grid">
            {classes.map(cls => (
              <div
                key={cls.id}
                className={`class-card ${selectedClass === cls.id ? 'selected' : ''}`}
                onClick={() => setSelectedClass(cls.id)}
              >
                <div className="class-icon">{cls.icon}</div>
                <div className="class-name">{cls.name}</div>
                <div className="class-description">{cls.description}</div>

                <div className="class-stats">
                  <div className="stat">❤️ HP: {cls.stats.hp}</div>
                  <div className="stat">⚔️ DMG: {cls.stats.damage}</div>
                  <div className="stat">⚡ SPD: {cls.stats.speed}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="start-button"
          onClick={() => onStartGame(selectedClassData)}
        >
          Start Adventure
        </button>

        <div className="menu-controls">
          <div className="control-item">WASD - Move</div>
          <div className="control-item">SPACE/J - Attack</div>
          <div className="control-item">E - Interact</div>
        </div>
      </div>
    </div>
  );
};

/**
 * GameOverScreen - Death screen with stats
 */
export const GameOverScreen = ({ stats, onRestart, onMenu }) => {
  return (
    <div className="menu-container game-over">
      <div className="menu-content">
        <h1 className="game-over-title">💀 YOU DIED 💀</h1>

        <div className="death-stats">
          <h3>Your Journey</h3>
          <div className="stat-row">
            <span>Enemies Defeated:</span>
            <span className="stat-value">{stats.kills || 0}</span>
          </div>
          <div className="stat-row">
            <span>Gold Collected:</span>
            <span className="stat-value">{stats.gold || 0}</span>
          </div>
          <div className="stat-row">
            <span>Quests Completed:</span>
            <span className="stat-value">{stats.questsCompleted || 0}</span>
          </div>
          <div className="stat-row">
            <span>Survival Time:</span>
            <span className="stat-value">{Math.floor(stats.surviveTime || 0)}s</span>
          </div>
          <div className="stat-row">
            <span>Level Reached:</span>
            <span className="stat-value">{stats.level || 1}</span>
          </div>
        </div>

        <div className="death-buttons">
          <button className="restart-button" onClick={onRestart}>
            ⚔️ Try Again
          </button>
          <button className="menu-button" onClick={onMenu}>
            📜 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * PauseMenu - In-game pause screen
 */
export const PauseMenu = ({ onResume, onMenu }) => {
  return (
    <div className="menu-container pause-menu">
      <div className="menu-content">
        <h1 className="pause-title">⏸️ PAUSED</h1>

        <div className="pause-buttons">
          <button className="resume-button" onClick={onResume}>
            ▶️ Resume
          </button>
          <button className="menu-button" onClick={onMenu}>
            📜 Main Menu
          </button>
        </div>

        <div className="pause-controls">
          <h3>Controls</h3>
          <div className="control-item">WASD - Move</div>
          <div className="control-item">SPACE/J - Attack</div>
          <div className="control-item">E - Pickup Loot</div>
          <div className="control-item">ESC - Pause</div>
        </div>
      </div>
    </div>
  );
};
