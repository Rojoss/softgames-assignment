import { FPSMeter } from "@/services/FPSMeter";
import { SceneManager } from "@/services/SceneManager";
import { FPSDisplay as FPSDisplay } from "@/ui/FPSDisplay";
import { Container } from "pixi.js";

export class GameStage extends Container {
  private readonly fps: FPSDisplay;

  constructor(sceneManager: SceneManager, fpsService: FPSMeter) {
    super();

    this.fps = new FPSDisplay(fpsService);

    this.addChild(sceneManager, this.fps);
  }
}
