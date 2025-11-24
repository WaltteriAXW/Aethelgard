import React from 'react';
import './SkillBar.css';

/**
 * SkillBar - Display character skills with cooldowns
 */
export const SkillBar = ({ skills = [] }) => {
  if (skills.length === 0) return null;

  return (
    <div className="skill-bar">
      {skills.map((skill, index) => (
        <SkillSlot
          key={skill.id}
          skill={skill}
          hotkey={index + 1}
        />
      ))}
    </div>
  );
};

/**
 * SkillSlot - Individual skill display
 */
const SkillSlot = ({ skill, hotkey }) => {
  const isReady = skill.isReady();
  const cooldownPercent = skill.getCooldownPercent();
  const cooldownRemaining = Math.ceil(skill.currentCooldown);

  return (
    <div
      className={`skill-slot ${isReady ? 'ready' : 'cooldown'}`}
      title={`${skill.name} - ${skill.description}`}
    >
      {/* Skill Icon */}
      <div className="skill-icon">{skill.icon}</div>

      {/* Cooldown Overlay */}
      {!isReady && (
        <>
          <div
            className="cooldown-overlay"
            style={{ height: `${cooldownPercent}%` }}
          />
          <div className="cooldown-text">{cooldownRemaining}</div>
        </>
      )}

      {/* Hotkey */}
      <div className="skill-hotkey">{hotkey}</div>

      {/* Skill Name */}
      <div className="skill-name">{skill.name}</div>
    </div>
  );
};
