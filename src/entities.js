export class Pool {
  constructor(createFn, size = 20) {
    this.items = Array.from({ length: size }, () => createFn());
  }

  getInactive() {
    return this.items.find((item) => !item.active);
  }

  forEachActive(cb) {
    for (const item of this.items) {
      if (item.active) {
        cb(item);
      }
    }
  }
}

export const FOOD_TYPES = {
  fish: { score: 10, hunger: 14, sprite: "fish", zone: "water" },
  insect: { score: 6, hunger: 8, sprite: "insect", zone: "air" },
  clam: { score: 18, hunger: 22, sprite: "clam", zone: "deep" },
};

export const POWER_TYPES = {
  school: { score: 40, hunger: 35, sprite: "fish", risky: true },
  current: { score: 0, hunger: 0, sprite: "current", boost: true },
};

export function createFood() {
  return {
    active: false,
    x: 0,
    y: 0,
    radius: 6,
    type: "fish",
  };
}

export function createPredator() {
  return {
    active: false,
    x: 0,
    y: 0,
    radius: 10,
    type: "hawk",
    vx: 0,
    vy: 0,
    patrol: 0,
  };
}

export function createHazard() {
  return {
    active: false,
    x: 0,
    y: 0,
    radius: 10,
    type: "rock",
  };
}

export function createPower() {
  return {
    active: false,
    x: 0,
    y: 0,
    radius: 8,
    type: "school",
    ttl: 0,
  };
}

export function circleHit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.hypot(dx, dy);
  return dist < a.radius + b.radius;
}
