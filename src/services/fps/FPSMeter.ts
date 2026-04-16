import { Ticker } from "pixi.js";

import { eventBus } from "@/services/events/Events";

const DEFAULT_UPDATE_INTERVAL_MS = 250;

export class FPSMeter {
  private readonly ticker: Ticker;
  private readonly updateIntervalMs: number;

  private elapsedMS = 0;
  private currentFPS = 0;

  constructor(ticker: Ticker, updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
    this.ticker = ticker;
    this.updateIntervalMs = updateIntervalMs;
    this.currentFPS = Math.round(this.ticker.FPS);

    this.ticker.add(this.handleTick);
    eventBus.dispatch("fpsUpdate", this.currentFPS);
  }

  public destroy(): void {
    this.ticker.remove(this.handleTick);
  }

  private readonly handleTick = (): void => {
    this.elapsedMS += this.ticker.deltaMS;

    if (this.elapsedMS < this.updateIntervalMs) {
      return;
    }

    this.elapsedMS = 0;

    const nextFPS = Math.round(this.ticker.FPS);

    if (nextFPS === this.currentFPS) {
      return;
    }

    this.currentFPS = nextFPS;
    eventBus.dispatch("fpsUpdate", this.currentFPS);
  };
}
