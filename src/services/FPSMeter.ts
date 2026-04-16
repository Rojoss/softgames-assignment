import { Ticker } from "pixi.js";

type FPSListener = (fps: number) => void;

const DEFAULT_UPDATE_INTERVAL_MS = 250;

export class FPSMeter {
  private readonly listeners = new Set<FPSListener>();
  private readonly ticker: Ticker;
  private readonly updateIntervalMs: number;

  private elapsedMS = 0;
  private currentFPS = 0;

  constructor(ticker: Ticker, updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
    this.ticker = ticker;
    this.updateIntervalMs = updateIntervalMs;
    this.currentFPS = Math.round(this.ticker.FPS);

    this.ticker.add(this.handleTick);
  }

  public get fps(): number {
    return this.currentFPS;
  }

  public subscribe(listener: FPSListener): () => void {
    this.listeners.add(listener);
    listener(this.currentFPS);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public destroy(): void {
    this.ticker.remove(this.handleTick);
    this.listeners.clear();
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

    for (const listener of this.listeners) {
      listener(this.currentFPS);
    }
  };
}
