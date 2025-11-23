import { useGameStore } from '../../game/stores/useGameStore';
import './HUD.css';

/**
 * HUD - Heads-Up Display
 * React UI overlay that shows player stats
 * This demonstrates the power of separating UI from Game Logic
 */
export const HUD = () => {
  const player = useGameStore(state => state.player);
  const lighting = useGameStore(state => state.lighting);
  const toggleDarkness = useGameStore(state => state.toggleDarkness);
  const updateLighting = useGameStore(state => state.updateLighting);

  const hpPercent = (player.hp / player.maxHp) * 100;
  const xpPercent = (player.xp / (player.level * 100)) * 100;

  return (
    <div className="hud">
      {/* Top Left - Player Stats */}
      <div className="hud-section top-left">
        <div className="stat-row">
          <div className="stat-label">HP</div>
          <div className="bar-container">
            <div
              className="bar-fill hp-bar"
              style={{ width: `${hpPercent}%` }}
            />
            <div className="bar-text">{player.hp} / {player.maxHp}</div>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-label">MANA</div>
          <div className="bar-container">
            <div
              className="bar-fill mana-bar"
              style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
            />
            <div className="bar-text">{player.mana} / {player.maxMana}</div>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-label">XP</div>
          <div className="bar-container">
            <div
              className="bar-fill xp-bar"
              style={{ width: `${xpPercent}%` }}
            />
            <div className="bar-text">Level {player.level}</div>
          </div>
        </div>
      </div>

      {/* Top Right - Controls & Debug */}
      <div className="hud-section top-right">
        <div className="controls-info">
          <div className="control-hint">WASD - Move</div>
          <div className="control-hint">SPACE - Attack</div>
          <div className="control-hint">SHIFT - Dash</div>
          <div className="control-hint">L - Toggle Lighting</div>
        </div>

        <div className="debug-panel">
          <div className="debug-title">🔧 Visibility Settings</div>
          <button
            onClick={toggleDarkness}
            className="debug-button"
          >
            Darkness: {lighting.enabled ? 'ON' : 'OFF'}
          </button>

          <label className="slider-label">
            Darkness Opacity: {lighting.darknessOpacity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={lighting.darknessOpacity}
              onChange={(e) => updateLighting({ darknessOpacity: parseFloat(e.target.value) })}
            />
          </label>

          <label className="slider-label">
            Vision Radius: {lighting.visionRadius}px
            <input
              type="range"
              min="100"
              max="600"
              step="50"
              value={lighting.visionRadius}
              onChange={(e) => updateLighting({ visionRadius: parseInt(e.target.value) })}
            />
          </label>

          <label className="slider-label">
            Light Falloff: {lighting.lightFalloff.toFixed(2)}
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={lighting.lightFalloff}
              onChange={(e) => updateLighting({ lightFalloff: parseFloat(e.target.value) })}
            />
          </label>
        </div>
      </div>

      {/* Bottom Center - Class Display */}
      <div className="hud-section bottom-center">
        <div className="class-display">{player.class}</div>
      </div>
    </div>
  );
};
