# 🗡️ Aethelgard: Daybreak Edition

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)

A retro-styled browser-based RPG featuring procedural generation, combo combat system, and dynamic lighting. Built with vanilla JavaScript and HTML5 Canvas.

## ✨ Features

- **🗺️ Advanced Procedural Generation**: Organic cave-like dungeons using SimplexNoise and cellular automata
- **⚔️ Combo Combat System**: Chain attacks together for up to 3x damage multiplier
- **💨 Dash Mechanic**: Quick dodge with invulnerability frames
- **👾 Multiple Enemy Types**:
  - **Skeletons** - Balanced enemies
  - **Wraiths** - Fast, low HP, dash attacks
  - **Golems** - Slow, tanky, heavy damage
- **🗺️ Real-Time Minimap**: Track enemies and navigate the ruins
- **🌅 Dynamic Lighting**: Beautiful dusk-style illumination system with radial gradients
- **🎵 Procedural Audio**: All sound effects generated in real-time using Web Audio API
- **📱 Mobile Support**: Full touch controls for mobile and tablet devices
- **💾 PWA Support**: Install as an app, works offline
- **🎮 Retro Aesthetics**: Hand-crafted pixel art sprites with nostalgic feel

## 🎮 How to Play

### Controls

**Keyboard:**
- **WASD** or **Arrow Keys**: Move your character
- **SPACE**: Attack
- **SHIFT**: Dash (requires movement input)

**Mobile:**
- **D-Pad**: Movement controls
- **ATK Button**: Attack
- **DASH Button**: Dash ability

### Gameplay

1. Explore the procedurally generated ruins with the minimap
2. Battle three types of enemies - Skeletons, Wraiths, and Golems
3. Collect experience orbs to level up and grow stronger
4. Complete the quest: Purge the Ruins (defeat 10 enemies)
5. Master the combo system for up to 3x damage
6. Use the minimap to track remaining enemies

### Combat Tips

- **Combo System**: Build up combos by attacking consecutively (up to 3x damage multiplier)
- **Finishing Blow**: The third hit in a combo deals massive damage with a special effect
- **Dash Invincibility**: You're invulnerable during dash - use it to avoid attacks
- **Enemy Strategies**:
  - **Wraiths**: Fast and aggressive - bait their dash then counterattack
  - **Golems**: Slow but deadly - keep your distance and use hit-and-run tactics
  - **Skeletons**: Balanced enemies - perfect for practicing combos
- **Minimap Awareness**: Check the minimap to avoid being surrounded

## 🚀 Getting Started

### Play Online

Visit the [live demo](#) to play immediately in your browser!

### Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Aethelgard.git
   cd Aethelgard
   ```

2. Serve the files using a local web server:

   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server
   ```

   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

> **Note:** The game must be served through a web server due to ES6 module imports. Simply opening `index.html` directly won't work.

## 📁 Project Structure

```
Aethelgard/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
├── README.md               # Project documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── LICENSE                 # MIT License
├── .gitignore             # Git ignore rules
├── src/
│   ├── css/
│   │   └── style.css      # All game styles
│   └── js/
│       ├── config.js       # Game configuration
│       ├── audio.js        # Procedural audio system
│       ├── graphics.js     # Sprite generation
│       ├── input.js        # Input handling (keyboard + touch)
│       ├── map.js          # Advanced map generation
│       ├── simplex-noise.js # Noise generation library
│       ├── quest.js        # Quest system
│       ├── game.js         # Main game loop & minimap
│       ├── entities/
│       │   ├── entity.js   # Base entity class
│       │   ├── player.js   # Player character
│       │   ├── enemy.js    # Base enemy (Skeleton)
│       │   ├── wraith.js   # Fast enemy type
│       │   ├── golem.js    # Tank enemy type
│       │   └── loot.js     # Collectibles
│       └── particles/
│           └── particles.js # Visual effects
```

## 🛠️ Technical Details

### Technologies Used

- **HTML5 Canvas**: Rendering engine
- **ES6 JavaScript**: Game logic and modules
- **Web Audio API**: Procedural sound generation
- **CSS3**: UI styling and animations

### Key Systems

#### Map Generation
Advanced multi-phase procedural generation:
- **SimplexNoise**: Creates organic base terrain with octave layering
- **Cellular Automata**: Smooths caves for natural appearance
- **Room Carving**: Adds structured areas for variety
- **Flood Fill**: Removes isolated regions, ensures connectivity
- **Wall Generation**: Automatic wall placement around walkable areas

#### Combat System
- Hit detection using distance-based collision
- Combo tracking with timeout reset
- Knockback and hit-stop effects for satisfying feedback

#### Lighting Engine
- Dual-canvas rendering for lighting effects
- Radial gradient-based light sources
- Dusk atmosphere with 35% opacity overlay

#### Audio Engine
- Real-time synthesis using Web Audio API
- Multiple oscillator types (sine, square, sawtooth, triangle)
- Frequency modulation for dynamic effects

## 🎨 Customization

### Adjusting Game Settings

Edit `src/js/config.js` to customize:

```javascript
export const CFG = {
    TILE: 48,                      // Tile size
    PLAYER_SPEED: 220,             // Movement speed
    ENEMY_COUNT: 20,               // Number of enemies
    LIGHT_OPACITY: 0.35,           // Lighting intensity
    // ... and more
};
```

### Modifying Sprites

Sprites are defined as pixel art arrays in `src/js/graphics.js`. Each character represents a color from the palette:

```javascript
hero: [
    '.....aaaa.......',
    '....aaaaaa......',
    // ... more rows
]
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Ideas for Contributions

- New enemy types
- Additional power-ups or abilities
- Boss battles
- Save/load system
- Leaderboards
- More procedural generation algorithms
- Sound/music toggle
- Difficulty settings

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic roguelike games
- Pixel art aesthetic influenced by 8-bit and 16-bit era games
- Font: "Press Start 2P" by CodeMan38

## 🐛 Known Issues

- Mobile performance may vary on older devices
- Some browsers may require user interaction before audio plays
- Best experienced on desktop Chrome/Firefox

## 📞 Contact

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Issues: [Report a bug](https://github.com/YOUR_USERNAME/Aethelgard/issues)

---

**Enjoy your adventure in Aethelgard!** ⚔️🌅
