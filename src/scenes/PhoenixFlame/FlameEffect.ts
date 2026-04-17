import { ParticleSpawner } from "@/services/particles/ParticleSpawner";
import type { ParticleSpawnOptions } from "@/services/particles/Particle";
import { getRandomInRange } from "@/utils/getRandomInRange";
import { Container, type DestroyOptions, Texture } from "pixi.js";

const FLAME_PARTICLE_COUNT = 10;
const FLAME_SPAWN_INTERVAL_MS = 54;

const FLAME_YELLOW = 0xffd84d;
const FLAME_HOT_YELLOW = 0xfff4b0;
const FLAME_ORANGE = 0xff9f1c;
const FLAME_RED = 0xd94b10;
const FLAME_DARK_RED = 0x6e1f0a;

export class FlameEffect extends Container {
  private flameSpawnIndex = 0;
  private readonly flameSpawner: ParticleSpawner;

  constructor(texture: Texture) {
    super();

    this.flameSpawner = new ParticleSpawner({
      texture,
      maxParticles: FLAME_PARTICLE_COUNT,
      spawnIntervalMS: FLAME_SPAWN_INTERVAL_MS,
      createSpawnOptions: () => createFlameSpawnOptions(this.flameSpawnIndex++),
    });
    this.flameSpawner.blendMode = "add";

    this.on("added", this.handleAddedToStage);
    this.on("removed", this.handleRemovedFromStage);

    this.addChild(this.flameSpawner);
  }

  public start(): void {
    this.flameSpawner.start();
  }

  public stop(): void {
    this.flameSpawner.stop();
  }

  public override destroy(options?: DestroyOptions): void {
    this.off("added", this.handleAddedToStage);
    this.off("removed", this.handleRemovedFromStage);
    this.stop();

    super.destroy(options);
  }

  private readonly handleAddedToStage = (): void => {
    this.start();
  };

  private readonly handleRemovedFromStage = (): void => {
    this.stop();
  };
}

function createFlameSpawnOptions(spawnIndex: number): ParticleSpawnOptions {
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
