import {WordStepper} from "./word-stepper";
import {WordState} from "./word-state";

export class WordTracker {
  words: any[] = [];
  wordStates: any = {};
  stepper: WordStepper = new WordStepper(0);
  learnType: string = "";
  learnState: string = "survey";
  //completions: number = 0;
  total: number = 0;
  maxRepeats: number = 6;
  colors: string[] = ['err0', 'err1', 'err2', 'err3', 'err4', 'err5', 'err6'];
  private unitId: string | undefined;
  rights: number = 0;
  answer: boolean = false;
  word: any = {};

  constructor() { }

  init() {
    this.words = [];
    this.wordStates = {};
    //this.completions = 0;
  }

  loadErrWords(errWords: any[]) {
    this.init();
    this.total = errWords.length;
    this.stepper = new WordStepper(errWords.length);

    errWords.forEach((ew,i) => {
      let state: WordState = {
        unit_id: ew?.unit_id,
        word_id: ew?.word_id,
        repeats: ew?.repeats || this.maxRepeats,
        learns: ew?.learns || 0,
        reviews: ew?.reviews || 0,
        is_wrong: ew?.is_wrong || false,
        completed: false
      };
      //console.log(this.wordStates);

      this.wordStates[i] = state;
      this.words.push(ew.word);
    });

    this.learnType = '复习';
    this.getWord();
  }

  loadWords(words :any[], unitId: string) {
    this.unitId = unitId;
    this.init();
    this.total = words.length;
    this.stepper = new WordStepper(words.length);

    words.forEach((w,i) => {
      this.words.push(w);
    });

    this.learnType = '认读';
    this.getWord();
  }

  getCompletions() {
    return this.stepper.completions;
  }

  getWord(): any {
    return this.word = this.words[this.stepper.getIndexValue()] || {};
  }

  getWordState(): WordState {
    return this.wordStates[this.stepper.getIndexValue()];
  }

  next(): any {
    this.stepper.next();
    return this.word = this.getWord();
  }

  // jump() {
  //   let repeats = this.getWordState().repeats;
  //   if (repeats < this.maxRepeats) {
  //     this.stepper.jump(repeats);
  //   }
  // }

  wrongAnswer() {
    let state = this.wordStates[this.stepper.getIndexValue()] = this.wordStates[this.stepper.getIndexValue()] || {
      unit_id: '',
      word_id: '',
      repeats: 0,
      learns: 0,
      reviews: 0,
      is_wrong: true,
      completed: false};
    console.log(state);
    state.unit_id = state.unit_id || this.unitId;
    state.word_id = state.word_id || this.getWord().id;
    state.repeats = 0;
    state.learns = state.learns + 1;
    this.stepper.jump(0);
    console.log(this.wordStates);
  }

  correctAnswer() {
    let state = this.wordStates[this.stepper.getIndexValue()];
    if (state) {
      state.learns = state.learns + 1;
      if (state.repeats < this.maxRepeats) {
        state.repeats = state.repeats + 1;
        this.stepper.jump(state.repeats);
      }
      if (state.repeats === this.maxRepeats) {
        state.reviews = state.reviews + 1;
      }
    }else{
      this.rights++;
    }
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
