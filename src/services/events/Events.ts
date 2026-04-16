import { EventBus } from "@/services/events/EventBus";
import type { SceneId } from "@/services/scenes/SceneId";

export type SceneEvent = {
  sceneId: SceneId;
};

export type Events = {
  pause: void;
  resume: void;
  fpsUpdate: number;
  sceneOpen: SceneEvent;
  sceneClose: SceneEvent;
};

export const eventBus = new EventBus<Events>();
