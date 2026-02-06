export const level5 = {
  id: 5,
  name: "Migration Finish",
  seed: 5099,
  waterline: 96,
  objective: { type: "reach", target: 1 },
  timeLimit: 320,
  palette: {
    sky: "#22436d",
    water: "#215c7b",
    shore: "#2c5d4d",
    cloud: "#9fc4e2",
  },
  spawns: {
    foodRate: 0.7,
    predatorRate: 0.35,
    powerRate: 0.16,
  },
  hazards: [
    { type: "rock", x: 70, y: 124 },
    { type: "rock", x: 170, y: 126 },
    { type: "gust", x: 200, y: 50 },
    { type: "reed", x: 240, y: 112 },
  ],
  predators: [
    { type: "hawk", x: 120, y: 36 },
    { type: "otter", x: 210, y: 130 },
  ],
  goal: { x: 290, y: 60 },
};
