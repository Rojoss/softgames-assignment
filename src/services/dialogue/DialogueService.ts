import type { DialogueApiEmoji, DialogueApiResponse, DialogueAvatarPosition } from "@/services/dialogue/dialogueTypes";

const DEFAULT_AVATAR_POSITION: DialogueAvatarPosition = "left";
const DEFAULT_AVATAR_URL = "https://api.dicebear.com/9.x/personas/png?eyes=sunglasses&facialHair=beardMustache&facialHairProbability=100&seed=Aidan";
const EMOJI_PLACEHOLDER_PATTERN = /\{([^}]+)\}/g;
const BOLD_TEXT_PATTERN = /\*([^*]+)\*/g;

export interface DialogueEmoji {
  name: string;
  url: string;
}

export interface DialogueTextPart {
  type: "text";
  value: string;
  isBold?: boolean;
}

export interface DialogueEmojiPart {
  type: "emoji";
  name: string;
}

export type DialoguePart = DialogueTextPart | DialogueEmojiPart;

export interface DialogueStep {
  characterName: string;
  text: string;
  parts: DialoguePart[];
  avatarPosition: DialogueAvatarPosition;
  avatarUrl?: string;
}

/**
 * Stores dialogue progress and resolves each message to its avatar metadata.
 */
export class DialogueService {
  private readonly steps: DialogueStep[];
  private readonly emojis: DialogueEmoji[];
  private currentIndex: number | null;

  constructor(apiResponse: DialogueApiResponse) {
    const avatarsByName = new Map(apiResponse.avatars.map((avatar) => [avatar.name, avatar]));
    const emojisByName = new Map(apiResponse.emojies.map((emoji) => [emoji.name, emoji]));

    this.emojis = [...emojisByName.values()];

    this.steps = apiResponse.dialogue.map((message) => {
      const avatar = avatarsByName.get(message.name);

      return {
        characterName: message.name,
        text: message.text,
        parts: this.parseDialogueParts(message.text, emojisByName),
        avatarPosition: avatar?.position ?? DEFAULT_AVATAR_POSITION,
        avatarUrl: avatar?.url ?? DEFAULT_AVATAR_URL,
      };
    });

    this.currentIndex = this.steps.length > 0 ? 0 : null;
  }

  /**
   * Returns the currently active dialogue step.
   */
  public getCurrentDialogue(): DialogueStep | null {
    if (this.currentIndex === null) {
      return null;
    }

    return this.steps[this.currentIndex] ?? null;
  }

  /**
   * Advances to the next dialogue step.
   * When the sequence ends, it returns null once and restarts on the next call.
   */
  public goToNextDialogue(): DialogueStep | null {
    if (this.steps.length === 0) {
      return null;
    }

    if (this.currentIndex === null) {
      this.currentIndex = 0;

      return this.steps[this.currentIndex];
    }

    const nextIndex = this.currentIndex + 1;

    if (nextIndex >= this.steps.length) {
      this.currentIndex = null;

      return null;
    }

    this.currentIndex = nextIndex;

    return this.steps[this.currentIndex];
  }

  /**
   * Returns the unique avatar URLs used by the dialogue sequence.
   */
  public getAvatarUrls(): string[] {
    return [...new Set(this.steps.flatMap((step) => (step.avatarUrl ? [step.avatarUrl] : [])))];
  }

  /**
   * Returns the unique emojis available for the dialogue sequence.
   */
  public getEmojis(): DialogueEmoji[] {
    return this.emojis;
  }

  private parseDialogueParts(text: string, emojisByName: ReadonlyMap<string, DialogueApiEmoji>): DialoguePart[] {
    const parts: DialoguePart[] = [];
    let currentIndex = 0;

    for (const match of text.matchAll(EMOJI_PLACEHOLDER_PATTERN)) {
      const placeholder = match[0];
      const emojiName = match[1];
      const placeholderIndex = match.index ?? -1;

      if (placeholderIndex > currentIndex) {
        parts.push(...this.parseTextParts(text.slice(currentIndex, placeholderIndex)));
      }

      if (emojisByName.has(emojiName)) {
        parts.push({
          type: "emoji",
          name: emojiName,
        });
      }

      currentIndex = placeholderIndex + placeholder.length;

      if (!emojisByName.has(emojiName) && this.hasWhitespaceAroundPlaceholder(text, placeholderIndex, currentIndex)) {
        currentIndex += 1;
      }
    }

    if (currentIndex < text.length) {
      parts.push(...this.parseTextParts(text.slice(currentIndex)));
    }

    return this.normalizeDialogueParts(parts, text);
  }

  private normalizeDialogueParts(parts: DialoguePart[], originalText: string): DialoguePart[] {
    const normalizedParts: DialoguePart[] = [];

    parts.forEach((part) => {
      if (part.type === "text") {
        if (part.value.length === 0) {
          return;
        }

        const previousPart = normalizedParts[normalizedParts.length - 1];

        if (previousPart?.type === "text") {
          if (previousPart.isBold === part.isBold) {
            previousPart.value += part.value;

            return;
          }
        }
      }

      normalizedParts.push(part);
    });

    return normalizedParts.length > 0 ? normalizedParts : [{ type: "text", value: this.removeUnknownPlaceholders(originalText) }];
  }

  private removeUnknownPlaceholders(text: string): string {
    return text.replace(EMOJI_PLACEHOLDER_PATTERN, "");
  }

  private parseTextParts(text: string): DialogueTextPart[] {
    const parts: DialogueTextPart[] = [];
    let currentIndex = 0;

    for (const match of text.matchAll(BOLD_TEXT_PATTERN)) {
      const boldText = match[1];
      const matchIndex = match.index ?? -1;

      if (matchIndex > currentIndex) {
        parts.push({
          type: "text",
          value: text.slice(currentIndex, matchIndex),
        });
      }

      if (boldText.length > 0) {
        parts.push({
          type: "text",
          value: boldText,
          isBold: true,
        });
      }

      currentIndex = matchIndex + match[0].length;
    }

    if (currentIndex < text.length) {
      parts.push({
        type: "text",
        value: text.slice(currentIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", value: text }];
  }

  private hasWhitespaceAroundPlaceholder(text: string, placeholderStart: number, placeholderEnd: number): boolean {
    const characterBefore = placeholderStart > 0 ? text[placeholderStart - 1] : undefined;
    const characterAfter = placeholderEnd < text.length ? text[placeholderEnd] : undefined;

    return this.isWhitespace(characterBefore) && this.isWhitespace(characterAfter);
  }

  private isWhitespace(character: string | undefined): boolean {
    return character !== undefined && /\s/.test(character);
  }
}
