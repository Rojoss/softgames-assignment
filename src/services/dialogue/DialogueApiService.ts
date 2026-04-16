import type { DialogueApiAvatar, DialogueApiEmoji, DialogueApiResponse } from "@/services/dialogue/dialogueTypes";

const MAGIC_WORDS_API_URL = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords";

/**
 * Fetches the remote Magic Words dialogue payload.
 */
export class DialogueApiService {
  public async fetchDialogue(): Promise<DialogueApiResponse> {
    const response = await fetch(MAGIC_WORDS_API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch dialogue data: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DialogueApiResponse;

    return {
      ...data,
      emojies: data.emojies.map((emoji) => this.sanitizeEmoji(emoji)),
      avatars: data.avatars.map((avatar) => this.sanitizeAvatar(avatar)),
    };
  }

  private sanitizeEmoji(emoji: DialogueApiEmoji): DialogueApiEmoji {
    return {
      ...emoji,
      url: this.sanitizeRemoteImageUrl(emoji.url),
    };
  }

  private sanitizeAvatar(avatar: DialogueApiAvatar): DialogueApiAvatar {
    return {
      ...avatar,
      url: this.sanitizeRemoteImageUrl(avatar.url),
    };
  }

  private sanitizeRemoteImageUrl(urlString: string): string {
    try {
      const url = new URL(urlString);

      if (url.hostname === "api.dicebear.com") {
        url.port = "";
      }

      return url.toString();
    } catch {
      return urlString;
    }
  }
}
