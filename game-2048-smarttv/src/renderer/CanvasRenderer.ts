import {
  CANVAS_SIZE,
  CELL_SIZE,
  CELL_GAP,
  CELL_PADDING,
  CELL_RADIUS,
  TILE_COLORS,
  TILE_TEXT_DARK,
  TILE_TEXT_LIGHT,
  GRID_BG_COLOR,
  EMPTY_CELL_COLOR,
  ANIMATION_DURATION,
} from "../constants/appConstant";

export class CanvasRenderer {
  private animFrameId = 0;

  render(
    ctx: CanvasRenderingContext2D,
    grid: number[][],
    gameOver: boolean,
    won: boolean
  ): void {
    this.cancelAnimation();
    this.drawFrame(ctx, grid, {});
    if (gameOver) this.drawOverlay(ctx, "Game Over!");
    else if (won) this.drawOverlay(ctx, "You Win!");
  }

  renderAnimated(
    ctx: CanvasRenderingContext2D,
    grid: number[][],
    newTiles: Array<{ row: number; col: number }>,
    mergedCells: Array<{ row: number; col: number }>,
    gameOver: boolean,
    won: boolean
  ): void {
    this.cancelAnimation();

    const startTime = performance.now();
    const duration = ANIMATION_DURATION;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeOut(progress);

      const scales: Record<string, number> = {};

      for (const pos of newTiles) {
        scales[`${pos.row},${pos.col}`] = eased;
      }

      for (const pos of mergedCells) {
        const mergeScale =
          progress < 0.5
            ? 1 + 0.15 * this.easeOut(progress * 2)
            : 1 + 0.15 * (1 - this.easeOut((progress - 0.5) * 2));
        scales[`${pos.row},${pos.col}`] = mergeScale;
      }

      this.drawFrame(ctx, grid, scales);

      if (progress < 1) {
        this.animFrameId = requestAnimationFrame(animate);
      } else {
        this.animFrameId = 0;
        if (gameOver) this.drawOverlay(ctx, "Game Over!");
        else if (won) this.drawOverlay(ctx, "You Win!");
      }
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  cancelAnimation(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  private drawFrame(
    ctx: CanvasRenderingContext2D,
    grid: number[][],
    scales: Record<string, number>
  ): void {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = GRID_BG_COLOR;
    this.fillRoundRect(ctx, 0, 0, CANVAS_SIZE, CANVAS_SIZE, CELL_RADIUS * 2);

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const pos = this.getCellPos(r, c);
        ctx.fillStyle = EMPTY_CELL_COLOR;
        this.fillRoundRect(
          ctx,
          pos.x,
          pos.y,
          CELL_SIZE,
          CELL_SIZE,
          CELL_RADIUS
        );
      }
    }

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const value = grid[r][c];
        if (value === 0) continue;

        const key = `${r},${c}`;
        const scale = scales[key] !== undefined ? scales[key] : 1;
        this.drawTile(ctx, r, c, value, scale);
      }
    }
  }

  private drawTile(
    ctx: CanvasRenderingContext2D,
    row: number,
    col: number,
    value: number,
    scale: number
  ): void {
    const pos = this.getCellPos(row, col);
    const cx = pos.x + CELL_SIZE / 2;
    const cy = pos.y + CELL_SIZE / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    ctx.fillStyle = TILE_COLORS[value] || "#3c3a32";
    this.fillRoundRect(ctx, pos.x, pos.y, CELL_SIZE, CELL_SIZE, CELL_RADIUS);

    ctx.fillStyle = value <= 4 ? TILE_TEXT_DARK : TILE_TEXT_LIGHT;
    ctx.font = "bold " + this.getFontSize(value) + "px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(value), cx, cy);

    ctx.restore();
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, text: string): void {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 68px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 30);

    ctx.font = "32px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(
      "Press ENTER to restart",
      CANVAS_SIZE / 2,
      CANVAS_SIZE / 2 + 30
    );
  }

  private getCellPos(
    row: number,
    col: number
  ): { x: number; y: number } {
    return {
      x: CELL_PADDING + col * (CELL_SIZE + CELL_GAP),
      y: CELL_PADDING + row * (CELL_SIZE + CELL_GAP),
    };
  }

  private getFontSize(value: number): number {
    if (value < 100) return 64;
    if (value < 1000) return 52;
    return 40;
  }

  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private fillRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
}
