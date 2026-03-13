# 🐍 3D Snake - Three.js Game

A browser-based 3D arcade game where you control a snake trapped inside a transparent cube. Fly freely in 3D space, eat apples to grow, and escape the cube to advance to the next level.

## Project Structure

```
3D-snake/
├── index.html                 # Main HTML file
├── styles/
│   └── style.css              # Game styling
├── src/
│   ├── main.js                # Entry point
│   ├── Game.js                # Main game controller
│   ├── config.js              # Game configuration constants
│   ├── camera/
│   │   └── CameraController.js    # Third-person camera system
│   ├── input/
│   │   └── InputController.js     # Mouse/keyboard input handling
│   ├── entities/
│   │   ├── Snake.js           # Snake entity
│   │   ├── Apple.js           # Apple entity
│   │   └── Cube.js            # Containment cube
│   ├── scenes/
│   │   └── GameScene.js       # Three.js scene setup
│   ├── systems/
│   │   ├── CollisionSystem.js     # Collision detection
│   │   ├── LevelSystem.js         # Level progression
│   │   └── RenderSystem.js        # Rendering system
│   └── utils/
│       └── helpers.js         # Utility functions
├── assets/                    # Game assets (future)
└── README.md                  # This file
```

## Features (To Implement)

### Core Gameplay
- ✅ Base file structure created
- ✅ 3D snake movement and rendering
- ✅ Mouse-controlled steering (pitch + yaw)
- ✅ Continuous forward movement
- ✅ Apple spawning and collection
- ✅ Snake growth system

### Camera System
- ✅ Third-person follow camera
- ✅ Smooth lerp-based tracking
- ⬜ Camera shake effects

### Collision Detection
- ✅ Snake-apple collision
- ✅ Snake-self collision
- ✅ Snake-wall collision

### Level System
- ✅ Progressive difficulty scaling
- ⬜ Cube breaking effects
- ✅ Speed and size progression

## Technologies Used

- **Three.js** - 3D graphics library
- **WebGL** - Rendering via Three.js
- **JavaScript (ES6 Modules)** - Game logic
- **HTML5 Canvas** - Display surface

## Getting Started

1. Open `index.html` in a modern web browser
2. The game will automatically initialize
3. Use mouse movement to steer the snake
4. Collect apples to grow and escape the cube

## Configuration

Game settings can be modified in `src/config.js`:
- Snake speed and growth
- Camera follow distance
- Collision parameters
- Level difficulty settings
- Visual parameters

## Notes

- All base files are created with TODO comments for implementation
- No game logic is implemented yet - files are structure only
- Uses Three.js from CDN via importmap
- Responsive design for different screen sizes

## Future Enhancements

- Sound effects and background music
- Particle effects for apple collection and cube breaking
- Power-ups and special items
- Leaderboard system
- Mobile controls support
