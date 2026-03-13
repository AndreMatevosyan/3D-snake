# 3D Snake Game - Snake Rendering Pipeline

## Snake Rendering Overview

The snake appears on screen through a multi-step process that starts with creating visual meshes and ends with rendering them to the canvas. This document explains each component involved and what it does.

---

## Rendering Pipeline for the Snake

### Step 1: RenderSystem - WebGL Setup

**Location:** [RenderSystem.js](src/systems/RenderSystem.js)

**Constructor Function:**
Initializes the render system by storing a reference to the HTML container and measuring its dimensions (width and height). This information is needed to create a canvas that fits the display area.

**initialize() Function:**
Creates a THREE.WebGLRenderer object, which is Three.js's interface to WebGL. This function configures the renderer with specific settings:
- Enables antialiasing for smooth edges on the snake meshes
- Enables transparency support
- Sets high precision floating-point calculations for better graphics quality
- Configures shadow mapping to enable realistic shadows on the snake
- Calculates the pixel ratio (accounts for high-DPI displays like Retina)
- Resizes the renderer to match the container dimensions
- Appends the canvas to the HTML DOM so it's visible on the page

**render() Function:**
Takes a Three.js scene and camera as parameters. This is the core rendering function that tells WebGL to draw the current frame. It performs the actual GPU rendering of all objects (including the snake) to the canvas using the specified camera perspective.

### Step 2: GameScene - Scene & Lighting Setup

**Location:** [GameScene.js](src/scenes/GameScene.js)

**Constructor Function:**
Creates a container for all game objects and sets up the Three.js Scene. It initializes empty light storage and prepares to track dynamic objects.

**initialize() Function:**
Sets up the Three.js scene by calling three setup functions: background color, fog effect, and all lighting.

**setupBackground() Function:**
Sets the background color of the scene (dark blue: 0x1a1a2e). This is what you see behind the snake when it moves around.

**setupFog() Function:**
Creates a fog effect that gradually hides objects as they get farther away. This makes distant walls fade to the background color, creating depth perception and improving performance by not rendering distant objects that would be hidden anyway.

**setupLighting() Function:**
Configures four different light sources that illuminate the snake and scene:

1. **Ambient Light** - Provides base illumination everywhere. Without this, the scene would be completely dark. It bounces equally in all directions.

2. **Directional Light** - Acts like a sun, providing strong directional shadows. This is the main light source. It's positioned to create dramatic shadows on the snake that help define its shape.

3. **Fill Light** - A secondary directional light positioned below and to the front. It softens harsh shadows and fills in the dark areas created by the main directional light, preventing completely black areas.

4. **Point Light** - Positioned above the play area like an ambient glow. Provides subtle colored lighting (blue tint) from above, adding environmental interest and helping visibility.

The shadow mapping configuration determines shadow quality:
- Higher resolution shadow maps = sharper, more detailed shadows
- More memory and processing power required
- Positioned to cover the play area where the snake moves

### Step 3: Snake Mesh Creation

**Location:** [Snake.js](src/entities/Snake.js)

**Constructor Function:**
Initializes the snake's data structure. Stores starting position, initial direction (forward along Z-axis), and velocity. Creates empty arrays to hold segment meshes and their positions. Also creates a THREE.Group, which is a container that holds all the sphere meshes together so they can be moved and added to the scene as one unit.

**initialize() Function:**
This is the critical function that creates the visible snake on screen:

1. Loops through the initial length (3 segments by default)
2. For each segment, calculates its position backward from the head
3. Creates a sphere geometry for that segment (a sphere with 16 horizontal segments and 12 vertical segments for smoothness)
4. Creates a material (the surface properties) - bright green for the head, darker green for the body
5. Combines the geometry and material into a mesh (the actual 3D object)
6. Enables shadow casting and shadow receiving on each mesh so lighting affects it correctly
7. Positions each mesh at its calculated segment position
8. Adds each mesh to the THREE.Group container

The result is a group containing 3 interconnected sphere meshes: a brighter head and 2 darker body segments arranged in a line.

**getGroup() Function:**
Returns the THREE.Group container holding all snake meshes. This group is later added to the Three.js scene so everything the group contains gets rendered.

