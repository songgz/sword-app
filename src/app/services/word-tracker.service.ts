export class WordTrackerService {
  words :any[] = []
  index: number = 0;
  indexes: number[] = [];
  errLevels: number[] = [1, 3, 6, 12, 24, 48];
  word: any = {};

  constructor() { }

  getErrLevel(): number {
    if (this.word.error_num === undefined) {
      return 6;
    }
    return  this.word.error_num;
  }

  setErrLevel(value: number) {
    this.word.error_num = value;
  }

  loadWords(words :any[]) {
    this.words = words;
    this.indexes = this.words.map((v,i) => i);
    this.index = 0;
    this.word = this.words[this.index];
  }

  getWordIdx(): number {
    return this.indexes[this.index];
  }

  reoccur(isFirst: boolean) {
    console.log('aa' + this.getErrLevel());
    if (isFirst) {
      this.setErrLevel(0);
    }else{
      this.setErrLevel(this.getErrLevel() + 1);
    }
    this.indexes.splice(this.index + this.errLevels[this.getErrLevel()] + 1, 0, this.indexes[this.index]);
    console.log(this.indexes);
  }

  next(): any {
    if (this.index < this.indexes.length - 1) {
      this.index = this.index + 1;
      this.word = this.words[this.indexes[this.index]];
    }
    return this.word;
  }
}
