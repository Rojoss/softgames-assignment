import { Container, Graphics, Rectangle } from "pixi.js";

export interface ButtonTheme {
  fillColor: number;
  shadowColor: number;
  borderColor?: number;
  highlightColor?: number;
}

export interface ButtonOptions {
  width: number;
  height: number;
  rotation?: number;
  cornerRadius?: number;
  shadowOffsetY?: number;
  hoverScale?: number;
  pressedScale?: number;
  theme: ButtonTheme;
}

export class Button extends Container {
  protected readonly buttonWidth: number;
  protected readonly buttonHeight: number;
  protected readonly content: Container;

  private readonly face: Container;
  private readonly shadow: Graphics;
  private readonly baseRotation: number;
  private readonly shadowOffsetY: number;
  private readonly hoverScale: number;
  private readonly pressedScale: number;

  private isHovered = false;
  private isPressed = false;

  constructor(options: ButtonOptions) {
    super();

    this.buttonWidth = options.width;
    this.buttonHeight = options.height;
    this.baseRotation = options.rotation ?? 0;
    this.shadowOffsetY = options.shadowOffsetY ?? 10;
    this.hoverScale = options.hoverScale ?? 1.03;
    this.pressedScale = options.pressedScale ?? 0.985;

    const cornerRadius = options.cornerRadius ?? 30;
    const borderColor = options.theme.borderColor ?? 0xffffff;
    const highlightColor = options.theme.highlightColor ?? 0xffffff;

    this.eventMode = "static";
    this.cursor = "pointer";
    this.pivot.set(this.buttonWidth / 2, (this.buttonHeight + this.shadowOffsetY) / 2);
    this.rotation = this.baseRotation;
    this.hitArea = new Rectangle(0, 0, this.buttonWidth, this.buttonHeight + this.shadowOffsetY);

    this.shadow = new Graphics().roundRect(0, this.shadowOffsetY, this.buttonWidth, this.buttonHeight, cornerRadius).fill({
      color: options.theme.shadowColor,
      alpha: 0.88,
    });

    const panel = new Graphics()
      .roundRect(0, 0, this.buttonWidth, this.buttonHeight, cornerRadius)
      .fill(options.theme.fillColor)
      .stroke({ color: borderColor, width: 4, alpha: 0.95 });

    const highlight = new Graphics().roundRect(18, 14, this.buttonWidth - 36, 26, 16).fill({ color: highlightColor, alpha: 0.18 });

    this.face = new Container();
    this.content = new Container();

    this.face.addChild(panel, highlight, this.content);
    this.addChild(this.shadow, this.face);

    this.on("pointerover", this.handlePointerOver);
    this.on("pointerout", this.handlePointerOut);
    this.on("pointerdown", this.handlePointerDown);
    this.on("pointerup", this.handlePointerUp);
    this.on("pointerupoutside", this.handlePointerUp);
  }

  private readonly handlePointerOver = (): void => {
    this.isHovered = true;
    this.refreshVisualState();
  };

  private readonly handlePointerOut = (): void => {
    this.isHovered = false;
    this.isPressed = false;
    this.refreshVisualState();
  };

  private readonly handlePointerDown = (): void => {
    this.isPressed = true;
    this.refreshVisualState();
  };

  private readonly handlePointerUp = (): void => {
    this.isPressed = false;
    this.refreshVisualState();
  };

  private refreshVisualState(): void {
    let scale = 1;
    let rotation = this.baseRotation;
    let faceY = 0;
    let shadowAlpha = 0.88;

    if (this.isHovered) {
      scale = this.hoverScale;
      rotation = this.baseRotation * 0.45;
      faceY = -3;
      shadowAlpha = 1;
    }

    if (this.isPressed) {
      scale = this.pressedScale;
      rotation = this.baseRotation * 0.2;
      faceY = 6;
      shadowAlpha = 0.72;
    }

    this.scale.set(scale);
    this.rotation = rotation;
    this.face.y = faceY;
    this.shadow.alpha = shadowAlpha;
  }
}
