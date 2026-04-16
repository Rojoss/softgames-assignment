import { Texture } from "pixi.js";

export interface RemoteTextureSource {
  key: string;
  url: string;
}

/**
 * Loads remote images into Pixi textures.
 * This is used for API-driven image URLs that do not match Pixi's asset resolver patterns.
 */
export class RemoteTextureLoader {
  public loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => {
        resolve(Texture.from(image));
      };
      image.onerror = () => {
        reject(new Error(`Failed to load remote texture: ${url}`));
      };
      image.src = url;
    });
  }
}

/**
 * Loads a keyed set of remote textures into an existing map.
 */
export async function loadRemoteTextureMap(
  loader: RemoteTextureLoader,
  sources: RemoteTextureSource[],
  targetTextures: Map<string, Texture>,
  assetLabel: string,
): Promise<void> {
  const textureEntries = await Promise.all(
    sources.map(async ({ key, url }) => {
      try {
        const texture = await loader.loadTexture(url);

        return [key, texture] as const;
      } catch (error: unknown) {
        console.error(`Failed to load ${assetLabel} texture: ${key}`, error);

        return null;
      }
    }),
  );

  textureEntries.forEach((entry) => {
    if (!entry) {
      return;
    }

    const [key, texture] = entry;

    targetTextures.set(key, texture);
  });
}

/**
 * Destroys all textures in a keyed texture map and clears it.
 */
export function destroyRemoteTextureMap(textures: Map<string, Texture>): void {
  textures.forEach((texture) => {
    texture.destroy(true);
  });

  textures.clear();
}
