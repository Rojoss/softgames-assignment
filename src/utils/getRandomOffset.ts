import { Point } from "pixi.js";

import { getRandomInRange } from "@/utils/getRandomInRange";

export function getRandomOffset(range: number): Point {
  return new Point(getRandomInRange(-range, range), getRandomInRange(-range, range));
}
