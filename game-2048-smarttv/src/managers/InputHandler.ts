import { platformTvKeysMeth } from "../helper/tvKey";
import { INPUT_THROTTLE_MS } from "../constants/appConstant";

export type GameAction = "left" | "right" | "up" | "down" | "enter" | "back";

export class InputHandler {
  private tvKeys: any;
  private lastInputTime: number = 0;
  private throttleMs: number;

  constructor(throttleMs: number = INPUT_THROTTLE_MS) {
    this.tvKeys = platformTvKeysMeth();
    this.throttleMs = throttleMs;
  }

  mapKeyToAction(keyCode: number): GameAction | null {
    const k = this.tvKeys;

    if (keyCode === k.KEY_LEFT) return "left";
    if (keyCode === k.KEY_RIGHT) return "right";
    if (keyCode === k.KEY_UP) return "up";
    if (keyCode === k.KEY_DOWN) return "down";
    if (keyCode === k.KEY_ENTER) return "enter";
    if (
      keyCode === k.KEY_RETURN ||
      keyCode === k.KEY_BACK ||
      keyCode === k.KEY_EXIT
    )
      return "back";

    return null;
  }

  shouldThrottle(): boolean {
    const now = Date.now();
    if (now - this.lastInputTime < this.throttleMs) return true;
    this.lastInputTime = now;
    return false;
  }
}
