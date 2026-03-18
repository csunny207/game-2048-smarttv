import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HistoryEntry {
  score: number;
  result: string;
  date: string;
}

interface GamePersistState {
  bestScore: number;
  totalGames: number;
  history: HistoryEntry[];
}

const initialState: GamePersistState = {
  bestScore: 0,
  totalGames: 0,
  history: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    loadPersistedState(_, action: PayloadAction<GamePersistState>) {
      return action.payload;
    },
    setBestScore(state, action: PayloadAction<number>) {
      state.bestScore = action.payload;
    },
    incrementTotalGames(state) {
      state.totalGames += 1;
    },
    addHistoryEntry(state, action: PayloadAction<HistoryEntry>) {
      state.history.unshift(action.payload);
      if (state.history.length > 10) {
        state.history = state.history.slice(0, 10);
      }
    },
    resetStats() {
      return { ...initialState };
    },
  },
});

export const {
  loadPersistedState,
  setBestScore,
  incrementTotalGames,
  addHistoryEntry,
  resetStats,
} = gameSlice.actions;

export const gameReducer = gameSlice.reducer;
