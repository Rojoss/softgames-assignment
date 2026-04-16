import { SceneManager } from "@/services/scenes/SceneManager";
import { FPSDisplay as FPSDisplay } from "@/ui/FPSDisplay";
import { Container } from "pixi.js";

export class GameStage extends Container {
  private readonly fps: FPSDisplay;

  constructor(sceneManager: SceneManager) {
    super();

    this.fps = new FPSDisplay();

    this.addChild(sceneManager, this.fps);
  }
}
