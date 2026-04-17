import { ParticleContainer, type DestroyOptions, Texture } from "pixi.js";

import { Particle, type ParticleSpawnOptions } from "@/services/particles/Particle";

export interface ParticleSpawnerOptions {
  texture: Texture;
  maxParticles: number;
  spawnIntervalMS: number;
  createSpawnOptions: () => ParticleSpawnOptions;
}

/**
 * Reusable pooled particle emitter backed by Pixi's ParticleContainer.
 */
export class ParticleSpawner extends ParticleContainer<Particle> {
  private readonly maxParticles: number;
  private readonly spawnIntervalMS: number;
  private readonly createSpawnOptions: () => ParticleSpawnOptions;

  private animationRAF?: number;
  private lastFrameTime = 0;
  private spawnElapsedMS = 0;

  constructor(options: ParticleSpawnerOptions) {
    const particles = Array.from({ length: options.maxParticles }, () => new Particle(options.texture));

    super({
      texture: options.texture,
      dynamicProperties: {
        position: true,
        rotation: true,
        vertex: true,
        color: true,
      },
    });

    this.maxParticles = options.maxParticles;
    this.spawnIntervalMS = options.spawnIntervalMS;
    this.createSpawnOptions = options.createSpawnOptions;
    this.spawnElapsedMS = this.spawnIntervalMS;

    this.addParticle(...particles);
  }

  /**
   * Starts the emitter update loop.
   */
  public start(): void {
    if (this.animationRAF !== undefined) {
      return;
    }

    this.lastFrameTime = performance.now();
    this.animationRAF = requestAnimationFrame(this.handleFrame);
  }

  /**
   * Stops the emitter update loop.
   */
  public stop(): void {
    if (this.animationRAF === undefined) {
      return;
    }

    cancelAnimationFrame(this.animationRAF);
    this.animationRAF = undefined;
  }

  public override destroy(options?: DestroyOptions): void {
    this.stop();
    super.destroy(options);
  }

  private readonly handleFrame = (currentTime: number): void => {
    const deltaMS = Math.min(currentTime - this.lastFrameTime, 100);

    this.lastFrameTime = currentTime;
    this.step(deltaMS);
    this.animationRAF = requestAnimationFrame(this.handleFrame);
  };

  private step(deltaMS: number): void {
    let activeParticles = 0;

    for (const particle of this.particleChildren) {
      if (particle.update(deltaMS)) {
        activeParticles += 1;
      }
    }

    this.spawnElapsedMS += deltaMS;

    // Spawn new particles while we have elapsed spawn time and available particle slots.
    while (this.spawnElapsedMS >= this.spawnIntervalMS && activeParticles < this.maxParticles) {
      const particle = this.getAvailableParticle();
      if (!particle) {
        break;
      }

      particle.reset(this.createSpawnOptions());
      this.spawnElapsedMS -= this.spawnIntervalMS;
      activeParticles += 1;
    }
  }

  /**
   * Finds an available inactive particle from the pool, or returns undefined if all particles are active.
   */
  private getAvailableParticle(): Particle | undefined {
    return this.particleChildren.find((particle) => !particle.active);
  }
}
