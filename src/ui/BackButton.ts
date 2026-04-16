import { Text } from "pixi.js";

import { Button } from "@/ui/Button";

export class BackButton extends Button {
  public static readonly WIDTH = 220;
  public static readonly HEIGHT = 72;
  public static readonly SHADOW_OFFSET_Y = 8;

  constructor() {
    super({
      width: BackButton.WIDTH,
      height: BackButton.HEIGHT,
      shadowOffsetY: BackButton.SHADOW_OFFSET_Y,
      cornerRadius: 26,
      hoverScale: 1.02,
      pressedScale: 0.98,
      theme: {
        fillColor: 0x4f5d75,
        shadowColor: 0x2f3b52,
        borderColor: 0xffffff,
        highlightColor: 0xffffff,
      },
    });

    const label = new Text({
      text: "Go back",
      style: {
        fill: 0xffffff,
        fontFamily: "Trebuchet MS",
        fontSize: 26,
        fontWeight: "700",
      },
    });
    label.anchor.set(0.5);
    label.position.set(this.buttonWidth / 2, this.buttonHeight / 2);

    this.content.addChild(label);
  }
}
