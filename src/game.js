import { RNG } from "./rng.js";
import { Pool, FOOD_TYPES, POWER_TYPES, createFood, createHazard, createPower, createPredator, circleHit } from "./entities.js";

const HUNGER_MAX = 100;
const COMBO_WINDOW = 4;

export class Game {
  constructor({ renderer, input, audio, levels, ui }) {
    this.renderer = renderer;
    this.input = input;
    this.audio = audio;
    this.levels = levels;
    this.ui = ui;

    this.state = "title";
    this.levelIndex = 0;
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.hunger = HUNGER_MAX;
    this.player = {
      x: 60,
      y: 90,
      vx: 0,
      vy: 0,
      radius: 8,
      speedBoost: 0,
    };
    this.level = null;
    this.rng = new RNG(1);

    this.foodPool = new Pool(createFood, 28);
    this.predatorPool = new Pool(createPredator, 10);
    this.hazardPool = new Pool(createHazard, 12);
    this.powerPool = new Pool(createPower, 8);

    this.spawnTimers = { food: 0, predator: 0, power: 0 };
    this.objectiveProgress = 0;
    this.collectedCount = 0;
    this.reachedGoal = false;

    this.ui.setMute(this.audio.muted);
  }

  startRun(levelIndex = 0) {
    this.levelIndex = levelIndex;
    this.score = 0;
    this.combo = 1;
    this.hunger = HUNGER_MAX;
    this.loadLevel(levelIndex);
    this.state = "intro";
  }

  loadLevel(index) {
    this.level = this.levels[index];
    this.rng = new RNG(this.level.seed);
    this.player.x = 40;
    this.player.y = this.level.waterline;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.speedBoost = 0;
    const startHunger = this.level.startHunger ?? 0.85;
    this.hunger = Math.max(this.hunger, HUNGER_MAX * startHunger);
    this.combo = 1;
    this.comboTimer = 0;
    this.collectedCount = 0;
    this.objectiveProgress = 0;
    this.reachedGoal = false;

    this.foodPool.items.forEach((item) => (item.active = false));
    this.predatorPool.items.forEach((item) => (item.active = false));
    this.hazardPool.items.forEach((item) => (item.active = false));
    this.powerPool.items.forEach((item) => (item.active = false));

    this.level.hazards.forEach((hazard) => {
      const item = this.hazardPool.getInactive();
      if (item) {
        item.active = true;
        item.type = hazard.type;
        item.x = hazard.x;
        item.y = hazard.y;
        item.radius = hazard.type === "gust" ? 18 : 10;
      }
    });

    this.level.predators.forEach((pred) => {
      const item = this.predatorPool.getInactive();
      if (item) {
        item.active = true;
        item.type = pred.type;
        item.x = pred.x;
        item.y = pred.y;
        item.vx = 0;
        item.vy = 0;
        item.patrol = this.rng.range(0, Math.PI * 2);
        item.radius = pred.type === "hawk" ? 12 : 10;
      }
    });

    this.spawnTimers = { food: 0, predator: 0, power: 0 };
    this.ui.updateObjective(this.level, this.objectiveProgress);
  }

  setState(state) {
    this.state = state;
  }

  handleInputActions(actions) {
    if (actions.pause && this.state === "playing") {
      this.state = "paused";
      this.ui.showPause();
    }
  }

  update(dt) {
    const actions = this.input.read();
    this.handleInputActions(actions);

    if (this.state !== "playing") {
      return;
    }

    const level = this.level;
    const player = this.player;
    const inWater = player.y >= level.waterline - 2;
    const baseSpeed = inWater ? 75 : 60;
    const boost = player.speedBoost > 0 ? 1.4 : 1;
    const speed = baseSpeed * boost;

    player.vx += actions.x * speed * dt * 3;
    if (inWater) {
      player.vy += actions.y * 60 * dt;
      if (actions.flap) {
        player.vy -= 120 * dt;
      }
    } else {
      if (actions.flap) {
        player.vy -= 240 * dt;
      }
      player.vy += 220 * dt;
      player.vy += actions.y * 60 * dt;
    }

    player.vx *= 0.9;
    player.vy *= 0.9;

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    player.x = Math.max(10, Math.min(this.renderer.baseWidth - 10, player.x));
    player.y = Math.max(8, Math.min(this.renderer.baseHeight - 8, player.y));

    const drain = inWater ? 1.0 : 1.5;
    const drainScale = level.drainScale ?? 1;
    this.hunger -= drain * drainScale * dt * (actions.flap ? 1.1 : 1);
    if (player.speedBoost > 0) {
      player.speedBoost -= dt;
    }

    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer === 0) {
      this.combo = 1;
    }

