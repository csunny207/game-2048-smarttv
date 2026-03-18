import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { GameEngine, Direction } from "../../engine/GameEngine";
import { CanvasRenderer } from "../../renderer/CanvasRenderer";
import { StorageManager } from "../../managers/StorageManager";
import { InputHandler } from "../../managers/InputHandler";
import { CANVAS_SIZE, PLATFORM } from "../../constants/appConstant";
import {
  loadPersistedState,
  setBestScore as setBestScoreAction,
} from "../../slices/game-slice";
import "./game.scss";

type GameStatus = "playing" | "won" | "over";

const Game: React.FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine>(new GameEngine());
  const rendererRef = useRef<CanvasRenderer>(new CanvasRenderer());
  const inputRef = useRef<InputHandler>(new InputHandler());
  const gameEndRecordedRef = useRef<boolean>(false);

  const dispatch = useDispatch();

  const [score, setScore] = useState(0);
  const [bestScore, setBestScoreState] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [history, setHistory] = useState<
    Array<{ score: number; result: string; date: string }>
  >([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  // focusIndex: -1 = game (arrows move board), 0 = Restart, 1 = Reset, 2 = Up, 3 = Left, 4 = Down, 5 = Right
  const [focusIndex, setFocusIndex] = useState(-1);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitConfirmFocus, setExitConfirmFocus] = useState(0); // 0 = Cancel, 1 = OK

  const gameStatusRef = useRef<GameStatus>("playing");
  const focusIndexRef = useRef(-1);
  const showExitConfirmRef = useRef(false);
  const exitConfirmFocusRef = useRef(0);
  const bestScoreRef = useRef(0);

  const updateGameStatus = (status: GameStatus) => {
    gameStatusRef.current = status;
    setGameStatus(status);
  };

  const updateFocusIndex = (index: number) => {
    focusIndexRef.current = index;
    setFocusIndex(index);
  };

  const renderCanvas = useCallback(
    (
      grid: number[][],
      newTiles: Array<{ row: number; col: number }>,
      mergedCells: Array<{ row: number; col: number }>,
      gameOver: boolean,
      won: boolean,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      rendererRef.current.renderAnimated(
        ctx,
        grid,
        newTiles,
        mergedCells,
        gameOver,
        won,
      );
    },
    [],
  );

  const initGame = useCallback(() => {
    const engine = engineRef.current;
    const { grid, newTiles } = engine.init();
    setScore(0);
    updateGameStatus("playing");
    updateFocusIndex(-1);
    gameEndRecordedRef.current = false;
    renderCanvas(grid, newTiles, [], false, false);
  }, [renderCanvas]);

  const doMove = useCallback(
    (direction: Direction) => {
      const engine = engineRef.current;
      const result = engine.move(direction);
      if (!result.moved) return;

      setScore(result.score);

      if (result.score > bestScoreRef.current) {
        bestScoreRef.current = result.score;
        setBestScoreState(result.score);
        StorageManager.saveBestScore(result.score);
        dispatch(setBestScoreAction(result.score));
      }

      renderCanvas(
        result.grid,
        result.newTilePos ? [result.newTilePos] : [],
        result.mergedCells,
        result.gameOver,
        result.won,
      );

      if ((result.won || result.gameOver) && !gameEndRecordedRef.current) {
        gameEndRecordedRef.current = true;
        const resultStr = result.won ? "Win" : "Game Over";
        updateGameStatus(result.won ? "won" : "over");
        updateFocusIndex(0);

        const entry = {
          score: result.score,
          result: resultStr,
          date: new Date().toLocaleDateString(),
        };

        const newTotal = StorageManager.incrementTotalGames();
        StorageManager.addHistoryEntry(entry);
        setTotalGames(newTotal);
        setHistory(StorageManager.getHistory());
      }
    },
    [renderCanvas, dispatch],
  );

  const resetScoreboard = useCallback(() => {
    StorageManager.clearAll();
    setBestScoreState(0);
    bestScoreRef.current = 0;
    setTotalGames(0);
    setHistory([]);
    dispatch(loadPersistedState({ bestScore: 0, totalGames: 0, history: [] }));
  }, [dispatch]);

  const exitApp = useCallback(() => {
    try {
      if (PLATFORM === "LG") {
        window.close();
      } else if (PLATFORM === "Samsung") {
        window.tizen?.application.getCurrentApplication().exit();
      } else {
        window.history.back();
      }
    } catch {
      window.history.back();
    }
  }, []);

  const handleBack = useCallback(() => {
    if (showExitConfirmRef.current) {
      setShowExitConfirm(false);
      setExitConfirmFocus(0);
      exitConfirmFocusRef.current = 0;
    } else {
      setShowExitConfirm(true);
      setExitConfirmFocus(0);
      exitConfirmFocusRef.current = 0;
    }
  }, []);

  // Remote focus navigation: 0=Restart, 1=Reset, 2=Up, 3=Left, 4=Down, 5=Right
  const getNextFocusIndex = useCallback(
    (current: number, action: "up" | "down" | "left" | "right"): number => {
      if (current < 0 || current > 5) return current;
      switch (action) {
        case "up":
          if (current === 0 || current === 1) return -1;
          if (current === 2 || current === 3 || current === 5) return 0;
          return 2; // 4 -> 2
        case "down":
          if (current === 0 || current === 1) return 2;
          if (current === 2) return 4;
          if (current === 4) return 0;
          return 4; // 3,5 -> 4
        case "left":
          if (current === 0) return -1;
          if (current === 1) return 0;
          if (current === 3) return 2;
          if (current === 4) return 3;
          if (current === 5) return 4;
          return 1; // 2 -> 1
        case "right":
          if (current === 0) return 1;
          if (current === 1) return 2;
          if (current === 2) return 3;
          if (current === 3) return 4;
          if (current === 5) return 1;
          return 5; // 4 -> 5
        default:
          return current;
      }
    },
    [],
  );

  useEffect(() => {
    showExitConfirmRef.current = showExitConfirm;
  }, [showExitConfirm]);

  useEffect(() => {
    const persisted = StorageManager.loadAll();
    setBestScoreState(persisted.bestScore);
    bestScoreRef.current = persisted.bestScore;
    setTotalGames(persisted.totalGames);
    setHistory(persisted.history);
    dispatch(loadPersistedState(persisted));

    const timer = setTimeout(() => {
      initGame();
    }, 50);

    const onKeyDown = (e: KeyboardEvent) => {
      const action = inputRef.current.mapKeyToAction(e.keyCode);
      if (!action) return;
      e.preventDefault();

      if (action === "back") {
        if (showExitConfirmRef.current) {
          setShowExitConfirm(false);
          setExitConfirmFocus(0);
          exitConfirmFocusRef.current = 0;
        } else if (focusIndexRef.current === -1) {
          updateFocusIndex(0);
        } else {
          setShowExitConfirm(true);
          setExitConfirmFocus(0);
          exitConfirmFocusRef.current = 0;
        }
        return;
      }

      if (showExitConfirmRef.current) {
        if (action === "left" || action === "right") {
          const next = exitConfirmFocusRef.current === 0 ? 1 : 0;
          setExitConfirmFocus(next);
          exitConfirmFocusRef.current = next;
        } else if (action === "enter") {
          if (exitConfirmFocusRef.current === 0) {
            setShowExitConfirm(false);
            exitConfirmFocusRef.current = 0;
          } else {
            exitApp();
          }
        }
        return;
      }

      const currentFocus = focusIndexRef.current;

      // When focus is on UI (0..5), arrows navigate between buttons; Enter activates
      if (currentFocus >= 0 && currentFocus <= 5) {
        if (action === "enter") {
          if (currentFocus === 0) initGame();
          else if (currentFocus === 1) resetScoreboard();
          else if (currentFocus === 2) doMove("up");
          else if (currentFocus === 3) doMove("left");
          else if (currentFocus === 4) doMove("down");
          else if (currentFocus === 5) doMove("right");
          return;
        }
        if (
          action === "left" ||
          action === "right" ||
          action === "up" ||
          action === "down"
        ) {
          const next = getNextFocusIndex(
            currentFocus,
            action as "up" | "down" | "left" | "right",
          );
          if (next !== currentFocus) {
            updateFocusIndex(next);
          }
        }
        return;
      }

      // Focus -1 (game area): Back moves to buttons; when playing, all arrows move board
      if (currentFocus === -1) {
        if (gameStatusRef.current === "playing") {
          if (
            action === "left" ||
            action === "right" ||
            action === "up" ||
            action === "down"
          ) {
            if (!inputRef.current.shouldThrottle()) {
              doMove(action as Direction);
            }
          }
        }
        return;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [initGame, doMove, resetScoreboard, exitApp, getNextFocusIndex, dispatch]);

  const onDirClick = useCallback(
    (dir: Direction) => {
      if (gameStatusRef.current === "playing") {
        doMove(dir);
      }
    },
    [doMove],
  );

  return (
    <div className="game">
      {/* ---- Left Panel: Game ---- */}
      <div className="game-left-panel">
        <div className="game-title">2048</div>

        <div className="game-score-bar">
          <div className="game-score-box">
            <div className="game-score-label">SCORE</div>
            <div className="game-score-value">{score}</div>
          </div>
          <div className="game-score-box">
            <div className="game-score-label">BEST</div>
            <div className="game-score-value">{bestScore}</div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="game-canvas"
        />

        {gameStatus !== "playing" && (
          <div
            className={`game-status-text game-status-text--${gameStatus === "won" ? "won" : "over"}`}
          >
            {gameStatus === "won" ? "You Win!" : "Game Over!"}
          </div>
        )}

        <div className="game-button-row">
          <button
            type="button"
            tabIndex={-1}
            className={`game-btn ${focusIndex === 0 ? "game-btn--focused" : ""}`}
            onClick={() => initGame()}
          >
            Restart Game
          </button>
          <button
            type="button"
            tabIndex={-1}
            className={`game-btn ${focusIndex === 1 ? "game-btn--focused" : ""}`}
            onClick={() => resetScoreboard()}
          >
            Reset Scoreboard
          </button>
        </div>

        {/* Direction buttons (remote focus: indices 2=Up, 3=Left, 4=Down, 5=Right) */}
        <div className="game-dir-controls">
          <div className="game-dir-row-center">
            <button
              type="button"
              className={`game-dir-btn ${focusIndex === 2 ? "game-dir-btn--focused" : ""}`}
              onClick={() => onDirClick("up")}
              tabIndex={-1}
            >
              ▲
            </button>
          </div>
          <div className="game-dir-row-center">
            <button
              type="button"
              className={`game-dir-btn ${focusIndex === 3 ? "game-dir-btn--focused" : ""}`}
              onClick={() => onDirClick("left")}
              tabIndex={-1}
            >
              ◄
            </button>
            <button
              type="button"
              className={`game-dir-btn ${focusIndex === 4 ? "game-dir-btn--focused" : ""}`}
              onClick={() => onDirClick("down")}
              tabIndex={-1}
            >
              ▼
            </button>
            <button
              type="button"
              className={`game-dir-btn ${focusIndex === 5 ? "game-dir-btn--focused" : ""}`}
              onClick={() => onDirClick("right")}
              tabIndex={-1}
            >
              ►
            </button>
          </div>
        </div>

        <div className="game-hint">
          Back: Game→Buttons, Buttons→Exit &nbsp;|&nbsp; Arrows: Move/Navigate
          &nbsp;|&nbsp; Enter: Select
        </div>
      </div>

      {/* Exit confirmation popup */}
      {showExitConfirm && (
        <div className="game-exit-overlay">
          <div className="game-exit-popup">
            <p className="game-exit-message">Do you want to leave the Game?</p>
            <div className="game-exit-buttons">
              <button
                type="button"
                className={`game-exit-btn ${exitConfirmFocus === 0 ? "game-exit-btn--focused" : ""}`}
                onClick={() => {
                  setShowExitConfirm(false);
                  exitConfirmFocusRef.current = 0;
                }}
                onFocus={() => {
                  setExitConfirmFocus(0);
                  exitConfirmFocusRef.current = 0;
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`game-exit-btn game-exit-btn--ok ${exitConfirmFocus === 1 ? "game-exit-btn--focused" : ""}`}
                onClick={() => exitApp()}
                onFocus={() => {
                  setExitConfirmFocus(1);
                  exitConfirmFocusRef.current = 1;
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Right Panel: Scoreboard ---- */}
      <div className="game-right-panel">
        <div className="game-panel-title">SCOREBOARD</div>

        <div className="game-stat-row">
          <span className="game-stat-label">Games Played</span>
          <span className="game-stat-value">{totalGames}</span>
        </div>

        <div className="game-divider" />

        <div className="game-history-title">GAME HISTORY</div>

        <div className="game-history-list">
          {history.length === 0 && (
            <div className="game-history-empty">No games played yet</div>
          )}
          {history.map(
            (
              entry: { score: number; result: string; date: string },
              i: number,
            ) => (
              <div key={i} className="game-history-item">
                <span className="game-history-index">#{i + 1}</span>
                <span className="game-history-score">Score: {entry.score}</span>
                <span
                  className={`game-history-result game-history-result--${entry.result === "Win" ? "win" : "lose"}`}
                >
                  {entry.result}
                </span>
                <span className="game-history-date">{entry.date}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
