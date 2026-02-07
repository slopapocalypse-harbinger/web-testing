const DEFAULT = {
  x: 0,
  y: 0,
  flap: false,
  pause: false,
};

export class InputManager {
  constructor(canvas, joystickEl, stickEl, flapBtn) {
    this.canvas = canvas;
    this.state = { ...DEFAULT };
    this.joystickEl = joystickEl;
    this.stickEl = stickEl;
    this.joystickId = null;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickValue = { x: 0, y: 0 };
    this.pointerDown = false;
    this.onFirstInteraction = null;

    window.addEventListener("keydown", (event) => this.onKey(event, true));
    window.addEventListener("keyup", (event) => this.onKey(event, false));
    window.addEventListener("blur", () => this.reset());

    if (joystickEl) {
      joystickEl.addEventListener("pointerdown", (event) => this.onJoystickStart(event));
      window.addEventListener("pointermove", (event) => this.onJoystickMove(event));
      window.addEventListener("pointerup", (event) => this.onJoystickEnd(event));
      window.addEventListener("pointercancel", (event) => this.onJoystickEnd(event));
    }

    if (flapBtn) {
      flapBtn.addEventListener("pointerdown", () => this.setAction("flap", true));
      flapBtn.addEventListener("pointerup", () => this.setAction("flap", false));
      flapBtn.addEventListener("pointerleave", () => this.setAction("flap", false));
    }

    canvas.addEventListener("pointerdown", () => {
      this.setAction("flap", true);
      this.handleFirstInteraction();
    });
    canvas.addEventListener("pointerup", () => this.setAction("flap", false));
    canvas.addEventListener("pointerleave", () => this.setAction("flap", false));
    canvas.addEventListener("touchstart", () => this.handleFirstInteraction(), { passive: true });
  }

  handleFirstInteraction() {
    if (this.onFirstInteraction) {
      this.onFirstInteraction();
      this.onFirstInteraction = null;
    }
  }

  setAction(action, value) {
    this.state[action] = value;
    if (value) {
      this.handleFirstInteraction();
    }
  }

  onKey(event, pressed) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        this.state.x = pressed ? -1 : this.state.x === -1 ? 0 : this.state.x;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        this.state.x = pressed ? 1 : this.state.x === 1 ? 0 : this.state.x;
        break;
      case "ArrowUp":
      case "w":
      case "W":
        this.state.y = pressed ? -1 : this.state.y === -1 ? 0 : this.state.y;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        this.state.y = pressed ? 1 : this.state.y === 1 ? 0 : this.state.y;
        break;
      case " ":
      case "Enter":
      case "e":
      case "E":
        this.state.flap = pressed;
        break;
      case "Escape":
        if (pressed) {
          this.state.pause = true;
        }
        break;
      default:
        break;
    }

    if (pressed) {
      this.handleFirstInteraction();
    }
  }

  onJoystickStart(event) {
    this.joystickId = event.pointerId;
    this.pointerDown = true;
    const rect = this.joystickEl.getBoundingClientRect();
    this.joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    this.updateJoystick(event.clientX, event.clientY);
    this.handleFirstInteraction();
  }

  onJoystickMove(event) {
    if (!this.pointerDown || event.pointerId !== this.joystickId) {
      return;
    }
    this.updateJoystick(event.clientX, event.clientY);
  }

  onJoystickEnd(event) {
    if (event.pointerId !== this.joystickId) {
      return;
    }
    this.pointerDown = false;
    this.joystickId = null;
    this.joystickValue = { x: 0, y: 0 };
    this.updateStickPosition(0, 0);
  }

  updateJoystick(x, y) {
    const dx = x - this.joystickCenter.x;
    const dy = y - this.joystickCenter.y;
    const max = 40;
    const dist = Math.min(Math.hypot(dx, dy), max);
    const angle = Math.atan2(dy, dx);
    const nx = (Math.cos(angle) * dist) / max;
    const ny = (Math.sin(angle) * dist) / max;
    this.joystickValue = { x: nx, y: ny };
    this.updateStickPosition(nx * max, ny * max);
  }

  updateStickPosition(dx, dy) {
    if (!this.stickEl) {
      return;
    }
    this.stickEl.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  reset() {
    this.state = { ...DEFAULT };
    this.joystickValue = { x: 0, y: 0 };
  }

  read() {
    const joy = this.joystickValue;
    const x = Math.abs(joy.x) > 0.1 ? joy.x : this.state.x;
    const y = Math.abs(joy.y) > 0.1 ? joy.y : this.state.y;
    const result = {
      x,
      y,
      flap: this.state.flap,
      pause: this.state.pause,
    };
    this.state.pause = false;
    return result;
  }
}
