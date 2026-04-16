export type DialogueAvatarPosition = "left" | "right";

export interface DialogueApiMessage {
  name: string;
  text: string;
}

export interface DialogueApiEmoji {
  name: string;
  url: string;
}

export interface DialogueApiAvatar {
  name: string;
  url: string;
  position: DialogueAvatarPosition;
}

export interface DialogueApiResponse {
  dialogue: DialogueApiMessage[];
  emojies: DialogueApiEmoji[];
  avatars: DialogueApiAvatar[];
}
