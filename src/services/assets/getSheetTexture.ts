import type { SheetId } from "@/services/assets/sceneAssets";
import { Assets, Spritesheet, Texture } from "pixi.js";

function getFallbackTexture(): Texture {
  const fallbackTexture = Assets.get<Texture>("error-texture");

  if (!fallbackTexture) {
    console.error(new Error('Missing fallback texture: "error-texture".'));

    return Texture.WHITE;
  }

  return fallbackTexture;
}

/**
 * Get a texture from a loaded spritesheet.
 * Returns a fallback error texture if the sheet or texture is missing.
 *
 * @param sheetId The sheet ID as defined in sceneAssets.ts. This should correspond to a loaded spritesheet bundle.
 * @param textureId The texture ID as defined in the spritesheet JSON file. This is typically the filename of the individual sprite within the sheet.
 */
export function getSheetTexture(sheetId: SheetId, textureId: string): Texture {
  try {
    const spritesheet = Assets.get<Spritesheet>(sheetId);

    if (!spritesheet) {
      throw new Error(`Missing spritesheet: ${sheetId}`);
    }

    const texture = spritesheet.textures[textureId];

    if (!texture) {
      throw new Error(`Missing texture "${textureId}" in spritesheet "${sheetId}".`);
    }

    return texture;
  } catch (error: unknown) {
    console.error(error);

    return getFallbackTexture();
  }
}
