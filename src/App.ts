import { GameStage } from "@/GameStage";
import { AssetLoader } from "@/services/assets/AssetLoader";
import { AutoScaler } from "@/services/window/AutoScaler";
import { FPSMeter } from "@/services/FPSMeter";
import { SceneManager } from "@/services/scenes/SceneManager";
import { Application } from "pixi.js";

export class App {
  private readonly gameStage: GameStage;

  private readonly assetLoader: AssetLoader;
  private readonly autoScaler: AutoScaler;
  private readonly fpsService: FPSMeter;
  private readonly sceneManager: SceneManager;

  constructor(pixiApplication: Application) {
    this.assetLoader = new AssetLoader();
    this.sceneManager = new SceneManager(this.assetLoader);
    this.fpsService = new FPSMeter(pixiApplication.ticker);

    this.gameStage = new GameStage(this.sceneManager, this.fpsService);
    pixiApplication.stage.addChild(this.gameStage);

    this.autoScaler = new AutoScaler(this.gameStage);
  }

  public async start(): Promise<void> {
    this.autoScaler.resize();
    await this.sceneManager.start("MainMenu");

    void this.assetLoader.preloadRemainingSceneAssets("MainMenu").catch((error: unknown) => {
      console.error("Background asset preloading failed.", error);
    });
  }
}
