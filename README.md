# 🗡️ Aethelgard: Daybreak Edition

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)

A retro-styled browser-based RPG featuring procedural generation, combo combat system, and dynamic lighting. Built with vanilla JavaScript and HTML5 Canvas.

## ✨ Features

- **🗺️ Procedural Map Generation**: Every playthrough features a unique dungeon layout using the drunkard's walk algorithm
- **⚔️ Combo Combat System**: Chain attacks together for increased damage
- **💨 Dash Mechanic**: Quick dodge and repositioning ability
- **🌅 Dynamic Lighting**: Beautiful dusk-style illumination system
- **🎵 Procedural Audio**: All sound effects generated in real-time using Web Audio API
- **📱 Mobile Support**: Touch controls for mobile and tablet devices
- **🎮 Retro Aesthetics**: Pixel art graphics with a nostalgic feel

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

1. Explore the procedurally generated ruins
2. Defeat skeleton enemies using your combat abilities
3. Collect experience orbs to level up
4. Complete the quest: Purge the Ruins (defeat 10 enemies)
5. Master the combo system for maximum damage

### Combat Tips

- Build up combos by attacking consecutively (up to 3x combo)
- The third hit in a combo deals bonus damage and has a special effect
- Use dash to avoid enemy attacks (you're invulnerable while dashing)
- Combine dash with attacks for tactical positioning

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
├── README.md               # Project documentation
├── LICENSE                 # MIT License
├── .gitignore             # Git ignore rules
├── src/
│   ├── css/
│   │   └── style.css      # All game styles
│   └── js/
│       ├── config.js       # Game configuration
│       ├── audio.js        # Audio system
│       ├── graphics.js     # Sprite generation
│       ├── input.js        # Input handling
│       ├── map.js          # Map generation
│       ├── quest.js        # Quest system
│       ├── game.js         # Main game loop
│       ├── entities/
│       │   ├── entity.js   # Base entity class
│       │   ├── player.js   # Player character
│       │   ├── enemy.js    # Enemy AI
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
Uses a drunkard's walk algorithm to create organic, cave-like dungeons:
- Randomly walks through a grid creating floor tiles
- Automatically generates walls around floor areas
- Ensures playable, connected spaces

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
