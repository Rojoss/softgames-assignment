import { Scene } from "@/scenes/Scene";
import { destroyRemoteTextureMap, loadRemoteTextureMap, RemoteTextureLoader } from "@/services/assets/RemoteTextureLoader";
import { DialogueApiService } from "@/services/dialogue/DialogueApiService";
import { type DialogueStep, DialogueService } from "@/services/dialogue/DialogueService";
import { VIEWPORT_HEIGHT } from "@/services/window/AutoScaler";
import { VIEWPORT_WIDTH } from "@/services/window/AutoScaler";
import type { SceneManager } from "@/services/scenes/SceneManager";
import { BackButton } from "@/ui/BackButton";
import { FederatedPointerEvent, Rectangle, Text, Texture } from "pixi.js";
import { DialoguePresentation } from "@/scenes/MagicWords/DialoguePresentation";

export class MagicWords extends Scene {
  private readonly dialogueApiService = new DialogueApiService();
  private readonly remoteTextureLoader = new RemoteTextureLoader();
  private readonly dialoguePresentation = new DialoguePresentation();
  private readonly sceneHint = new Text({
    text: "Tap anywhere to continue",
    style: {
      fill: 0x3d405b,
      fontFamily: "Trebuchet MS",
      fontSize: 24,
      fontWeight: "700",
      letterSpacing: 1,
    },
  });

  private readonly avatarTextures = new Map<string, Texture>();
  private readonly emojiTextures = new Map<string, Texture>();

  private dialogueService?: DialogueService;

  constructor(sceneManager: SceneManager) {
    super(sceneManager);
  }

  protected async load(): Promise<void> {
    this.eventMode = "static";
    this.cursor = "pointer";
    this.hitArea = new Rectangle(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    const backButton = new BackButton();
    backButton.position.set(VIEWPORT_WIDTH / 2, 48 + (BackButton.HEIGHT + BackButton.SHADOW_OFFSET_Y) / 2);
    backButton.on("pointertap", (event: FederatedPointerEvent) => {
      event.stopPropagation();
      void this.sceneManager.switchTo("MainMenu");
    });

    this.sceneHint.anchor.set(0.5);
    this.sceneHint.position.set(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT - 56);

    this.addChild(this.dialoguePresentation, this.sceneHint, backButton);

    const dialogueData = await this.dialogueApiService.fetchDialogue();

    this.dialogueService = new DialogueService(dialogueData);

    await Promise.all([
      loadRemoteTextureMap(
        this.remoteTextureLoader,
        this.dialogueService.getAvatarUrls().map((avatarUrl) => ({
          key: avatarUrl,
          url: avatarUrl,
        })),
        this.avatarTextures,
        "avatar",
      ),
      loadRemoteTextureMap(
        this.remoteTextureLoader,
        this.dialogueService.getEmojis().map((emoji) => ({
          key: emoji.name,
          url: emoji.url,
        })),
        this.emojiTextures,
        "emoji",
      ),
    ]);

    this.renderDialogue(this.dialogueService.getCurrentDialogue());
    this.on("pointertap", this.handleSceneTap);

    return Promise.resolve();
  }

  protected override unload(): void {
    this.off("pointertap", this.handleSceneTap);
    this.dialoguePresentation.reset();
    destroyRemoteTextureMap(this.avatarTextures);
    destroyRemoteTextureMap(this.emojiTextures);
  }

  private readonly handleSceneTap = (): void => {
    if (!this.dialogueService) {
      return;
    }

    this.renderDialogue(this.dialogueService.goToNextDialogue());
  };

  private renderDialogue(step: DialogueStep | null): void {
    if (!step) {
      this.dialoguePresentation.clearDialogue();
      return;
    }

    const avatarTexture = step.avatarUrl ? (this.avatarTextures.get(step.avatarUrl) ?? null) : null;

    this.dialoguePresentation.showDialogue(step, avatarTexture, this.emojiTextures);
  }
}
