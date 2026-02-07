import { SPRITE_SHEET_DATA } from "./spritesheet-data.js";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.baseWidth = canvas.width;
    this.baseHeight = canvas.height;
    this.sprites = new Map();
    this.spriteSheet = new Image();
    this.spriteSheetLoaded = false;
    this.spriteSheet.onload = () => {
      this.spriteSheetLoaded = true;
    };
    this.spriteSheet.src = SPRITE_SHEET_DATA;
    this.tileSize = 16;
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

  ensureSprites() {
    if (this.sprites.size) {
      return;
    }
    const tile = this.tileSize;
    const map = new Map([
      ["duck", { x: 1 * tile, y: 5 * tile, w: tile, h: tile }],
      ["fish", { x: 0 * tile, y: 3 * tile, w: tile, h: tile }],
      ["clam", { x: 7 * tile, y: 3 * tile, w: tile, h: tile }],
      ["insect", { x: 5 * tile, y: 3 * tile, w: tile, h: tile }],
      ["hawk", { x: 1 * tile, y: 7 * tile, w: tile, h: tile }],
      ["otter", { x: 0 * tile, y: 6 * tile, w: tile, h: tile }],
      ["rock", { x: 21 * tile, y: 1 * tile, w: tile, h: tile }],
      ["reed", { x: 25 * tile, y: 1 * tile, w: tile, h: tile }],
      ["gust", { x: 27 * tile, y: 1 * tile, w: tile, h: tile }],
      ["current", { x: 11 * tile, y: 3 * tile, w: tile, h: tile }],
    ]);
    map.forEach((value, key) => {
      this.sprites.set(key, value);
    });
  }

  drawSprite(key, x, y, size = 16) {
    const sprite = this.sprites.get(key);
    if (!sprite) {
      return;
    }
    if (!this.spriteSheetLoaded) {
      this.ctx.fillStyle = "#f2d45c";
      this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
      return;
    }
    this.ctx.drawImage(
      this.spriteSheet,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      x - size / 2,
      y - size / 2,
      size,
      size
    );
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
