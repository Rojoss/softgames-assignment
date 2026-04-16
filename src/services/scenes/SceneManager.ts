import { Container } from "pixi.js";

import { Scene } from "@/scenes/Scene";
import { sceneFactories } from "@/services/scenes/SceneFactory";
import { AssetLoader } from "@/services/assets/AssetLoader";
import { LoadingScreen } from "@/ui/LoadingScreen";
import { SceneId } from "@/services/scenes/SceneId";
import { TweenManager } from "@/services/tweens/TweenManager";

/**
 * The SceneManager is responsible for managing the different scenes of the game.
 * It handles the creation, preparation, and transition between scenes.
 * Scenes are identified by their SceneId and are created using the sceneFactories.
 * The SceneManager ensures that only one scene is active at a time and that transitions are smooth.
 */
export class SceneManager extends Container {
  private readonly assetLoader: AssetLoader;
  private readonly tweenManager: TweenManager;
  private readonly sceneContainer = new Container();
  private readonly loadingScreen = new LoadingScreen();

  private currentScene?: Scene;
  private currentSceneId?: SceneId;
  private transitionQueue = Promise.resolve();

  constructor(assetLoader: AssetLoader, tweenManager: TweenManager) {
    super();

    this.assetLoader = assetLoader;
    this.tweenManager = tweenManager;
    this.addChild(this.sceneContainer, this.loadingScreen);
  }

  /**
   * Starts the scene manager by transitioning to the initial scene.
   * This method should be called once after instantiating the scene manager.
   */
  public start(initialSceneId: SceneId): Promise<void> {
    return this.switchTo(initialSceneId);
  }

  /**
   * Switch to a different scene by its ID.
   * If the scene has not been loaded before, it will be created and prepared.
   * Scene transitions are queued to ensure that only one transition happens at a time.
   *
   * @param sceneId The scene to switch to
   */
  public switchTo(sceneId: SceneId): Promise<void> {
    this.transitionQueue = this.transitionQueue.catch(() => {}).then(() => this.performTransition(sceneId));

    return this.transitionQueue;
  }

  /**
   * Creates a fresh scene instance for the given scene ID.
   */
  private createScene(sceneId: SceneId): Scene {
    const scene = sceneFactories[sceneId](this);
    scene.visible = false;

    return scene;
  }

  /**
   * Destroys a scene instance after it has been closed.
   */
  private destroyScene(scene?: Scene): void {
    if (!scene) {
      return;
    }

    if (scene.parent === this.sceneContainer) {
      this.sceneContainer.removeChild(scene);
    }

    scene.destroy({ children: true });
  }

  /**
   * Internal method to perform the actual scene transition.
   * It ensures that the new scene is prepared before switching.
   */
  private async performTransition(sceneId: SceneId): Promise<void> {
    if (sceneId === this.currentSceneId) {
      return;
    }

    const previousScene = this.currentScene;

    previousScene?.close();
    this.tweenManager.clear();

    this.loadingScreen.show();

    try {
      await this.assetLoader.loadSceneAssets(sceneId);

      const nextScene = this.createScene(sceneId);
      await nextScene.prepare();
      nextScene.visible = true;

      this.sceneContainer.removeChildren();
      this.sceneContainer.addChild(nextScene);
      this.currentScene = nextScene;
      this.currentSceneId = sceneId;
      this.destroyScene(previousScene);
    } finally {
      this.loadingScreen.hide();
    }
  }
}
