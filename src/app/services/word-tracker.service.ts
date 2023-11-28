export class WordTrackerService {
  words :any[] = []
  index: number = 0;
  indexes: number[] = [];
  errLevels: number[] = [1, 3, 6, 12, 24, 48];
  word: any = {};
  complets: number = 0;
  total: number = 0;
  status: string = '';

  constructor() { }

  getErrLevel(): number {
    if (this.word?.repeats === undefined) {
      return 6;
    }
    return  this.word.repeats;
  }

  setErrLevel(value: number) {
    this.word.repeats = value;
  }

  wrongAnswer() {
    this.word.repeats = 0;
    this.word.learns = this.word.learns + 1;
  }

  correctAnswer() {
    if (this.word.repeats < 6) {
      this.word.repeats = this.word.repeats + 1;
    }

    if (this.word.repeats === 6) {
      this.word.reviews = this.word.reviews + 1;
      this.word.completed = true;
      this.complets = this.complets + 1
    }

  }

  getComplets(): number{
    return this.words.filter(w => w.completed).length;
  }

  loadWords(words :any[]) {
    this.words = words;
    this.words.forEach((w,i) => {
      w.repeats = w?.repeats || 6;
      w.learns = w?.learns || 0;
      w.reviews = w?.reviews || 0;
      w.completed = false;
      this.indexes.push(i);
    });
    this.index = 0;
    this.word = this.words[this.index];
    this.complets = 0;
    this.total = 0;
    this.status = '认读';
  }

  loadErrorWords(errWords: any[]) {
    errWords.forEach((ew, i) => {
      ew.word.repeats = ew?.repeats || 6;
      ew.word.learns = ew?.learns || 0;
      ew.word.reviews = ew?.reviews || 0;
      ew.word.completed = false;
      this.words.push(ew.word);
      this.indexes.push(i);
    });
    this.index = 0;
    this.word = this.words[this.index];
    this.status = '复习';
  }

  getWordIdx(): number {
    return this.indexes[this.index];
  }

  reoccur() {
    if (this.word.repeats < 6) {
      this.indexes.splice(this.index + this.errLevels[this.getErrLevel()] + 1, 0, this.indexes[this.index]);
    }
  }

  next(): any {
    if (this.index < this.indexes.length - 1) {
      this.index = this.index + 1;
      this.word = this.words[this.indexes[this.index]];
    }
    return this.word;
  }
}
