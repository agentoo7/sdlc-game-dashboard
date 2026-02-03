# Technical Research: Phaser.js for 2.5D Isometric Dashboard

**Date:** 2026-02-03
**Project:** SDLC Game Dashboard
**Focus:** Game engine selection for 2.5D isometric visualization

---

## Executive Summary

**Recommendation:** Use **Phaser 3.x** for the SDLC Game Dashboard project.

Phaser 3 provides native isometric tilemap support (since v3.50.0), comprehensive animation/tween systems, and is ideal for rapid game development. For a visualization dashboard with game-like aesthetics, Phaser offers the best balance of features, documentation, and development speed.

---

## Phaser.js Overview

### What is Phaser?

Phaser is a fast, free, and fun open-source HTML5 game framework for creating 2D games for desktop and mobile web browsers. It supports both Canvas and WebGL rendering.

### Key Capabilities for Our Project

| Feature | Phaser Support | Relevance to Dashboard |
|---------|----------------|------------------------|
| **Isometric Tilemaps** | Native (since v3.50.0) | Office floor layout |
| **Sprite Animation** | Built-in | Agent idle/walk/work animations |
| **Tweening** | Comprehensive | Smooth movement, transitions |
| **PathFollower** | Built-in | Agent walking paths |
| **Camera System** | Full control | Zoom, pan, follow mode |
| **Input Handling** | Mouse, touch, keyboard | Click agents, drag to pan |
| **Scene Management** | Built-in | Multiple views/states |

---

## Isometric Support in Phaser 3

### Native Tilemap Types (v3.50.0+)

Phaser 3 now supports 4 tilemap types:
1. **Orthogonal** (standard top-down)
2. **Isometric** ✅ (our choice)
3. **Hexagonal**
4. **Staggered**

### Key Isometric APIs

```javascript
// Convert world coordinates to isometric tile coordinates
Phaser.Tilemaps.Components.IsometricWorldToTileXY(
  worldX, worldY, snapToFloor, point, camera, layer, originTop
)

// Convert isometric tile to world coordinates
Phaser.Tilemaps.Components.IsometricTileToWorldXY(
  tileX, tileY, point, camera, layer
)
```

### Integration with Tiled

