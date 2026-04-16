import { Application } from "pixi.js";
import { App } from "@/App";
// import { FullscreenController } from "@/services/FullscreenController";

export const APP_BACKGROUND_COLOR = 0xa1bfcf;

(async () => {
  const pixi = new Application();
  await pixi.init({
    antialias: true,
    autoDensity: true,
    background: APP_BACKGROUND_COLOR,
    resizeTo: window,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  });

  const pixiContainer = document.getElementById("pixi-container");

  if (!(pixiContainer instanceof HTMLElement)) {
    throw new Error("Missing #pixi-container element.");
  }

  // const fullscreenController = new FullscreenController(pixiContainer);
  pixiContainer.appendChild(pixi.canvas);

  const app = new App(pixi);
  await app.start();

  // fullscreenController.enterOnStart();
  // fullscreenController.enableAutoEnter(pixi.canvas);
})();
