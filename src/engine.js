export class Engine {
  constructor(update, render, { step = 1 / 60, maxSteps = 5 } = {}) {
    this.update = update;
    this.render = render;
    this.step = step;
    this.maxSteps = maxSteps;
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
  }

  loop(time) {
    if (!this.running) {
      return;
    }
    const delta = Math.min((time - this.lastTime) / 1000, 0.25);
    this.lastTime = time;
    this.accumulator += delta;

    let steps = 0;
    while (this.accumulator >= this.step && steps < this.maxSteps) {
      this.update(this.step);
      this.accumulator -= this.step;
      steps += 1;
    }

    this.render(this.accumulator / this.step);
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }
}
