export class FocusManager {
  private itemCount: number;
  private currentIndex: number;

  constructor(itemCount: number) {
    this.itemCount = itemCount;
    this.currentIndex = -1;
  }

  setActive(index: number): number {
    this.currentIndex = Math.max(-1, Math.min(index, this.itemCount - 1));
    return this.currentIndex;
  }

  moveNext(): number {
    return this.setActive(this.currentIndex + 1);
  }

  movePrev(): number {
    return this.setActive(this.currentIndex - 1);
  }

  getCurrent(): number {
    return this.currentIndex;
  }

  isActive(index: number): boolean {
    return this.currentIndex === index;
  }

  reset(): void {
    this.currentIndex = -1;
  }
}
