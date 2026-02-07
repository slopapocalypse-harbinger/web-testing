# Bufflehead Quest

A no-build, pixelated survival game for GitHub Pages. Play as a bufflehead duck that swims and flies to forage food while avoiding predators.

## How to run locally

Because this is a static site, any simple HTTP server works:

```bash
python -m http.server
```

Then open <http://localhost:8000>.

## Controls

**Mobile**
- Drag the on-screen joystick to move.
- Tap **Boost** to gain lift (flying) or hop (swimming).

**Desktop**
- Move: Arrow keys or WASD
- Boost: Space, Enter, or E
- Pause: Esc

## Gameplay loop

- Keep the hunger bar filled by collecting food (fish, insects, clams).
- Food gives score + hunger; quick streaks multiply score.
- Power-ups:
  - **Fish school**: large hunger refill, risky placement.
  - **Warm current**: temporary speed boost.
- Hazards include rocks, reeds that slow you down, and wind gusts that shove you off course.
- Predators (hawks in air, otters in water) drain hunger on contact.

## Objectives & progression

There are 5 distinct levels with increasing difficulty. Each level requires completing an objective (collect a number of food items, reach a target score, or reach the final nesting glow) before hunger hits zero. Finishing all levels unlocks the ending screen and credits, plus a level-select replay option.

## Audio

Simple WebAudio bleeps play on collection and milestones. Audio unlocks on the first interaction. Use the mute toggle in the HUD to silence it.
