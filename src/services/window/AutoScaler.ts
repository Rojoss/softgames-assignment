import { Container } from "pixi.js";

export const VIEWPORT_WIDTH = 1920;
export const VIEWPORT_HEIGHT = 1080;

/**
 * The AutoScaler service is responsible for scaling and centering the game content.
 * It will ensure that the content fits within the viewport while maintaining the aspect ratio.
 * It listens to window resize and orientation change events to adjust the scaling accordingly.
 */
export class AutoScaler {
  private readonly target: Container;
  private resizeRAF?: number;

  constructor(target: Container) {
    this.target = target;

    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleResize);

    this.scheduleResize();
  }

  private readonly handleResize = (): void => {
    this.scheduleResize();
  };

  public scheduleResize(): void {
    if (this.resizeRAF !== undefined) {
      cancelAnimationFrame(this.resizeRAF);
    }

    this.resizeRAF = requestAnimationFrame(() => {
      this.resizeRAF = undefined;
      this.resize();
    });
  }

  public resize(): void {
    // Get window dimensions
    const screenWidth = window.visualViewport?.width ?? window.innerWidth;
    const screenHeight = window.visualViewport?.height ?? window.innerHeight;
    // Calculate the scale to fit the viewport while maintaining aspect ratio
    const scale = Math.min(screenWidth / VIEWPORT_WIDTH, screenHeight / VIEWPORT_HEIGHT);
    // Apply the scale and center the target container within the available viewport.
    this.target.scale.set(scale);
    this.target.position.set((screenWidth - VIEWPORT_WIDTH * scale) / 2, 0);
  }

  public destroy(): void {
    if (this.resizeRAF !== undefined) {
      cancelAnimationFrame(this.resizeRAF);
      this.resizeRAF = undefined;
    }

    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("orientationchange", this.handleResize);
  }
}
