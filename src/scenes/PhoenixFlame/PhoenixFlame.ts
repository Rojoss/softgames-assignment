import { Scene } from "@/scenes/Scene";
import { FlameEffect } from "@/scenes/PhoenixFlame/FlameEffect";
import { getSheetTexture } from "@/services/assets/getSheetTexture";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/services/window/AutoScaler";
import type { SceneManager } from "@/services/scenes/SceneManager";
import { BackButton } from "@/ui/BackButton";
 
const FLAME_BASE_X = VIEWPORT_WIDTH / 2;
const FLAME_BASE_Y = VIEWPORT_HEIGHT / 2 + 170;

export class PhoenixFlame extends Scene {
  private flameEffect?: FlameEffect;

  constructor(sceneManager: SceneManager) {
    super(sceneManager);
  }

  protected async load(): Promise<void> {
    const backButton = new BackButton();
    backButton.position.set(VIEWPORT_WIDTH / 2, 48 + (BackButton.HEIGHT + BackButton.SHADOW_OFFSET_Y) / 2);
    backButton.on("pointertap", () => {
      void this.sceneManager.switchTo("MainMenu");
    });

    this.flameEffect = new FlameEffect(getSheetTexture("PhoenixFlame", "flame-particle.png"));
    this.flameEffect.position.set(FLAME_BASE_X, FLAME_BASE_Y);

    this.addChild(this.flameEffect, backButton);

    return Promise.resolve();
  }

  protected override unload(): void {
    this.flameEffect?.stop();

    if (this.flameEffect?.parent === this) {
      this.removeChild(this.flameEffect);
    }

    this.flameEffect?.destroy({ children: true });
    this.flameEffect = undefined;
  }
}
