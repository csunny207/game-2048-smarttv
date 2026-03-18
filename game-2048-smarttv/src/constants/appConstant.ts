export const PLATFORM = "LG";

export const APP_VERSION = "1.0.0";
export const SPLASH_TIME = 2000;
export const GRID_SIZE = 4;
export const WIN_VALUE = 2048;
export const ANIMATION_DURATION = 150;
export const INPUT_THROTTLE_MS = 150;

export const CANVAS_SIZE = 660;
export const CELL_SIZE = 150;
export const CELL_GAP = 12;
export const CELL_PADDING = 12;
export const CELL_RADIUS = 8;

export const STORAGE_KEYS = {
  BEST_SCORE: "game2048_bestScore",
  TOTAL_GAMES: "game2048_totalGames",
  GAME_HISTORY: "game2048_history",
};

export const PLATFORM_TYPE = {
  TIZEN: "samsung",
  LG: "lg",
};

export const TILE_COLORS: Record<number, string> = {
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
};

export const TILE_TEXT_DARK = "#776e65";
export const TILE_TEXT_LIGHT = "#f9f6f2";
export const GRID_BG_COLOR = "#bbada0";
export const EMPTY_CELL_COLOR = "rgba(238, 228, 218, 0.35)";
