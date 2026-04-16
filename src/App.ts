import { GameStage } from "@/GameStage";
import { AssetLoader } from "@/services/assets/AssetLoader";
import { AutoScaler } from "@/services/window/AutoScaler";
import { GamePauseService } from "@/services/window/GamePauseService";
import { SceneManager } from "@/services/scenes/SceneManager";
import { TweenManager } from "@/services/tweens/TweenManager";
import { Application } from "pixi.js";
import { FPSMeter } from "@/services/fps/FPSMeter";

export class App {
  private readonly gameStage: GameStage;

  private readonly assetLoader: AssetLoader;
  private readonly autoScaler: AutoScaler;
  private readonly tweenManager: TweenManager;
  private readonly sceneManager: SceneManager;

  constructor(pixiApplication: Application) {
    this.assetLoader = new AssetLoader();
    this.tweenManager = new TweenManager(pixiApplication.ticker);
    TweenManager.setShared(this.tweenManager);
    this.sceneManager = new SceneManager(this.assetLoader);
    new GamePauseService(pixiApplication.ticker);

    this.gameStage = new GameStage(this.sceneManager);
    pixiApplication.stage.addChild(this.gameStage);

    new FPSMeter(pixiApplication.ticker);

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
