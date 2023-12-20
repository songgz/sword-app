export class WordStepper {
  index: number = 0;
  indexValues: number[] = [];
  intervals: number[] = [1, 3, 6, 12, 24, 48];
  completions: number = 0;
  lastWordIndex: number = 0;

  constructor(indexSize: number) {
    for (let i = 0; i < indexSize; i++) {
      this.indexValues.push(i);
    }
    // if (this.completions === this.index && this.indexValues.length > 0) {
    //   this.completions++;
    // }
  }

  updateLastWordIndex() {
    if (this.lastWordIndex < this.getIndexValue()) {
      this.lastWordIndex = this.getIndexValue();
    }
  }

  jump(step: number) {
    this.indexValues.splice((this.index + 1 + this.intervals[step]), 0, this.getIndexValue());
  }

  getIndexValue() {
    if (this.indexValues.length > 0) {
      return this.indexValues[this.index];
    }
    return this.indexValues[0];;
  }

  next() {

    if (!this.isOver()) {
      if (this.completions === this.getIndexValue()) {
        this.completions = this.completions + 1;
      }
      ++this.index;
      this.updateLastWordIndex();
    }
  }

  isOver() {
    return (this.index + 1) === this.indexValues.length;
  }


}