    this.spawnTimers.food += dt;
    this.spawnTimers.predator += dt;
    this.spawnTimers.power += dt;

    this.spawnEntities();
    this.updatePredators(dt);
    this.updateHazards(dt);
    this.updatePowerUps(dt);
    this.collectFood();

    if (this.hunger <= 0) {
      this.state = "gameover";
      this.ui.showGameOver();
      this.audio.beep({ frequency: 160, duration: 0.2 });
    }

    this.checkObjective();
    this.updateHUD();
  }

  spawnEntities() {
    const level = this.level;
    if (this.spawnTimers.food >= 1 / level.spawns.foodRate) {
      this.spawnTimers.food = 0;
      const item = this.foodPool.getInactive();
      if (item) {
        const typeKey = this.rng.pick(Object.keys(FOOD_TYPES));
        const type = FOOD_TYPES[typeKey];
        item.active = true;
        item.type = typeKey;
        item.radius = 6;
        item.x = this.rng.range(20, this.renderer.baseWidth - 20);
        if (type.zone === "air") {
          item.y = this.rng.range(20, this.level.waterline - 30);
        } else if (type.zone === "deep") {
          item.y = this.rng.range(this.level.waterline + 20, this.renderer.baseHeight - 16);
        } else {
          item.y = this.rng.range(this.level.waterline - 8, this.level.waterline + 30);
        }
      }
    }

    if (this.spawnTimers.predator >= 1 / level.spawns.predatorRate) {
      this.spawnTimers.predator = 0;
      const item = this.predatorPool.getInactive();
      if (item) {
        item.active = true;
        item.type = this.rng.pick(["hawk", "otter"]);
        item.radius = item.type === "hawk" ? 12 : 10;
        item.x = this.rng.range(30, this.renderer.baseWidth - 30);
        item.y = item.type === "hawk"
          ? this.rng.range(20, this.level.waterline - 35)
          : this.rng.range(this.level.waterline + 8, this.renderer.baseHeight - 12);
        item.vx = 0;
        item.vy = 0;
        item.patrol = this.rng.range(0, Math.PI * 2);
      }
    }

    if (this.spawnTimers.power >= 1 / level.spawns.powerRate) {
      this.spawnTimers.power = 0;
      const item = this.powerPool.getInactive();
      if (item) {
        item.active = true;
        item.type = this.rng.pick(Object.keys(POWER_TYPES));
        item.radius = 8;
        item.ttl = 8;
        item.x = this.rng.range(30, this.renderer.baseWidth - 30);
        item.y = item.type === "current"
          ? this.rng.range(30, this.level.waterline - 20)
          : this.rng.range(this.level.waterline + 10, this.renderer.baseHeight - 16);
      }
    }
  }

  updatePredators(dt) {
    const player = this.player;
    const level = this.level;
    const dangerScale = level.dangerScale ?? 1;
    this.predatorPool.forEachActive((pred) => {
      const sameZone = pred.type === "hawk" ? player.y < level.waterline : player.y >= level.waterline - 4;
      const dx = player.x - pred.x;
      const dy = player.y - pred.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 70 && sameZone) {
        pred.vx += (dx / dist) * 40 * dt;
        pred.vy += (dy / dist) * 40 * dt;
      } else {
        pred.patrol += dt;
        pred.vx += Math.cos(pred.patrol) * 10 * dt;
        pred.vy += Math.sin(pred.patrol) * 10 * dt;
      }
      pred.vx *= 0.9;
      pred.vy *= 0.9;
      pred.x += pred.vx;
      pred.y += pred.vy;

      pred.x = Math.max(10, Math.min(this.renderer.baseWidth - 10, pred.x));
      pred.y = Math.max(8, Math.min(this.renderer.baseHeight - 8, pred.y));

      if (circleHit(pred, player)) {
        this.hunger -= 12 * dangerScale * dt;
        player.vx -= dx * 0.01;
        player.vy -= dy * 0.01;
      }
    });
  }

  updateHazards(dt) {
    const player = this.player;
    const dangerScale = this.level.dangerScale ?? 1;
    this.hazardPool.forEachActive((hazard) => {
      if (hazard.type === "gust" && circleHit(hazard, player)) {
        player.vx += 40 * dt;
        player.vy -= 30 * dt;
      }
      if (hazard.type === "reed" && circleHit(hazard, player)) {
        player.vx *= 0.96;
      }
      if (hazard.type === "rock" && circleHit(hazard, player)) {
        this.hunger -= 6 * dangerScale * dt;
      }
    });
  }

  updatePowerUps(dt) {
    this.powerPool.forEachActive((power) => {
      power.ttl -= dt;
      if (power.ttl <= 0) {
        power.active = false;
      }
    });
  }

  collectFood() {
    const player = this.player;
    this.foodPool.forEachActive((food) => {
      const type = FOOD_TYPES[food.type];
      if (circleHit(player, food)) {
        food.active = false;
        const comboMultiplier = this.combo;
        this.score += Math.floor(type.score * comboMultiplier);
        this.hunger = Math.min(HUNGER_MAX, this.hunger + type.hunger);
        this.combo = Math.min(4, this.combo + 1);
        this.comboTimer = COMBO_WINDOW;
        this.collectedCount += 1;
        this.audio.beep({ frequency: 520, duration: 0.08 });
      }
    });

    this.powerPool.forEachActive((power) => {
      if (circleHit(player, power)) {
        power.active = false;
        if (power.type === "school") {
          this.score += POWER_TYPES.school.score * this.combo;
          this.hunger = Math.min(HUNGER_MAX, this.hunger + POWER_TYPES.school.hunger);
          this.audio.beep({ frequency: 620, duration: 0.12 });
        } else if (power.type === "current") {
          player.speedBoost = 6;
          this.audio.beep({ frequency: 740, duration: 0.1 });
        }
      }
    });
  }

  checkObjective() {
    const level = this.level;
    if (level.objective.type === "collect") {
      this.objectiveProgress = this.collectedCount;
      if (this.collectedCount >= level.objective.target) {
        this.completeLevel();
      }
    } else if (level.objective.type === "score") {
      this.objectiveProgress = this.score;
      if (this.score >= level.objective.target) {
        this.completeLevel();
      }
    } else if (level.objective.type === "reach" && level.goal) {
      const dist = Math.hypot(this.player.x - level.goal.x, this.player.y - level.goal.y);
      if (dist < 14) {
        this.reachedGoal = true;
        this.completeLevel();
      }
    }
  }

  completeLevel() {
    this.audio.beep({ frequency: 880, duration: 0.2 });
    if (this.levelIndex >= this.levels.length - 1) {
      this.state = "ending";
      this.ui.showEnding(this.score);
      return;
    }
    this.state = "intro";
    this.levelIndex += 1;
    this.loadLevel(this.levelIndex);
    this.ui.showIntro(this.level, this.levelIndex + 1, this.levels.length);
  }

  updateHUD() {
    const objectiveValue = this.level.objective.type === "score" ? this.score : this.objectiveProgress;
    this.ui.updateHUD({
      hunger: this.hunger,
      hungerRatio: this.hunger / HUNGER_MAX,
      score: this.score,
      level: this.levelIndex + 1,
      objective: `${objectiveValue}/${this.level.objective.target}`,
      combo: this.combo,
      compass: this.getCompass(),
    });
  }

  getCompass() {
    if (!this.level.goal) {
      return "◎";
    }
    const dx = this.level.goal.x - this.player.x;
    const dy = this.level.goal.y - this.player.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "→" : "←";
    }
    return dy > 0 ? "↓" : "↑";
  }

  render() {
    const { renderer, level, player } = this;
    renderer.ensureSprites();
    renderer.drawBackground(level, performance.now() / 1000);

    this.hazardPool.forEachActive((hazard) => {
      renderer.drawSprite(hazard.type, hazard.x, hazard.y, hazard.type === "gust" ? 20 : 16);
    });

    this.powerPool.forEachActive((power) => {
      renderer.drawSprite(POWER_TYPES[power.type].sprite, power.x, power.y, 18);
    });

    this.foodPool.forEachActive((food) => {
      renderer.drawSprite(FOOD_TYPES[food.type].sprite, food.x, food.y, 14);
    });

    this.predatorPool.forEachActive((pred) => {
      renderer.drawSprite(pred.type, pred.x, pred.y, pred.type === "hawk" ? 18 : 16);
    });

    renderer.drawSprite("duck", player.x, player.y, 18);

    if (level.goal) {
      renderer.ctx.fillStyle = "#ff88cc";
      renderer.ctx.fillRect(level.goal.x - 6, level.goal.y - 6, 12, 12);
    }

    renderer.drawMiniMap(level, player, level.goal);
  }
}
