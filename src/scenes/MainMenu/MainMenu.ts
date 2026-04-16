import { Scene } from "@/scenes/Scene";
import type { SceneId } from "@/scenes/SceneId";
import { VIEWPORT_WIDTH } from "@/services/AutoScaler";
import type { SceneManager } from "@/services/scenes/SceneManager";
import { MenuButton } from "@/ui/MenuButton";
import { Container, Text } from "pixi.js";

export class MainMenu extends Scene {
  constructor(sceneManager: SceneManager) {
    super(sceneManager);
  }

  protected async load(): Promise<void> {
    this.addChild(this.createHeading());

    const buttons = [
      {
        sceneId: "AceOfShadows" as const,
        title: "Ace of Shadows",
        subtitle: "144 stacked cards in motion",
        theme: {
          fillColor: 0xff6b6b,
          shadowColor: 0xb23a48,
        },
      },
      {
        sceneId: "MagicWords" as const,
        title: "Magic Words",
        subtitle: "Avatars with dialogue and emojis",
        theme: {
          fillColor: 0x2ec4b6,
          shadowColor: 0x1b7f77,
        },
      },
      {
        sceneId: "PhoenixFlame" as const,
        title: "Phoenix Flame",
        subtitle: "A fiery particle showcase",
        theme: {
          fillColor: 0xff9f1c,
          shadowColor: 0xb85c00,
        },
      },
    ];

    const buttonWidth = 460;
    const buttonHeight = 124;
    const shadowOffsetY = 10;
    const startY = 220;
    const gap = 185;

    buttons.forEach((buttonConfig, index) => {
      const button = new MenuButton({
        width: buttonWidth,
        height: buttonHeight,
        shadowOffsetY,
        title: buttonConfig.title,
        subtitle: buttonConfig.subtitle,
        theme: buttonConfig.theme,
      });

      button.position.set(VIEWPORT_WIDTH / 2, startY + index * gap + (buttonHeight + shadowOffsetY) / 2);
      button.on("pointertap", () => {
        this.navigateTo(buttonConfig.sceneId);
      });
      this.addChild(button);
    });

    return Promise.resolve();
  }

  private createHeading(): Container {
    const heading = new Container();

    const title = new Text({
      text: "SOFTGAMES ASSIGNMENT",
      style: {
        fill: 0x3d405b,
        fontFamily: "Trebuchet MS",
        fontSize: 22,
        fontWeight: "700",
        letterSpacing: 3,
      },
    });
    title.anchor.set(0.5);
    title.position.set(VIEWPORT_WIDTH / 2, 80);

    heading.addChild(title);

    return heading;
  }

  private navigateTo(sceneId: SceneId): void {
    void this.sceneManager.switchTo(sceneId);
  }
}
