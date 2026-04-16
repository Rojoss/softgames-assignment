import type { DialoguePart, DialogueTextPart } from "@/services/dialogue/DialogueService";
import { Container, Sprite, Text, Texture, type TextStyleOptions } from "pixi.js";

interface LayoutDisplayToken {
  kind: "display";
  display: Text | Sprite;
  width: number;
  height: number;
}

interface LayoutSpaceToken {
  kind: "space";
  width: number;
}

interface LayoutLineBreakToken {
  kind: "lineBreak";
}

type LayoutToken = LayoutDisplayToken | LayoutSpaceToken | LayoutLineBreakToken;

interface LayoutLineItem {
  display: Text | Sprite;
  x: number;
  height: number;
}

interface LayoutLine {
  items: LayoutLineItem[];
  width: number;
  height: number;
}

export interface InlineEmojiTextOptions {
  textStyle: TextStyleOptions;
  wrapWidth: number;
  lineHeight: number;
  emojiSize: number;
}

/**
 * Renders text and inline emoji sprites with manual wrapping.
 */
export class InlineEmojiText extends Container {
  private static readonly TEXT_SEGMENT_PATTERN = /(\r\n|\r|\n|[^\S\r\n]+)/;

  private readonly bodyElements: Array<Text | Sprite> = [];
  private readonly textStyle: TextStyleOptions;
  private readonly wrapWidth: number;
  private readonly lineHeight: number;
  private readonly emojiSize: number;

  private measuredHeight = 0;

  constructor(options: InlineEmojiTextOptions) {
    super();

    this.textStyle = options.textStyle;
    this.wrapWidth = options.wrapWidth;
    this.lineHeight = options.lineHeight;
    this.emojiSize = options.emojiSize;
  }

  /**
   * Returns the laid out content height in pixels.
   */
  public get contentHeight(): number {
    return this.measuredHeight;
  }

  /**
   * Replaces the current content and reflows the inline layout.
   */
  public setContent(parts: DialoguePart[], emojiTextures: ReadonlyMap<string, Texture>): void {
    this.clear();

    const lines: LayoutLine[] = [];
    let currentLine = this.createEmptyLine();
    let pendingSpaceWidth = 0;

    this.createLayoutTokens(parts, emojiTextures).forEach((token) => {
      if (token.kind === "lineBreak") {
        currentLine.height = Math.max(currentLine.height, this.lineHeight);
        lines.push(currentLine);
        currentLine = this.createEmptyLine();
        pendingSpaceWidth = 0;

        return;
      }

      if (token.kind === "space") {
        if (currentLine.items.length > 0) {
          pendingSpaceWidth += token.width;
        }

        return;
      }

      const leadingSpaceWidth = currentLine.items.length > 0 ? pendingSpaceWidth : 0;
      const shouldWrap = currentLine.items.length > 0 && currentLine.width + leadingSpaceWidth + token.width > this.wrapWidth;

      if (shouldWrap) {
        currentLine.height = Math.max(currentLine.height, this.lineHeight);
        lines.push(currentLine);
        currentLine = this.createEmptyLine();
        pendingSpaceWidth = 0;
      }

      const tokenX = currentLine.width + (currentLine.items.length > 0 ? pendingSpaceWidth : 0);

      currentLine.items.push({
        display: token.display,
        x: tokenX,
        height: token.height,
      });
      currentLine.width = tokenX + token.width;
      currentLine.height = Math.max(currentLine.height, token.height, this.lineHeight);
      this.bodyElements.push(token.display);
      pendingSpaceWidth = 0;
    });

    currentLine.height = Math.max(currentLine.height, this.lineHeight);
    lines.push(currentLine);

    let currentY = 0;

    lines.forEach((line) => {
      line.items.forEach((item) => {
        item.display.position.set(item.x, currentY + (line.height - item.height) / 2);
        this.addChild(item.display);
      });

      currentY += line.height;
    });

    this.measuredHeight = currentY;
  }

  public override destroy(options?: Parameters<Container["destroy"]>[0]): void {
    this.clear();
    super.destroy(options);
  }

  /**
   * Clears all laid out content.
   */
  public clear(): void {
    this.bodyElements.forEach((element) => {
      element.removeFromParent();
      element.destroy();
    });

    this.bodyElements.length = 0;
    this.measuredHeight = 0;
  }

  private createLayoutTokens(parts: DialoguePart[], emojiTextures: ReadonlyMap<string, Texture>): LayoutToken[] {
    const tokens: LayoutToken[] = [];

    parts.forEach((part) => {
      if (part.type === "emoji") {
        const texture = emojiTextures.get(part.name);

        if (texture) {
          const sprite = this.createEmojiSprite(texture);

          tokens.push({
            kind: "display",
            display: sprite,
            width: sprite.width,
            height: sprite.height,
          });

          return;
        }

        tokens.push(...this.createTextTokens(`{${part.name}}`, false));

        return;
      }

      tokens.push(...this.createTextTokens(part.value, part.isBold ?? false));
    });

    return tokens;
  }

  private createTextTokens(text: string, isBold: boolean): LayoutToken[] {
    return text
      .split(InlineEmojiText.TEXT_SEGMENT_PATTERN)
      .filter((segment) => segment.length > 0)
      .map((segment) => {
        if (/^(\r\n|\r|\n)$/.test(segment)) {
          return { kind: "lineBreak" } satisfies LayoutLineBreakToken;
        }

        if (/^[^\S\r\n]+$/.test(segment)) {
          return {
            kind: "space",
            width: this.measureTextWidth(segment, isBold),
          } satisfies LayoutSpaceToken;
        }

        const label = this.createBodyText({
          type: "text",
          value: segment,
          isBold,
        });

        return {
          kind: "display",
          display: label,
          width: label.width,
          height: label.height,
        } satisfies LayoutDisplayToken;
      });
  }

  private createBodyText(part: DialogueTextPart): Text {
    return new Text({
      text: part.value,
      style: {
        ...this.textStyle,
        fontWeight: part.isBold ? "700" : (this.textStyle.fontWeight ?? "400"),
      },
    });
  }

  private createEmojiSprite(texture: Texture): Sprite {
    const sprite = new Sprite(texture);

    sprite.width = this.emojiSize;
    sprite.height = this.emojiSize;

    return sprite;
  }

  private measureTextWidth(text: string, isBold: boolean): number {
    const measurementLabel = this.createBodyText({
      type: "text",
      value: text,
      isBold,
    });
    const width = measurementLabel.width;

    measurementLabel.destroy();

    return width;
  }

  private createEmptyLine(): LayoutLine {
    return {
      items: [],
      width: 0,
      height: 0,
    };
  }
}
