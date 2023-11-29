export class WordStepper {
  index: number = 0;
  indexValues: number[] = [];
  intervals: number[] = [1, 3, 6, 12, 24, 48];

  constructor(indexSize: number) {
    for (let i = 0; i < indexSize; i++) {
      this.indexValues.push(i);
    }
  }

  jump(step: number) {
    this.indexValues.splice((this.index + 1 + this.intervals[step]), 0, this.getIndexValue());
  }

  getIndexValue() {
    if (this.indexValues.length > 0) {
      return this.indexValues[this.index];
    }
    return 0;
  }

  next() {
    if (!this.isOver()) {
      ++this.index;
    }
  }

  isOver() {
    return (this.index + 1) === this.indexValues.length;
  }


}
