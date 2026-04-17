import { Particle as PixiParticle, Texture } from "pixi.js";

import { lerpColorStops, resolveColorStops, type ColorStop, type ResolvedColorStop } from "@/utils/colorStops.ts";
import { lerp } from "@/utils/lerp";

export type ParticleColorStop = ColorStop;

export interface ParticleSpawnOptions {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  accelerationX?: number;
  accelerationY?: number;
  rotation?: number;
  angularVelocity?: number;
  lifetimeMS: number;
  startScale: number;
  endScale: number;
  colorStops: readonly ParticleColorStop[];
}

/**
 * Lightweight pooled particle
 * With simple lifetime-based motion and color interpolation.
 */
export class Particle extends PixiParticle {
  private ageMS = 0;
  private lifetimeMS = 1;
  private velocityX = 0;
  private velocityY = 0;
  private accelerationX = 0;
  private accelerationY = 0;
  private angularVelocity = 0;
  private startScale = 1;
  private endScale = 1;
  private isActive = false;

  private colorStops: ResolvedColorStop[] = [
    {
      progress: 0,
      tint: 0xffffff,
      alpha: 0,
    },
  ];

  constructor(texture: Texture) {
    super({
      texture,
      anchorX: 0.5,
      anchorY: 0.5,
      alpha: 0,
    });

    this.scaleX = 0;
    this.scaleY = 0;
  }

  public get active(): boolean {
    return this.isActive;
  }

  /**
   * Reinitializes the particle so it can be reused from the pool.
   */
  public reset(options: ParticleSpawnOptions): void {
    this.ageMS = 0;
    this.lifetimeMS = Math.max(options.lifetimeMS, 1);
    this.velocityX = options.velocityX;
    this.velocityY = options.velocityY;
    this.accelerationX = options.accelerationX ?? 0;
    this.accelerationY = options.accelerationY ?? 0;
    this.angularVelocity = options.angularVelocity ?? 0;
    this.startScale = options.startScale;
    this.endScale = options.endScale;
    this.rotation = options.rotation ?? 0;
    this.x = options.x;
    this.y = options.y;
    this.colorStops = resolveColorStops(options.colorStops);
    this.isActive = true;

    this.applyState(0);
  }

  /**
   * Advances the particle simulation and returns whether the particle remains visible.
   */
  public update(deltaMS: number): boolean {
    if (!this.isActive) {
      return false;
    }

    const deltaSeconds = deltaMS / 1000;

    this.velocityX += this.accelerationX * deltaSeconds;
    this.velocityY += this.accelerationY * deltaSeconds;
    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;
    this.rotation += this.angularVelocity * deltaSeconds;

    this.ageMS = Math.min(this.ageMS + deltaMS, this.lifetimeMS);

    const progress = this.ageMS / this.lifetimeMS;

    this.applyState(progress);

    if (progress >= 1) {
      this.deactivate();
      return false;
    }

    return true;
  }

  private applyState(progress: number): void {
    const scale = lerp(this.startScale, this.endScale, progress);
    const color = lerpColorStops(this.colorStops, progress);

    this.scaleX = scale;
    this.scaleY = scale;
    this.tint = color.tint;
    this.alpha = color.alpha;
  }

  private deactivate(): void {
    this.isActive = false;
    this.alpha = 0;
    this.scaleX = 0;
    this.scaleY = 0;
  }
}
