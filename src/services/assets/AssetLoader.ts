import { sceneAssets } from "@/services/assets/sceneAssets";
import { SceneId, SCENE_IDS } from "@/services/scenes/SceneId";
import { Assets } from "pixi.js";

let hasRegisteredBundles = false;

/**
 * Registers and loads scene asset bundles.
 * Scenes can await their own bundle while the app preloads the rest in the background.
 */
export class AssetLoader {
  private readonly loadPromises = new Map<SceneId, Promise<void>>();

  constructor() {
    this.registerBundles();
  }

  /**
   * Ensures all assets required by a scene are loaded.
   */
  public loadSceneAssets(sceneId: SceneId): Promise<void> {
    if (sceneAssets[sceneId].length === 0) {
      return Promise.resolve();
    }

    const existingPromise = this.loadPromises.get(sceneId);

    if (existingPromise) {
      return existingPromise;
    }

    const loadPromise = Assets.loadBundle(sceneId)
      .then(() => undefined)
      .catch((error: unknown) => {
        this.loadPromises.delete(sceneId);
        throw error;
      });

    this.loadPromises.set(sceneId, loadPromise);

    return loadPromise;
  }

  /**
   * Starts loading the remaining scene bundles without blocking the current scene.
   */
  public preloadRemainingSceneAssets(activeSceneId: SceneId): Promise<void> {
    const bundleIds = SCENE_IDS.filter((sceneId) => sceneId !== activeSceneId && sceneAssets[sceneId].length > 0);

    if (bundleIds.length === 0) {
      return Promise.resolve();
    }

    return Assets.backgroundLoadBundle(bundleIds).then(() => undefined);
  }

  private registerBundles(): void {
    if (hasRegisteredBundles) {
      return;
    }

    SCENE_IDS.forEach((sceneId) => {
      const assets = sceneAssets[sceneId];

      if (assets.length === 0) {
        return;
      }

      Assets.addBundle(sceneId, assets);
    });

    hasRegisteredBundles = true;
  }
}
