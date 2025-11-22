# Contributing to Aethelgard

Thank you for your interest in contributing to Aethelgard! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing opinions and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/YOUR_USERNAME/Aethelgard/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Browser/OS information
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues to avoid duplicates
2. Create a new issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives you've considered
   - How it benefits other users

### Code Contributions

#### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Aethelgard.git
   cd Aethelgard
   ```
3. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

**Code Style:**
- Use ES6+ JavaScript features
- Use meaningful variable and function names
- Add JSDoc comments for functions and classes
- Keep functions focused and small
- Use const/let instead of var

**File Organization:**
- Place entity classes in `src/js/entities/`
- Place visual effects in `src/js/particles/`
- Keep game systems modular and loosely coupled
- Import only what you need

**Example Code Style:**
```javascript
/**
 * Calculate damage with level scaling
 * @param {number} baseDamage - Base damage amount
 * @param {number} level - Character level
 * @returns {number} Total damage
 */
function calculateDamage(baseDamage, level) {
    return baseDamage + (level * CFG.LEVEL_DAMAGE_BONUS);
}
```

#### Testing

Before submitting:
1. Test your changes in multiple browsers (Chrome, Firefox, Safari)
2. Test on mobile if UI changes are involved
3. Verify no console errors
4. Check that the game still runs smoothly

#### Committing

1. Make atomic commits (one logical change per commit)
2. Write clear commit messages:
   ```
   Add dash cooldown indicator

   - Add visual cooldown timer for dash ability
   - Update UI to show when dash is available
   - Fix dash spam exploit
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request:
   - Describe what your PR does
   - Reference any related issues
   - Include screenshots for visual changes
   - List any breaking changes

## Project Architecture

### Core Systems

- **Game Loop** (`game.js`): Main update/render loop
- **Input** (`input.js`): Keyboard and touch input handling
- **Map** (`map.js`): Procedural generation and rendering
- **Audio** (`audio.js`): Sound effect generation
- **Graphics** (`graphics.js`): Sprite management

### Entity System

All game objects extend the base `Entity` class:
- `Player`: Player-controlled character
- `Enemy`: AI-controlled enemies
- `Loot`: Collectible items

### Adding a New Entity Type

```javascript
import { Entity } from './entity.js';

export class NewEntity extends Entity {
    constructor(x, y) {
        super(x, y, 'sprite_key');
        // Your custom properties
    }

    update(dt) {
        // Your update logic
        super.update(dt);
    }
}
```

## Feature Ideas

Looking for something to work on? Try these:

- [ ] Add new enemy types with different behaviors
- [ ] Implement power-ups (speed boost, damage boost, etc.)
- [ ] Add boss encounters
- [ ] Create different biomes/themes
- [ ] Add save/load functionality
- [ ] Implement a minimap
- [ ] Add particle effect variety
- [ ] Create different weapons/abilities
- [ ] Add sound/music toggle in settings
- [ ] Implement achievements system

## Questions?

Feel free to:
- Open an issue for discussion
- Reach out to maintainers
- Check existing documentation

Thank you for contributing! 🎮⚔️
