import { Scene } from "@/scenes/Scene";
import { VIEWPORT_WIDTH } from "@/services/AutoScaler";
import type { SceneManager } from "@/services/scenes/SceneManager";
import { BackButton } from "@/ui/BackButton";

export class PhoenixFlame extends Scene {
  constructor(sceneManager: SceneManager) {
    super(sceneManager);
  }

  protected async load(): Promise<void> {
    const backButton = new BackButton();
    backButton.position.set(VIEWPORT_WIDTH / 2, 48 + (BackButton.HEIGHT + BackButton.SHADOW_OFFSET_Y) / 2);
    backButton.on("pointertap", () => {
      void this.sceneManager.switchTo("MainMenu");
    });

    this.addChild(backButton);

    return Promise.resolve();
  }
}
