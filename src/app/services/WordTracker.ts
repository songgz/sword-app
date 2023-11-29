import {WordStepper} from "./word-stepper";
import {WordState} from "./word-state";

export class WordTracker {
  words: any[] = [];
  wordStates: any[] = [];
  stepper: WordStepper = new WordStepper(0);
  learnType: string = "";
  completions: number = 0;
  total: number = 0;
  maxRepeats: number = 6;
  colors: string[] = ['err0', 'err1', 'err2', 'err3', 'err4', 'err5', 'err6'];

  constructor() { }

  init() {
    this.words = [];
    this.wordStates = [];
    this.completions = 0;
  }

  loadErrWords(errWords: any[]) {
    this.init();
    this.total = errWords.length;
    this.stepper = new WordStepper(errWords.length);

    errWords.forEach(ew => {
      let state: WordState = {
        unit_id: ew?.unit_id,
        word_id: ew?.word_id,
        repeats: ew?.repeats || this.maxRepeats,
        learns: ew?.learns || 0,
        reviews: ew?.reviews || 0,
        is_wrong: ew?.is_wrong || false,
        completed: false
      };
      this.wordStates.push(state);
      this.words.push(ew.word);
    });

    this.learnType = '复习';
  }

  loadWords(words :any[], unitId: string) {
    this.init();
    this.total = words.length;
    this.stepper = new WordStepper(words.length);

    words.forEach((w,i) => {
      let state: WordState = {
        unit_id: unitId,
        word_id: w.id,
        repeats: this.maxRepeats,
        learns: 0,
        reviews: 0,
        is_wrong: false,
        completed: false
      };
      this.wordStates.push(state);
      this.words.push(w);
    });

    this.learnType = '认读';
  }

  getWord(): any {
    return this.words[this.stepper.getIndexValue()] || {};
  }

  getWordState(): WordState {
    return this.wordStates[this.stepper.getIndexValue()] || {};
  }

  next(): any {
    this.stepper.next();
  }

  jump() {
    let repeats = this.getWordState().repeats;
    if (repeats < this.maxRepeats) {
      this.stepper.jump(repeats);
    }
  }

  wrongAnswer() {
    let state: WordState = this.getWordState();
    state.is_wrong = true;
    state.repeats = 0;
    state.learns = state.learns + 1;
  }

  correctAnswer() {
    let state: WordState = this.getWordState();
    if (state.repeats < this.maxRepeats) {
      state.repeats = state.repeats + 1;
    }

    if (state.repeats === this.maxRepeats) {
      state.reviews = state.reviews + 1;
      state.completed = true;
      this.completions = this.completions + 1
    }

    state.learns = state.learns + 1;
  }

  testable(): boolean {
    return this.getWordState()?.repeats === 5;
  }

  getColor(): string {
    let state = this.getWordState();
    if (state) {
      return this.colors[state.repeats];
    }
    return this.colors[this.maxRepeats];
  }

  getIndexValue(): number {
    return this.stepper.getIndexValue();
  }

  isOver(): boolean {
    return this.stepper.isOver();
  }





}
