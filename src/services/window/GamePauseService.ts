import type { Ticker } from "pixi.js";

import { eventBus } from "@/services/events/Events";

export const shouldPauseGame = (): boolean => document.visibilityState !== "visible" || !document.hasFocus();

/**
 * Keeps the game paused while the page is hidden or the window loses focus.
 */
export class GamePauseService {
  private isPaused = false;

  constructor(private readonly ticker: Ticker) {
    this.isPaused = shouldPauseGame();

    document.addEventListener("visibilitychange", this.handlePauseStateChange);
    window.addEventListener("focus", this.handlePauseStateChange);
    window.addEventListener("blur", this.handlePauseStateChange);

    this.applyPauseState(this.isPaused);
  }

  private readonly handlePauseStateChange = (): void => {
    this.setPaused(shouldPauseGame());
  };

  private setPaused(paused: boolean): void {
    if (this.isPaused === paused) {
      return;
    }

    this.isPaused = paused;
    this.applyPauseState(paused);
  }

  private applyPauseState(paused: boolean): void {
    if (paused) {
      eventBus.dispatch("pause");
      this.ticker.stop();
      return;
    }

    this.ticker.start();
    eventBus.dispatch("resume");
  }
}
