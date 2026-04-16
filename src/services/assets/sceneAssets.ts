import type { SceneId } from "@/services/scenes/SceneId";

export const SHEET_IDS = ["AceOfShadows"] as const;

export type SheetId = (typeof SHEET_IDS)[number];

export interface AssetDefinition {
  alias: string | string[];
  src: string | string[];
  data?: Record<string, unknown>;
}

const sharedAssets: AssetDefinition[] = [
  {
    alias: "error",
    src: "/assets/error.png",
  },
];

export const sceneAssets: Record<SceneId, AssetDefinition[]> = {
  MainMenu: [...sharedAssets],
  AceOfShadows: [
    ...sharedAssets,
    {
      alias: "AceOfShadows",
      src: "/assets/ace-of-shadows/ace-of-shadows-0.json",
    },
  ],
  MagicWords: [...sharedAssets],
  PhoenixFlame: [...sharedAssets],
};