### Step 4: Add Snake Group to Scene

**Location:** [Game.js](Game.js)

**initialize() Function (in Game class):**
Creates the snake instance by calling its constructor with a starting position. Then calls the snake's initialize() function to create all its meshes. Finally, calls the game scene's addObject() function, passing the snake's group.

**addObject() Function (in GameScene class):**
Takes the snake's THREE.Group and adds it to the Three.js scene. This makes everything inside the group (all the sphere meshes) part of the renderable scene. The Three.js renderer will now know about these meshes and will include them when rendering frames.

After this step, the scene now contains:
- All lighting (ambient, directional, fill, point lights)
- The cube (walls)
- The snake group with all its sphere meshes (head + body segments)

### Step 5: Camera Setup

**Location:** [Game.js](Game.js)

**PerspectiveCamera Creation:**
Creates a Three.js camera using configuration values. The camera defines what the player sees - the field of view (how wide or narrow the view is), aspect ratio (width to height), near plane (closest visible distance), and far plane (farthest visible distance). Anything closer than near or farther than far won't be rendered.

**Location:** [CameraController.js](src/camera/CameraController.js)

**update() Function:**
Called every frame to position the camera behind the snake's head. Uses smooth interpolation (lerp) so the camera follows smoothly rather than snapping. The camera's lookAt direction is set to point at the snake's head, creating the following camera effect.

### Step 6: Update Snake Position Each Frame

**Location:** [Game.js](Game.js)

**gameLoop() Function:**
The main game loop runs approximately 60 times per second (requestAnimationFrame). For the snake rendering, it:
1. Calculates delta time (time elapsed since last frame)
2. Calls the snake's update() function, passing the delta time and player input

**Location:** [Snake.js](src/entities/Snake.js)

**update() Function:**
Receives the player's rotation input and delta time. Updates the snake's direction based on player input, then calls the move() function.

**updateDirection() Function:**
Converts the player's yaw and pitch angles into a normalized 3D direction vector. This determines which direction the snake's head will move toward.

**move() Function:**
The most critical function for rendering the snake each frame:
1. Calculates the distance the snake should move this frame (velocity × deltaTime)
2. Moves the head to its new position in the calculated direction
3. Updates all body segments using a constraint-based algorithm: each segment moves to maintain a fixed distance from the segment ahead of it
4. Updates the position of each mesh object to match its corresponding segment position

This is why the snake appears to move smoothly - every mesh gets repositioned each frame based on the updated segment positions.

### Step 7: Final Rendering to Canvas

**Location:** [Game.js](Game.js)

**gameLoop() - Render Call:**
After updating the snake's position, the gameLoop calls renderSystem.render(), passing the scene and camera.

**Location:** [RenderSystem.js](src/systems/RenderSystem.js)

**render() Function:**
The final step in the rendering pipeline. This function:
1. Takes the Three.js scene containing all objects (lights, snake meshes, walls, apple)
2. Uses the camera perspective to determine what should be visible
3. Calculates lighting effects on each mesh (the 4 lights affect the snake meshes)
4. Calculates shadows cast by the directional light
5. Sends GPU commands to render all visible meshes with their materials applied
6. Displays the final image on the HTML canvas

**What appears on screen:**
- The snake (head and body segments) with the updated positions from this frame
- Lighting and shadows applied based on the 4 light sources
- Camera view positioned behind the snake's head
- Background color and fog effects
- The cube walls and apple

---

## Complete Rendering Flow Summary

**Initialization (happens once at game start):**
1. RenderSystem creates WebGL canvas and WebGL renderer
2. GameScene creates Three.js scene and sets up 4 lights
3. Snake creates sphere meshes (head + body segments) in a group
4. Snake group added to scene
5. Camera created and positioned

**Each Frame (runs ~60 times per second):**
1. Game loop calculates delta time
2. Snake.update() receives player input
3. Snake.move() repositions all meshes
4. Camera.update() reposition camera to follow snake
5. RenderSystem.render() draws everything to canvas

**Result:** The player sees a smooth, continuously updating 3D view of the snake moving through the scene with realistic lighting and shadows.
