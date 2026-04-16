import { Container } from "pixi.js";

import { Scene } from "@/scenes/Scene";
import type { SceneId } from "@/scenes/SceneId";
import { sceneFactories } from "@/factories/SceneFactory";
import { AssetLoader } from "@/services/AssetLoader";
import { LoadingScreen } from "@/ui/LoadingScreen";

/**
 * The SceneManager is responsible for managing the different scenes of the game.
 * It handles the creation, preparation, and transition between scenes.
 * Scenes are identified by their SceneId and are created using the sceneFactories.
 * The SceneManager ensures that only one scene is active at a time and that transitions are smooth.
 */
export class SceneManager extends Container {
  private readonly assetLoader: AssetLoader;
  private readonly scenes = new Map<SceneId, Scene>();
  private readonly sceneContainer = new Container();
  private readonly loadingScreen = new LoadingScreen();

  private currentSceneId?: SceneId;
  private transitionQueue = Promise.resolve();

  constructor(assetLoader: AssetLoader) {
    super();

    this.assetLoader = assetLoader;
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
   * Gets the scene instance for the given scene ID.
   * If the scene does not exist, it will be created and stored.
   */
  private getScene(sceneId: SceneId): Scene {
    const existingScene = this.scenes.get(sceneId);

    if (existingScene) {
      return existingScene;
    }

    const scene = sceneFactories[sceneId](this);
    scene.visible = false;
    this.scenes.set(sceneId, scene);

    return scene;
  }

  /**
   * Internal method to perform the actual scene transition.
   * It ensures that the new scene is prepared before switching.
   */
  private async performTransition(sceneId: SceneId): Promise<void> {
    if (sceneId === this.currentSceneId) {
      return;
    }

    this.loadingScreen.show();

    try {
      await this.assetLoader.loadSceneAssets(sceneId);

      const nextScene = this.getScene(sceneId);
      await nextScene.prepare();
      nextScene.visible = true;

      this.sceneContainer.removeChildren();
      this.sceneContainer.addChild(nextScene);
      this.currentSceneId = sceneId;
    } finally {
      this.loadingScreen.hide();
    }
  }
}
