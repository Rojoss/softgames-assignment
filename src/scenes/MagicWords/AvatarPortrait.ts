import { Container, Sprite, Texture } from "pixi.js";

export class AvatarPortrait extends Container {
  public static readonly WIDTH = 260;
  public static readonly HEIGHT = 260;
  private static readonly PADDING = 12;

  private readonly portraitSprite: Sprite;

  constructor() {
    super();

    this.portraitSprite = new Sprite();
    this.portraitSprite.anchor.set(0.5);
    this.portraitSprite.position.set(AvatarPortrait.WIDTH / 2, AvatarPortrait.HEIGHT / 2);

    this.visible = false;
    this.addChild(this.portraitSprite);
  }

  public setAvatar(texture: Texture | null): void {
    if (!texture) {
      this.clear();

      return;
    }

    this.visible = true;
    this.portraitSprite.texture = texture;
    this.portraitSprite.scale.set(this.getTextureScale(texture));
    this.portraitSprite.visible = true;
  }

  public clear(): void {
    this.visible = false;
  }

  private getTextureScale(texture: Texture): number {
    const maxWidth = AvatarPortrait.WIDTH - AvatarPortrait.PADDING * 2;
    const maxHeight = AvatarPortrait.HEIGHT - AvatarPortrait.PADDING * 2;
    const scale = Math.min(maxWidth / texture.width, maxHeight / texture.height);

    return Number.isFinite(scale) ? scale : 1;
  }
}
