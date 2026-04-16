import { APP_BACKGROUND_COLOR } from "@/main";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/services/AutoScaler";
import { Container, Graphics, Rectangle, Text } from "pixi.js";

export class LoadingScreen extends Container {
  constructor() {
    super();

    this.visible = false;
    this.eventMode = "static";
    this.hitArea = new Rectangle(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    const background = new Graphics().rect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT).fill(APP_BACKGROUND_COLOR);

    const label = new Text({
      text: "Loading...",
      style: {
        fill: 0xffffff,
        fontFamily: "Trebuchet MS",
        fontSize: 40,
        fontWeight: "700",
        letterSpacing: 2,
      },
    });
    label.anchor.set(0.5);
    label.position.set(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2);

    this.addChild(background, label);
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }
}
