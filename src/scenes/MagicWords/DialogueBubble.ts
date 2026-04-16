import { getSheetTexture } from "@/services/assets/getSheetTexture";
import type { DialoguePart } from "@/services/dialogue/DialogueService";
import { InlineEmojiText } from "@/ui/InlineEmojiText";
import { Container, NineSliceSprite, Text, Texture } from "pixi.js";

export class DialogueBubble extends Container {
  public static readonly WIDTH = 760;
  public static readonly MIN_HEIGHT = 180;
  private static readonly SPEACH_BUBBLE_SLICE_SIZE = 75;
  private static readonly TEXT_LEFT = 72;
  private static readonly TEXT_TOP = 32;
  private static readonly TEXT_RIGHT = 48;
  private static readonly TEXT_BOTTOM = 36;
  private static readonly NAME_TO_BODY_GAP = 20;
  private static readonly BODY_WRAP_WIDTH = DialogueBubble.WIDTH - DialogueBubble.TEXT_LEFT - DialogueBubble.TEXT_RIGHT;

  private readonly background: NineSliceSprite;
  private readonly nameLabel: Text;
  private readonly bodyContent = new InlineEmojiText({
    textStyle: {
      fill: 0x1f2933,
      fontFamily: "Trebuchet MS",
      fontSize: 28,
      fontWeight: "400",
      lineHeight: 40,
    },
    wrapWidth: DialogueBubble.BODY_WRAP_WIDTH,
    lineHeight: 40,
    emojiSize: 34,
  });

  constructor() {
    super();

    this.background = new NineSliceSprite({
      texture: getSheetTexture("MagicWords", "speach-bubble.png"),
      leftWidth: DialogueBubble.SPEACH_BUBBLE_SLICE_SIZE,
      rightWidth: DialogueBubble.SPEACH_BUBBLE_SLICE_SIZE,
      bottomHeight: DialogueBubble.SPEACH_BUBBLE_SLICE_SIZE,
      topHeight: DialogueBubble.SPEACH_BUBBLE_SLICE_SIZE,
      width: DialogueBubble.WIDTH,
      height: DialogueBubble.MIN_HEIGHT,
    });

    this.nameLabel = new Text({
      text: "",
      style: {
        fill: 0x3d405b,
        fontFamily: "Trebuchet MS",
        fontSize: 32,
        fontWeight: "700",
      },
    });
    this.nameLabel.position.set(DialogueBubble.TEXT_LEFT, DialogueBubble.TEXT_TOP);

    this.visible = false;
    this.addChild(this.background, this.nameLabel, this.bodyContent);
  }

  public setDialogue(characterName: string, parts: DialoguePart[], emojiTextures: ReadonlyMap<string, Texture>, hasArrowOnLeft: boolean): void {
    this.visible = true;
    this.background.x = hasArrowOnLeft ? 0 : DialogueBubble.WIDTH;
    this.background.scale.x = hasArrowOnLeft ? 1 : -1;
    this.nameLabel.text = characterName;

    const bodyTop = this.nameLabel.y + this.nameLabel.height + DialogueBubble.NAME_TO_BODY_GAP;

    this.bodyContent.position.set(DialogueBubble.TEXT_LEFT, bodyTop);
    this.bodyContent.setContent(parts, emojiTextures);

    const bodyHeight = this.bodyContent.contentHeight;

    const contentHeight = bodyTop + bodyHeight + DialogueBubble.TEXT_BOTTOM;

    this.background.height = Math.max(DialogueBubble.MIN_HEIGHT, Math.ceil(contentHeight));
  }

  public clear(): void {
    this.visible = false;
    this.bodyContent.clear();
    this.nameLabel.text = "";
  }
}
