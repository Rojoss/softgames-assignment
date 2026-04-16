import { Scene } from "@/scenes/Scene";
import { getSheetTexture } from "@/services/assets/getSheetTexture";
import { ParticleSpawner } from "@/services/particles/ParticleSpawner";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/services/window/AutoScaler";
import type { SceneManager } from "@/services/scenes/SceneManager";
import { BackButton } from "@/ui/BackButton";
import { getRandomInRange } from "@/utils/getRandomInRange";
import { Rectangle, Texture } from "pixi.js";

const FLAME_PARTICLE_COUNT = 10;
const FLAME_SPAWN_INTERVAL_MS = 54;
const FLAME_BASE_X = VIEWPORT_WIDTH / 2;
const FLAME_BASE_Y = VIEWPORT_HEIGHT / 2 + 170;

const FLAME_YELLOW = 0xffd84d;
const FLAME_HOT_YELLOW = 0xfff4b0;
const FLAME_ORANGE = 0xff9f1c;
const FLAME_RED = 0xd94b10;
const FLAME_DARK_RED = 0x6e1f0a;

export class PhoenixFlame extends Scene {
  private flameTexture?: Texture;
  private flameSpawner?: ParticleSpawner;
  private flameSpawnIndex = 0;

  constructor(sceneManager: SceneManager) {
    super(sceneManager);
  }

  protected async load(): Promise<void> {
    const backButton = new BackButton();
    backButton.position.set(VIEWPORT_WIDTH / 2, 48 + (BackButton.HEIGHT + BackButton.SHADOW_OFFSET_Y) / 2);
    backButton.on("pointertap", () => {
      void this.sceneManager.switchTo("MainMenu");
    });

    this.flameTexture = getSheetTexture("PhoenixFlame", "flame-particle.png");
    this.flameSpawnIndex = 0;
    this.flameSpawner = new ParticleSpawner({
      texture: this.flameTexture,
      maxParticles: FLAME_PARTICLE_COUNT,
      spawnIntervalMS: FLAME_SPAWN_INTERVAL_MS,
      boundsArea: new Rectangle(-170, -450, 340, 500),
      createSpawnOptions: () => createFlameSpawnOptions(this.flameSpawnIndex++),
    });
    this.flameSpawner.position.set(FLAME_BASE_X, FLAME_BASE_Y);
    this.flameSpawner.blendMode = "add";

    this.on("added", this.handleAddedToStage);
    this.on("removed", this.handleRemovedFromStage);

    this.addChild(this.flameSpawner, backButton);

    return Promise.resolve();
  }

  protected override unload(): void {
    this.off("added", this.handleAddedToStage);
    this.off("removed", this.handleRemovedFromStage);

    this.flameSpawner?.stop();

    if (this.flameSpawner?.parent === this) {
      this.removeChild(this.flameSpawner);
    }

    this.flameSpawner?.destroy({ children: true });
    this.flameSpawner = undefined;

    this.flameTexture = undefined;
  }

  private readonly handleAddedToStage = (): void => {
    this.flameSpawner?.start();
  };

  private readonly handleRemovedFromStage = (): void => {
    this.flameSpawner?.stop();
  };
}

function createFlameSpawnOptions(spawnIndex: number) {
  const profileIndex = spawnIndex % 6;

  if (profileIndex === 0 || profileIndex === 1 || profileIndex === 2) {
    return {
      x: getRandomInRange(-12, 12),
      y: getRandomInRange(0, 24),
      velocityX: getRandomInRange(-8, 8),
      velocityY: getRandomInRange(-220, -165),
      accelerationX: getRandomInRange(-3, 3),
      accelerationY: -10,
      lifetimeMS: getRandomInRange(540, 680),
      startScale: getRandomInRange(0.58, 0.73),
      endScale: getRandomInRange(0.15, 0.21),
      colorStops: [
        { progress: 0, tint: FLAME_HOT_YELLOW, alpha: 0.78 },
        { progress: 0.18, tint: FLAME_YELLOW, alpha: 0.84 },
        { progress: 0.38, tint: FLAME_ORANGE, alpha: 0.86 },
        { progress: 0.7, tint: FLAME_RED, alpha: 0.5 },
        { progress: 1, tint: FLAME_DARK_RED, alpha: 0 },
      ],
    };
  }

  if (profileIndex === 3 || profileIndex === 4) {
    const direction = profileIndex === 3 ? -1 : 1;

    return {
      x: getRandomInRange(10, 24) * direction,
      y: getRandomInRange(8, 24),
      velocityX: getRandomInRange(12, 24) * direction,
      velocityY: getRandomInRange(-300, -235),
      accelerationX: getRandomInRange(-20, -12) * direction,
      accelerationY: 18,
      lifetimeMS: getRandomInRange(360, 460),
      startScale: getRandomInRange(0.32, 0.46),
      endScale: getRandomInRange(0.08, 0.12),
      colorStops: [
        { progress: 0, tint: FLAME_HOT_YELLOW, alpha: 0.66 },
        { progress: 0.12, tint: FLAME_YELLOW, alpha: 0.72 },
        { progress: 0.3, tint: FLAME_ORANGE, alpha: 0.72 },
        { progress: 0.68, tint: FLAME_RED, alpha: 0.38 },
        { progress: 1, tint: FLAME_DARK_RED, alpha: 0 },
      ],
    };
  }

  return {
    x: getRandomInRange(-8, 8),
    y: getRandomInRange(-34, -10),
    velocityX: getRandomInRange(-12, 12),
    velocityY: getRandomInRange(-360, -300),
    accelerationX: getRandomInRange(-4, 4),
    accelerationY: 34,
    lifetimeMS: getRandomInRange(240, 320),
    startScale: getRandomInRange(0.14, 0.19),
    endScale: getRandomInRange(0.03, 0.05),
    colorStops: [
      { progress: 0, tint: FLAME_HOT_YELLOW, alpha: 0.38 },
      { progress: 0.28, tint: FLAME_YELLOW, alpha: 0.34 },
      { progress: 0.55, tint: FLAME_ORANGE, alpha: 0.26 },
      { progress: 1, tint: FLAME_DARK_RED, alpha: 0 },
    ],
  };
}
