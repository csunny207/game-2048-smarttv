export type Direction = "left" | "right" | "up" | "down";

export interface MoveResult {
  grid: number[][];
  score: number;
  scoreGained: number;
  moved: boolean;
  won: boolean;
  gameOver: boolean;
  newTilePos: { row: number; col: number } | null;
  mergedCells: Array<{ row: number; col: number }>;
}

interface SlideResult {
  tiles: number[];
  scoreGained: number;
  mergedIndices: number[];
}

export class GameEngine {
  private grid: number[][];
  private score: number;
  private won: boolean;
  private over: boolean;

  constructor() {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.won = false;
    this.over = false;
  }

  private createEmptyGrid(): number[][] {
    return Array.from({ length: 4 }, () => Array(4).fill(0));
  }

  init(): { grid: number[][]; newTiles: Array<{ row: number; col: number }> } {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.won = false;
    this.over = false;

    const newTiles: Array<{ row: number; col: number }> = [];
    const t1 = this.addRandomTile();
    const t2 = this.addRandomTile();
    if (t1) newTiles.push(t1);
    if (t2) newTiles.push(t2);

    return { grid: this.grid.map((r) => [...r]), newTiles };
  }

  addRandomTile(): { row: number; col: number } | null {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) {
          emptyCells.push([r, c]);
        }
      }
    }
    if (emptyCells.length === 0) return null;

    const [row, col] =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    return { row, col };
  }

  private slideRow(row: number[]): SlideResult {
    const filtered = row.filter((v) => v !== 0);
    let scoreGained = 0;
    const tiles: number[] = [];
    const mergedIndices: number[] = [];

    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const val = filtered[i] * 2;
        mergedIndices.push(tiles.length);
        tiles.push(val);
        scoreGained += val;
        i += 2;
      } else {
        tiles.push(filtered[i]);
        i++;
      }
    }

    while (tiles.length < 4) {
      tiles.push(0);
    }

    return { tiles, scoreGained, mergedIndices };
  }

  private arraysEqual(a: number[], b: number[]): boolean {
    return a.every((v, i) => v === b[i]);
  }

  move(direction: Direction): MoveResult {
    const mergedCells: Array<{ row: number; col: number }> = [];
    let scoreGained = 0;
    let moved = false;

    if (direction === "left" || direction === "right") {
      for (let r = 0; r < 4; r++) {
        let row = [...this.grid[r]];
        if (direction === "right") row.reverse();

        const result = this.slideRow(row);

        let finalRow = result.tiles;
        if (direction === "right") {
          finalRow = [...result.tiles].reverse();
          for (const idx of result.mergedIndices) {
            mergedCells.push({ row: r, col: 3 - idx });
          }
        } else {
          for (const idx of result.mergedIndices) {
            mergedCells.push({ row: r, col: idx });
          }
        }

        if (!this.arraysEqual(this.grid[r], finalRow)) {
          moved = true;
        }
        this.grid[r] = finalRow;
        scoreGained += result.scoreGained;
      }
    } else {
      for (let c = 0; c < 4; c++) {
        let col = [
          this.grid[0][c],
          this.grid[1][c],
          this.grid[2][c],
          this.grid[3][c],
        ];
        if (direction === "down") col.reverse();

        const result = this.slideRow(col);

        let finalCol = result.tiles;
        if (direction === "down") {
          finalCol = [...result.tiles].reverse();
          for (const idx of result.mergedIndices) {
            mergedCells.push({ row: 3 - idx, col: c });
          }
        } else {
          for (const idx of result.mergedIndices) {
            mergedCells.push({ row: idx, col: c });
          }
        }

        const prevCol = [
          this.grid[0][c],
          this.grid[1][c],
          this.grid[2][c],
          this.grid[3][c],
        ];
        if (!this.arraysEqual(prevCol, finalCol)) {
          moved = true;
        }
        for (let r = 0; r < 4; r++) {
          this.grid[r][c] = finalCol[r];
        }
        scoreGained += result.scoreGained;
      }
    }

    let newTilePos: { row: number; col: number } | null = null;
    if (moved) {
      newTilePos = this.addRandomTile();
      this.score += scoreGained;

      if (!this.won) {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (this.grid[r][c] >= 2048) {
              this.won = true;
              break;
            }
          }
          if (this.won) break;
        }
      }

      if (!this.canMove()) {
        this.over = true;
      }
    }

    return {
      grid: this.grid.map((r) => [...r]),
      score: this.score,
      scoreGained,
      moved,
      won: this.won,
      gameOver: this.over,
      newTilePos,
      mergedCells,
    };
  }

  canMove(): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) return true;
      }
    }
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.grid[r][c];
        if (c + 1 < 4 && this.grid[r][c + 1] === val) return true;
        if (r + 1 < 4 && this.grid[r + 1][c] === val) return true;
      }
    }
    return false;
  }

  getGrid(): number[][] {
    return this.grid.map((r) => [...r]);
  }

  getState(): {
    grid: number[][];
    score: number;
    won: boolean;
    gameOver: boolean;
  } {
    return {
      grid: this.grid.map((r) => [...r]),
      score: this.score,
      won: this.won,
      gameOver: this.over,
    };
  }
}
