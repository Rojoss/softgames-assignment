import { Scene } from "@/scenes/Scene";
import { SceneId } from "@/scenes/SceneId";
import type { SceneManager } from "@/services/scenes/SceneManager";

import { AceOfShadows } from "@/scenes/AceOfShadows/AceOfShadows";
import { MagicWords } from "@/scenes/MagicWords/MagicWords";
import { MainMenu } from "@/scenes/MainMenu/MainMenu";
import { PhoenixFlame } from "@/scenes/PhoenixFlame/PhoenixFlame";

type SceneFactory = (sceneManager: SceneManager) => Scene;

export const sceneFactories: Record<SceneId, SceneFactory> = {
  MainMenu: (sceneManager) => new MainMenu(sceneManager),
  AceOfShadows: (sceneManager) => new AceOfShadows(sceneManager),
  MagicWords: (sceneManager) => new MagicWords(sceneManager),
  PhoenixFlame: (sceneManager) => new PhoenixFlame(sceneManager),
};
