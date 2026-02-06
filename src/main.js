import { Engine } from "./engine.js";
import { Renderer } from "./renderer.js";
import { InputManager } from "./input.js";
import { AudioManager } from "./audio.js";
import { Game } from "./game.js";
import { levels } from "./levels/index.js";

const canvas = document.getElementById("game");
const joystick = document.getElementById("joystick");
const stick = joystick?.querySelector(".stick");
const flapBtn = document.getElementById("flap");
const peckBtn = document.getElementById("peck");
const screen = document.getElementById("screen");
const screenContent = document.getElementById("screen-content");
const tutorial = document.getElementById("tutorial");
const tutorialClose = document.getElementById("tutorial-close");

const hungerFill = document.getElementById("hunger-fill");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const objectiveEl = document.getElementById("objective");
const comboEl = document.getElementById("combo");
const compassEl = document.getElementById("compass");
const muteBtn = document.getElementById("mute");

const renderer = new Renderer(canvas);
renderer.resize();
window.addEventListener("resize", () => renderer.resize());

const input = new InputManager(canvas, joystick, stick, flapBtn, peckBtn);
const audio = new AudioManager();

const ui = {
  updateHUD({ hungerRatio, score, level, objective, combo, compass }) {
    hungerFill.style.width = `${Math.max(0, Math.min(1, hungerRatio)) * 100}%`;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    objectiveEl.textContent = objective;
    comboEl.textContent = `x${combo}`;
    compassEl.textContent = compass;
  },
  updateObjective(level, progress) {
    objectiveEl.textContent = `${progress}/${level.objective.target}`;
  },
  showScreen(html) {
    screenContent.innerHTML = html;
    screen.classList.add("active");
  },
  hideScreen() {
    screen.classList.remove("active");
  },
  showIntro(level, current, total) {
    const objectiveText = level.objective.type === "score"
      ? `Reach ${level.objective.target} points`
      : level.objective.type === "collect"
        ? `Collect ${level.objective.target} food items`
        : "Reach the nesting glow";
    ui.showScreen(`
      <h1>Level ${current}: ${level.name}</h1>
      <p>${objectiveText}</p>
      <p>Watch the hunger bar and avoid predators.</p>
      <button id="start-level">Begin</button>
    `);
    document.getElementById("start-level").addEventListener("click", () => {
      ui.hideScreen();
      game.setState("playing");
    });
  },
  showTitle() {
    ui.showScreen(`
      <h1>Bufflehead Quest</h1>
      <p>Swim, flap, and forage to survive the migration.</p>
      <button id="start-run">Start Run</button>
    `);
    document.getElementById("start-run").addEventListener("click", () => {
      game.startRun(0);
      ui.showIntro(game.level, 1, levels.length);
      maybeShowTutorial();
    });
  },
  showPause() {
    ui.showScreen(`
      <h1>Paused</h1>
      <button id="resume">Resume</button>
      <button id="restart">Restart Run</button>
    `);
    document.getElementById("resume").addEventListener("click", () => {
      ui.hideScreen();
      game.setState("playing");
    });
    document.getElementById("restart").addEventListener("click", () => {
      ui.hideScreen();
      game.startRun(0);
      ui.showIntro(game.level, 1, levels.length);
    });
  },
  showGameOver() {
    ui.showScreen(`
      <h1>Hunger Zero</h1>
      <p>Score: ${game.score}</p>
      <button id="retry">Restart Run</button>
      <button id="back-title">Title</button>
    `);
    document.getElementById("retry").addEventListener("click", () => {
      ui.hideScreen();
      game.startRun(0);
      ui.showIntro(game.level, 1, levels.length);
    });
    document.getElementById("back-title").addEventListener("click", () => {
      ui.hideScreen();
      game.setState("title");
      ui.showTitle();
    });
  },
  showEnding(score) {
    const levelButtons = levels
      .map(
        (level, index) => `
          <button data-level="${index}">Replay Level ${level.id}</button>
        `
      )
      .join("");
    ui.showScreen(`
      <h1>Migration Complete!</h1>
      <p>Final Score: ${score}</p>
      <p>Thanks for guiding the bufflehead home.</p>
      <p class="credits">Credits: Design & code by the Bufflehead Quest team.</p>
      <div class="button-grid">${levelButtons}</div>
      <button id="restart-run">Restart Run</button>
    `);
    screenContent.querySelectorAll("button[data-level]").forEach((button) => {
      button.addEventListener("click", () => {
        const levelIndex = Number(button.dataset.level);
        ui.hideScreen();
        game.startRun(levelIndex);
        ui.showIntro(game.level, levelIndex + 1, levels.length);
      });
    });
    document.getElementById("restart-run").addEventListener("click", () => {
      ui.hideScreen();
      game.startRun(0);
      ui.showIntro(game.level, 1, levels.length);
    });
  },
  setMute(muted) {
    muteBtn.textContent = muted ? "🔇" : "🔊";
  },
};

const game = new Game({ renderer, input, audio, levels, ui });

input.onFirstInteraction = () => audio.init();

muteBtn.addEventListener("click", () => {
  const muted = audio.toggleMute();
  ui.setMute(muted);
});

const tutorialSeenKey = "buffleheadTutorialSeen";
const maybeShowTutorial = () => {
  if (localStorage.getItem(tutorialSeenKey)) {
    return;
  }
  tutorial.classList.add("active");
};

if (tutorialClose) {
  tutorialClose.addEventListener("click", () => {
    tutorial.classList.remove("active");
    localStorage.setItem(tutorialSeenKey, "1");
  });
}

ui.showTitle();

game.loadLevel(0);

const engine = new Engine(
  (dt) => game.update(dt),
  () => game.render(),
  { step: 1 / 60, maxSteps: 6 }
);
engine.start();