- Use [Tiled Map Editor](https://www.mapeditor.org/) (free) to design isometric office layouts
- Export as JSON, import directly into Phaser
- Supports multiple layers (floor, furniture, agents)

---

## Animation & Movement System

### Tween System

Perfect for smooth agent movement:

```javascript
// Move agent from current position to target
this.tweens.add({
  targets: agent,
  x: targetX,
  y: targetY,
  duration: 1000,
  ease: 'Power2.easeInOut',
  onComplete: () => {
    // Handoff complete
  }
});
```

### Staggered Animations

For multiple agents moving simultaneously:

```javascript
this.tweens.add({
  targets: [agent1, agent2, agent3],
  scale: 1.1,
  duration: 500,
  delay: this.tweens.stagger(100) // 100ms between each
});
```

### PathFollower

Built-in support for agents following paths:

```javascript
const path = new Phaser.Curves.Path(startX, startY);
path.lineTo(midX, midY);
path.lineTo(endX, endY);

const agent = this.add.follower(path, startX, startY, 'agent-sprite');
agent.startFollow({
  duration: 2000,
  rotateToPath: false
});
```

---

## Phaser vs PixiJS Comparison

| Aspect | Phaser 3 | PixiJS |
|--------|----------|--------|
| **Type** | Full game framework | Rendering engine only |
| **Bundle Size** | ~1.2MB | ~450KB |
| **Isometric Support** | Native tilemaps | Manual or plugin |
| **Physics** | Built-in (Arcade, Matter.js) | Add manually |
| **Tweening** | Built-in | Add manually |
| **Scene Management** | Built-in | Add manually |
| **Learning Curve** | Moderate | Lower (but more DIY) |
| **Best For** | Games, rapid development | Custom engines, pure rendering |

### Verdict for Our Project

**Phaser wins** because:
- Native isometric tilemap support
- Built-in PathFollower for agent movement
- Comprehensive tween system for animations
- Faster development time
- Better documentation for game-like projects

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Phaser 3 Game                    │
├─────────────────────────────────────────────────────┤
│  Scene: MainDashboard                               │
│  ├── Tilemap Layer: Floor (isometric office)       │
│  ├── Tilemap Layer: Furniture (desks, etc.)        │
│  ├── Group: Agents (sprite objects)                │
│  ├── Group: Artifacts (carried items)              │
│  ├── UI Layer: Timeline, Metrics                   │
│  └── Camera: Zoom/Pan controls                     │
├─────────────────────────────────────────────────────┤
│  Event System                                       │
│  ├── API Events → Agent State Updates              │
│  ├── Agent Actions → Tween Animations              │
│  └── User Input → Camera/Selection                 │
└─────────────────────────────────────────────────────┘
```

---

## Plugins & Extensions

### Recommended Plugins

1. **phaser3-plugin-isometric** - Enhanced isometric support
   - [Tutorial](https://phaser.io/news/2020/07/creating-an-isometric-view-in-phaser-3)

2. **Rex Plugins** - Extensive plugin collection
   - UI components
   - Board/grid systems
   - Pathfinding

### Pathfinding Options

- **EasyStar.js** - Lightweight A* pathfinding
- **NavMesh** - More complex navigation
- **Simple waypoints** - For our use case, may be sufficient

---

## Performance Considerations

### For Dashboard with Many Agents

1. **Object Pooling** - Reuse sprite objects
2. **Texture Atlases** - Combine sprites into single texture
3. **Culling** - Only render visible agents
4. **WebGL Renderer** - Default, hardware accelerated

### Expected Performance

- 50-100 animated agents: Smooth 60fps
- 100-500 agents: May need optimization
- Canvas fallback: For older browsers

---

## Development Resources

### Official Resources
- [Phaser 3 Documentation](https://docs.phaser.io/)
- [Phaser 3 Examples](https://phaser.io/examples)
- [Phaser Isometric Examples](https://phaser.io/examples/v3.55.0/tilemap/isometric/view/isometric-test)

### Tutorials
- [Creating Isometric Worlds (TutsPlus)](https://phaser.io/news/2017/05/creating-isometric-worlds-tutorial-part-1)
- [Isometric View in Phaser 3](https://phaser.io/news/2020/07/creating-an-isometric-view-in-phaser-3)

### GitHub Resources
- [Isometric Demo](https://github.com/mmermerkaya/phaser-isometric-demo)
- [Isometric Theory](https://github.com/juwalbose/Isometric-Theory-Phaser)

---

## Implementation Roadmap

### Phase 1: Setup
- [ ] Initialize Phaser 3 project with TypeScript
- [ ] Set up isometric tilemap with Tiled
- [ ] Create basic office layout

### Phase 2: Core Features
- [ ] Agent sprites with animations
- [ ] Movement system with PathFollower
- [ ] State machine for agent states (idle, working, walking)

### Phase 3: Interactivity
- [ ] Camera zoom/pan controls
- [ ] Click-to-select agents
- [ ] Follow mode (double-click)

### Phase 4: Polish
- [ ] Particle effects
- [ ] UI overlays (timeline, metrics)
- [ ] Sound effects (optional)

---

## Conclusion

**Phaser 3.x is the recommended choice** for the SDLC Game Dashboard:

✅ Native isometric tilemap support
✅ Built-in animation and tween systems
✅ PathFollower for agent movement
✅ Comprehensive camera controls
✅ Active community and documentation
✅ Rapid development possible

The framework provides all necessary features out-of-the-box, allowing focus on the unique aspects of the dashboard rather than engine implementation.

---

## Sources

- [Phaser Official Documentation](https://docs.phaser.io/)
- [Creating Isometric View in Phaser 3](https://phaser.io/news/2020/07/creating-an-isometric-view-in-phaser-3)
- [Phaser vs PixiJS Comparison](https://dev.to/ritza/phaser-vs-pixijs-for-making-2d-games-2j8c)
- [Phaser vs PixiJS 2025 Guide](https://generalistprogrammer.com/comparisons/phaser-vs-pixijs)
- [Isometric Game Development 2025 Guide](https://vocal.media/gamers/isometric-game-development-tools-and-engines-a-2025-guide-bp3kg09sw)
- [JS Game Rendering Benchmark](https://github.com/Shirajuki/js-game-rendering-benchmark)
