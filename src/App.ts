import { GameStage } from "@/GameStage";
import { AssetLoader } from "@/services/AssetLoader";
import { SceneManager } from "@/services/SceneManager";
import { Application } from "pixi.js";

export class App {
  private readonly gameStage: GameStage;

  private readonly assetLoader: AssetLoader;
  private readonly sceneManager: SceneManager;

  constructor(pixiApplication: Application) {
    this.assetLoader = new AssetLoader();
    this.sceneManager = new SceneManager(this.assetLoader);
    this.gameStage = new GameStage(this.sceneManager, this.fpsService);
    pixiApplication.stage.addChild(this.gameStage);
  }

  public async start(): Promise<void> {
    await this.sceneManager.start("MainMenu");

    void this.assetLoader.preloadRemainingSceneAssets("MainMenu").catch((error: unknown) => {
      console.error("Background asset preloading failed.", error);
    });
  }
}
