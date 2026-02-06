export const level3 = {
  id: 3,
  name: "Reed Maze",
  seed: 3031,
  waterline: 100,
  objective: { type: "collect", target: 24 },
  timeLimit: 280,
  palette: {
    sky: "#1c3552",
    water: "#1c4f6a",
    shore: "#265244",
    cloud: "#86abc4",
  },
  spawns: {
    foodRate: 0.8,
    predatorRate: 0.25,
    powerRate: 0.12,
  },
  hazards: [
    { type: "reed", x: 70, y: 108 },
    { type: "reed", x: 110, y: 112 },
    { type: "reed", x: 150, y: 116 },
    { type: "rock", x: 200, y: 128 },
  ],
  predators: [
    { type: "otter", x: 250, y: 132 },
    { type: "hawk", x: 60, y: 45 },
  ],
  goal: null,
};
