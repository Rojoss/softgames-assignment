import { Text } from "pixi.js";

import { Button, type ButtonOptions } from "@/ui/Button";

export interface MenuButtonOptions extends ButtonOptions {
  title: string;
  subtitle: string;
  titleColor?: number;
  subtitleColor?: number;
}

export class MenuButton extends Button {
  constructor(options: MenuButtonOptions) {
    super(options);

    const title = new Text({
      text: options.title,
      style: {
        fill: options.titleColor ?? 0xffffff,
        fontFamily: "Trebuchet MS",
        fontSize: 34,
        fontWeight: "700",
      },
    });
    title.position.set(34, 24);

    const subtitle = new Text({
      text: options.subtitle,
      style: {
        fill: options.subtitleColor ?? 0xfffbf2,
        fontFamily: "Trebuchet MS",
        fontSize: 20,
      },
    });
    subtitle.position.set(34, 70);

    this.content.addChild(title, subtitle);
  }
}
