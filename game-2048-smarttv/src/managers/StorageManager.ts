import { STORAGE_KEYS } from "../constants/appConstant";

export interface HistoryEntry {
  score: number;
  result: string;
  date: string;
}

const MAX_HISTORY = 10;

export class StorageManager {
  static saveBestScore(score: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(score));
    } catch (e) {
      /* TV storage may be unavailable */
    }
  }

  static getBestScore(): number {
    try {
      return parseInt(
        localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || "0",
        10
      );
    } catch {
      return 0;
    }
  }

  static getTotalGames(): number {
    try {
      return parseInt(
        localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES) || "0",
        10
      );
    } catch {
      return 0;
    }
  }

  static incrementTotalGames(): number {
    const total = this.getTotalGames() + 1;
    try {
      localStorage.setItem(STORAGE_KEYS.TOTAL_GAMES, String(total));
    } catch (e) {
      /* noop */
    }
    return total;
  }

  static getHistory(): HistoryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addHistoryEntry(entry: HistoryEntry): void {
    const history = this.getHistory();
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
    } catch (e) {
      /* noop */
    }
  }

  static loadAll(): {
    bestScore: number;
    totalGames: number;
    history: HistoryEntry[];
  } {
    return {
      bestScore: this.getBestScore(),
      totalGames: this.getTotalGames(),
      history: this.getHistory(),
    };
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.BEST_SCORE);
      localStorage.removeItem(STORAGE_KEYS.TOTAL_GAMES);
      localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    } catch (e) {
      /* noop */
    }
  }
}
