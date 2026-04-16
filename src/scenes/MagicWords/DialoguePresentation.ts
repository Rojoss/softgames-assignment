import { AvatarPortrait } from "@/scenes/MagicWords/AvatarPortrait";
import { DialogueBubble } from "@/scenes/MagicWords/DialogueBubble";
import { MagicWordsAnimator } from "@/scenes/MagicWords/MagicWordsAnimator";
import type { DialogueStep } from "@/services/dialogue/DialogueService";
import { TweenManager } from "@/services/tweens/TweenManager";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/services/window/AutoScaler";
import { Container, Texture } from "pixi.js";

/**
 * Owns the avatar, speech bubble, layout, and transition animation for a dialogue step.
 */
export class DialoguePresentation extends Container {
  private static readonly AVATAR_MARGIN_X = 180;
  private static readonly AVATAR_TOP = VIEWPORT_HEIGHT - AvatarPortrait.HEIGHT - 180;
  private static readonly BUBBLE_GAP = 20;
  private static readonly BUBBLE_OFFSET_Y = 10;
  private static readonly BUBBLE_TWEEN_DELAY_MS = 55;

  private readonly avatarPortrait = new AvatarPortrait();
  private readonly dialogueBubble = new DialogueBubble();
  private readonly animator = new MagicWordsAnimator(TweenManager.shared);

  constructor() {
    super();

    this.addChild(this.avatarPortrait, this.dialogueBubble);
  }

  public showDialogue(step: DialogueStep, avatarTexture: Texture | null, emojiTextures: ReadonlyMap<string, Texture>): void {
    this.animator.clear();

    const isLeftAligned = step.avatarPosition === "left";
    const motionDirection = isLeftAligned ? -1 : 1;
    const avatarX = isLeftAligned
      ? DialoguePresentation.AVATAR_MARGIN_X
      : VIEWPORT_WIDTH - DialoguePresentation.AVATAR_MARGIN_X - AvatarPortrait.WIDTH;
    const bubbleX = isLeftAligned
      ? avatarX + AvatarPortrait.WIDTH + DialoguePresentation.BUBBLE_GAP
      : avatarX - DialoguePresentation.BUBBLE_GAP - DialogueBubble.WIDTH;
    const bubbleY = DialoguePresentation.AVATAR_TOP + DialoguePresentation.BUBBLE_OFFSET_Y;

    this.avatarPortrait.position.set(avatarX, DialoguePresentation.AVATAR_TOP);
    this.avatarPortrait.setAvatar(avatarTexture);

    this.dialogueBubble.position.set(bubbleX, bubbleY);
    this.dialogueBubble.setDialogue(step.characterName, step.parts, emojiTextures, isLeftAligned);

    this.animator.animateIn({
      target: this.avatarPortrait,
      finalX: avatarX,
      finalY: DialoguePresentation.AVATAR_TOP,
      direction: motionDirection,
    });
    this.animator.animateIn({
      target: this.dialogueBubble,
      finalX: bubbleX,
      finalY: bubbleY,
      direction: motionDirection,
      delay: DialoguePresentation.BUBBLE_TWEEN_DELAY_MS,
    });
  }

  public clearDialogue(): void {
    this.animator.clear();

    this.animator.animateOut({
      target: this.avatarPortrait,
      direction: -1,
      onComplete: () => {
        this.avatarPortrait.clear();
      },
    });
    this.animator.animateOut({
      target: this.dialogueBubble,
      direction: 1,
      onComplete: () => {
        this.dialogueBubble.clear();
      },
    });
  }

  public reset(): void {
    this.animator.clear();
    this.avatarPortrait.clear();
    this.dialogueBubble.clear();
  }
}
