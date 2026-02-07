export const level2 = {
  id: 2,
  name: "Windy Reach",
  seed: 2024,
  waterline: 92,
  objective: { type: "score", target: 200 },
  startHunger: 0.9,
  drainScale: 0.9,
  dangerScale: 0.85,
  timeLimit: 260,
  palette: {
    sky: "#162b4a",
    water: "#1d4e63",
    shore: "#2e5b45",
    cloud: "#9bc0de",
  },
  spawns: {
    foodRate: 1.0,
    predatorRate: 0.12,
    powerRate: 0.12,
  },
  hazards: [
    { type: "gust", x: 120, y: 50 },
    { type: "gust", x: 240, y: 70 },
    { type: "rock", x: 60, y: 126 },
  ],
  predators: [
    { type: "hawk", x: 210, y: 40 },
    { type: "otter", x: 100, y: 128 },
  ],
  goal: null,
};
