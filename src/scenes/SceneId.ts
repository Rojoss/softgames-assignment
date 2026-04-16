export const SCENE_IDS = [
  "MainMenu",
  "AceOfShadows",
  "MagicWords",
  "PhoenixFlame",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];
