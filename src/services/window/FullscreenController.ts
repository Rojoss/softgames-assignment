type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export class FullscreenController {
  private readonly target: HTMLElement;

  constructor(target: HTMLElement) {
    this.target = target;
  }

  public isSupported(): boolean {
    const fullscreenTarget = this.target as FullscreenCapableElement;

    return typeof fullscreenTarget.requestFullscreen === "function" || typeof fullscreenTarget.webkitRequestFullscreen === "function";
  }

  public async request(): Promise<void> {
    if (!this.isSupported() || document.fullscreenElement === this.target) {
      return;
    }

    const fullscreenTarget = this.target as FullscreenCapableElement;

    if (typeof fullscreenTarget.requestFullscreen === "function") {
      await fullscreenTarget.requestFullscreen();
      return;
    }

    if (typeof fullscreenTarget.webkitRequestFullscreen === "function") {
      await Promise.resolve(fullscreenTarget.webkitRequestFullscreen());
    }
  }

  public enterOnStart(): void {
    void this.request().catch(() => {
      // Ignore blocked autoplay-like fullscreen attempts and rely on the first interaction fallback.
    });
  }

  public enableAutoEnter(triggerTarget: HTMLElement): void {
    if (!this.isSupported()) {
      return;
    }

    triggerTarget.addEventListener(
      "pointerdown",
      () => {
        void this.request().catch(() => {
          // Ignore blocked attempts. Some browsers may deny fullscreen even after the first interaction.
        });
      },
      { once: true },
    );
  }
}
