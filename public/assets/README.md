# 🎨 Graphics Assets Folder

Upload your high-quality graphics here for AAA-level visuals!

## 📁 Folder Structure

### `/sprites/` - Character & Enemy Sprites
Upload sprite sheets or individual sprites:
- `hero.png` - Player character sprite (recommended: 64x64 or 128x128)
- `hero_idle.png` - Idle animation frames
- `hero_walk.png` - Walking animation frames
- `hero_attack.png` - Attack animation frames
- `skeleton.png` - Skeleton enemy sprite
- `wraith.png` - Wraith enemy sprite
- `golem.png` - Golem enemy sprite

**Recommended Format:**
- PNG with transparency
- 64x64, 128x128, or 256x256 pixels
- Sprite sheets can be horizontal or vertical
- Include multiple frames for smooth animation

### `/effects/` - Visual Effects
Upload particle and effect images:
- `slash.png` - Slash attack effect
- `hit.png` - Hit impact effect
- `blood.png` - Blood particle
- `sparkle.png` - Gold/magic sparkle
- `explosion.png` - Death explosion frames
- `smoke.png` - Smoke particle
- `fire.png` - Fire particle

**Recommended Format:**
- PNG with transparency
- 32x32 or 64x64 pixels
- Bright, high-contrast colors
- Can be animated sprite sheets

### `/tiles/` - Map Tiles & Environment
Upload tileset images:
- `floor.png` - Floor tile texture
- `wall.png` - Wall tile texture
- `floor_tileset.png` - Multiple floor variations
- `wall_tileset.png` - Multiple wall variations
- `decorations.png` - Props and decorations

**Recommended Format:**
- PNG format
- 48x48 pixels (match game tile size)
- Can be tilesheets with multiple tiles

### `/ui/` - User Interface Graphics
Upload UI elements:
- `health_bar.png` - Health bar graphic
- `gold_icon.png` - Gold coin icon
- `button.png` - Button background
- `frame.png` - UI frame/border

**Recommended Format:**
- PNG with transparency
- Various sizes depending on element
- High contrast for visibility

## 🎨 Image Requirements

### Quality Guidelines:
- **Resolution**: Higher is better (64x64 minimum, 256x256 ideal)
- **Format**: PNG with transparency (alpha channel)
- **Color**: Vibrant, high-contrast colors
- **Style**: Consistent art style across all assets
- **Optimization**: Keep file sizes reasonable (< 1MB per image)

### Animation Sprite Sheets:
If using sprite sheets, organize frames like this:
```
[Frame 1][Frame 2][Frame 3][Frame 4]
```
Or vertically:
```
[Frame 1]
[Frame 2]
[Frame 3]
[Frame 4]
```

The system will automatically detect and parse sprite sheets!

## 🚀 How to Use

1. **Upload your images** to the appropriate folders
2. The game will **automatically detect** and load them
3. **Fallback**: If no image is found, ASCII art sprites are used
4. **Hot reload**: Changes apply on page refresh

## 💡 Pro Tips

- Use **power-of-two dimensions** (64, 128, 256) for best performance
- Include **multiple animation frames** for smoother movement
- Use **bright, vibrant colors** for visual impact
- Add **glowing effects** in your sprites for extra polish
- Keep **consistent resolution** across all sprites
- Export with **no background** (transparent PNG)

## 🎮 Example Assets

You can find free game assets at:
- OpenGameArt.org
- Itch.io (game assets)
- Kenney.nl (free game assets)
- CraftPix.net

Or create your own using:
- Aseprite (pixel art)
- GIMP/Photoshop
- Piskel (online pixel art tool)

Upload your assets and watch your game transform into AAA quality! 🌟
