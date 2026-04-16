import { Container, type DestroyOptions, Text } from "pixi.js";

import { FPSMeter } from "@/services/fps/FPSMeter";

const GOOD_FPS_THRESHOLD = 50;
const WARNING_FPS_THRESHOLD = 30;

const GOOD_FPS_COLOR = 0x0d8c31;
const WARNING_FPS_COLOR = 0x8c4f0d;
const BAD_FPS_COLOR = 0xef4444;

const METER_X = 24;
const METER_Y = 24;

export class FPSDisplay extends Container {
  private readonly fpsText: Text;
  private unsubscribe?: () => void;

  constructor(fpsService: FPSMeter) {
    super();

    this.fpsText = new Text({
      text: "FPS: --",
      style: {
        fill: GOOD_FPS_COLOR,
        fontFamily: ["Consolas", "Monaco", "monospace"],
        fontSize: 16,
      },
    });

    this.position.set(METER_X, METER_Y);

    this.addChild(this.fpsText);

    this.unsubscribe = fpsService.subscribe((fps) => {
      this.fpsText.text = `FPS: ${fps}`;
      this.fpsText.style.fill = this.getFPSColor(fps);
    });
  }

  public override destroy(options?: DestroyOptions): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    super.destroy(options);
  }

  private getFPSColor(fps: number): number {
    if (fps >= GOOD_FPS_THRESHOLD) {
      return GOOD_FPS_COLOR;
    }
    if (fps >= WARNING_FPS_THRESHOLD) {
      return WARNING_FPS_COLOR;
    }
    return BAD_FPS_COLOR;
  }
}
