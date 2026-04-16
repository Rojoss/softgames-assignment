import { Container } from "pixi.js";
import type { SceneManager } from "@/services/scenes/SceneManager";

export abstract class Scene extends Container {
  private hasLoaded = false;
  protected readonly sceneManager: SceneManager;

  constructor(sceneManager: SceneManager) {
    super();

    this.sceneManager = sceneManager;
  }

  public async prepare(): Promise<void> {
    if (this.hasLoaded) {
      return;
    }

    await this.load();
    this.hasLoaded = true;
  }

  protected abstract load(): Promise<void>;
}
