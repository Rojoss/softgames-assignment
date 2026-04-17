import { Application } from "pixi.js";
import { App } from "@/App";
import { DEFAULT_APP_BACKGROUND_COLOR } from "@/appColors";
import { FullscreenController } from "@/services/window/FullscreenController";

(async () => {
  const pixi = new Application();
  await pixi.init({
    antialias: true,
    autoDensity: true,
    background: DEFAULT_APP_BACKGROUND_COLOR,
    resizeTo: window,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  });

  const pixiContainer = document.getElementById("pixi-container");

  if (!(pixiContainer instanceof HTMLElement)) {
    throw new Error("Missing #pixi-container element.");
  }

  const fullscreenController = new FullscreenController(pixiContainer);
  pixiContainer.appendChild(pixi.canvas);

  const app = new App(pixi);
  await app.start();

  fullscreenController.enterOnStart();
  fullscreenController.enableAutoEnter(pixi.canvas);
})();
