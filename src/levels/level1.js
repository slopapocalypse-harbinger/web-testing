export const level1 = {
  id: 1,
  name: "Marsh Warmup",
  seed: 1337,
  waterline: 98,
  objective: { type: "collect", target: 18 },
  timeLimit: 240,
  palette: {
    sky: "#183a5a",
    water: "#1c536a",
    shore: "#244a3b",
    cloud: "#7ca7c7",
  },
  spawns: {
    foodRate: 0.9,
    predatorRate: 0.15,
    powerRate: 0.08,
  },
  hazards: [
    { type: "rock", x: 90, y: 124 },
    { type: "reed", x: 180, y: 110 },
  ],
  predators: [
    { type: "otter", x: 230, y: 130 },
  ],
  goal: null,
};
