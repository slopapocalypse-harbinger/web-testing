export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.baseWidth = canvas.width;
    this.baseHeight = canvas.height;
    this.sprites = new Map();
  }

  resize() {
    const { innerWidth, innerHeight } = window;
    const scale = Math.max(1, Math.floor(Math.min(innerWidth / this.baseWidth, innerHeight / this.baseHeight)));
    this.canvas.style.width = `${this.baseWidth * scale}px`;
    this.canvas.style.height = `${this.baseHeight * scale}px`;
  }

  clear(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);
  }

  generateSprite(key, drawFn) {
    const size = 16;
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const ctx = off.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx, size);
    this.sprites.set(key, off);
    return off;
  }

  getSprite(key) {
    return this.sprites.get(key);
  }

  ensureSprites() {
    if (this.sprites.size) {
      return;
    }

    this.generateSprite("duck", (ctx) => {
      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = "#4b4b4b";
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = "#f2d45c";
      ctx.fillRect(11, 7, 3, 2);
      ctx.fillStyle = "#3c6f8f";
      ctx.fillRect(2, 9, 3, 3);
    });

    this.generateSprite("fish", (ctx) => {
      ctx.fillStyle = "#6ad1e3";
      ctx.fillRect(4, 7, 8, 4);
      ctx.fillRect(2, 8, 3, 2);
      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(10, 8, 1, 1);
    });

    this.generateSprite("clam", (ctx) => {
      ctx.fillStyle = "#d9b0d6";
      ctx.fillRect(4, 6, 8, 6);
      ctx.fillStyle = "#b487b0";
      ctx.fillRect(5, 7, 6, 4);
    });

    this.generateSprite("insect", (ctx) => {
      ctx.fillStyle = "#f2d45c";
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillRect(9, 5, 2, 2);
    });

    this.generateSprite("hawk", (ctx) => {
      ctx.fillStyle = "#8b5b3c";
      ctx.fillRect(3, 6, 10, 4);
      ctx.fillRect(2, 7, 2, 2);
      ctx.fillRect(12, 7, 2, 2);
      ctx.fillStyle = "#f2d45c";
      ctx.fillRect(11, 8, 2, 1);
    });

    this.generateSprite("otter", (ctx) => {
      ctx.fillStyle = "#7a4a2f";
      ctx.fillRect(4, 7, 8, 5);
      ctx.fillStyle = "#d9b08c";
      ctx.fillRect(6, 8, 4, 3);
    });

    this.generateSprite("rock", (ctx) => {
      ctx.fillStyle = "#5a6a7a";
      ctx.fillRect(4, 8, 8, 4);
      ctx.fillRect(5, 6, 6, 3);
    });

    this.generateSprite("reed", (ctx) => {
      ctx.fillStyle = "#5da562";
      ctx.fillRect(7, 3, 2, 10);
      ctx.fillStyle = "#3c7a42";
      ctx.fillRect(6, 6, 2, 7);
    });

    this.generateSprite("gust", (ctx) => {
      ctx.fillStyle = "#b1e4f1";
      ctx.fillRect(3, 6, 10, 2);
      ctx.fillRect(5, 9, 8, 2);
    });

    this.generateSprite("current", (ctx) => {
      ctx.fillStyle = "#f2d45c";
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = "#f27b50";
      ctx.fillRect(6, 6, 4, 4);
    });
  }

  drawSprite(key, x, y, size = 16) {
    const sprite = this.getSprite(key);
    if (!sprite) {
      return;
    }
    this.ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  }

  drawBackground(level, time) {
    const { ctx } = this;
    this.clear(level.palette.sky);

    ctx.fillStyle = level.palette.cloud;
    for (let i = 0; i < 3; i += 1) {
      const offset = (time * 10 + i * 80) % this.baseWidth;
      ctx.fillRect(this.baseWidth - offset, 20 + i * 10, 30, 6);
    }

    ctx.fillStyle = level.palette.water;
    ctx.fillRect(0, level.waterline, this.baseWidth, this.baseHeight - level.waterline);

    ctx.fillStyle = level.palette.shore;
    ctx.fillRect(0, level.waterline - 6, this.baseWidth, 6);
  }

  drawHUD(state) {
    const { ctx } = this;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(6, 6, 120, 12);
    ctx.fillStyle = "#f2d45c";
    ctx.fillRect(6, 6, 120 * state.hungerRatio, 12);
  }

  drawMiniMap(level, player, goal) {
    const { ctx } = this;
    const mapW = 64;
    const mapH = 24;
    const x = this.baseWidth - mapW - 8;
    const y = 8;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(x, y, mapW, mapH);
    ctx.fillStyle = "#5da562";
    ctx.fillRect(x, y + (level.waterline / this.baseHeight) * mapH, mapW, mapH / 2);
    ctx.fillStyle = "#f2d45c";
    ctx.fillRect(
      x + (player.x / this.baseWidth) * mapW - 2,
      y + (player.y / this.baseHeight) * mapH - 2,
      4,
      4
    );
    if (goal) {
      ctx.fillStyle = "#ff88cc";
      ctx.fillRect(
        x + (goal.x / this.baseWidth) * mapW - 2,
        y + (goal.y / this.baseHeight) * mapH - 2,
        4,
        4
      );
    }
  }
}
