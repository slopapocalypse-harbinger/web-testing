export const level4 = {
  id: 4,
  name: "Storm Drift",
  seed: 4482,
  waterline: 88,
  objective: { type: "score", target: 420 },
  timeLimit: 300,
  palette: {
    sky: "#12253b",
    water: "#18445a",
    shore: "#214334",
    cloud: "#6c8fa9",
  },
  spawns: {
    foodRate: 0.75,
    predatorRate: 0.3,
    powerRate: 0.14,
  },
  hazards: [
    { type: "gust", x: 80, y: 50 },
    { type: "gust", x: 160, y: 70 },
    { type: "gust", x: 240, y: 60 },
    { type: "rock", x: 130, y: 126 },
  ],
  predators: [
    { type: "hawk", x: 210, y: 30 },
    { type: "hawk", x: 90, y: 40 },
    { type: "otter", x: 50, y: 132 },
  ],
  goal: null,
};
