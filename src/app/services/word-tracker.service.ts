import { Injectable } from '@angular/core';
import {WordStepper} from "./word-stepper";
import {WordState} from "./word-state";
import {RestApiService} from "./rest-api.service";
import {Observable, tap} from "rxjs";
import {AudioService} from "./audio.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {StreamState} from "./stream-state";

@Injectable({
  providedIn: 'root'
})
export class WordTrackerService {
  words: any[] = [];
  wordStates: any = {};
  stepper: WordStepper = new WordStepper(0);
  //learnType: string = "";

  total: number = 0;
  maxRepeats: number = 6;
  colors: string[] = ['err0', 'err1', 'err2', 'err3', 'err4', 'err5', 'err6'];
  private unitId: string | undefined;
  rights: number = 0;
  wrongs: number = 0;
  word: any = {};
  learnedUnits: any[] = [];
  lastUpdate: Date = new Date("2023-01-01T08:00:00");
  book: any = {};
  isReview: boolean = false;
  learnedUnit: any = {};
  lastWordIndex: number = 0;
  audioState: StreamState | undefined;
  options: any[] = [];

  constructor(private rest: RestApiService, private audio: AudioService, private sanitizer: DomSanitizer) {
    this.audio.getState().subscribe(state => {
      this.audioState = state;
    });
  }

  init(bookId: string, studentId: string, learnType: string) {
    this.words = [];
    this.wordStates = {};
    this.isReview = false;

  }

  loadLearnedBook(studentId: string, bookId: string, learnType: string): Observable<any> {
    return this.rest.show('learned_books/0', {student_id: studentId, book_id: bookId, learn_type: learnType}).pipe(
        tap(d => {
          this.book = d.data.book;
          this.lastUpdate = new Date(d.data.updated_at);
          this.learnedUnits = d.data.learned_units;
          if (this.learnedUnits.length > 0) {
            this.nextLearnedUnit();
          }
          if (d.data.error_words.length > 0 && this.reviewedToursDiff(this.lastUpdate) > 12) {
            this.isReview = true;
            this.loadErrWords(d.data.error_words);
          }else{
            this.isReview = false;
            this.loadUnitWords(this.learnedUnit.unit_id).subscribe();
          }
        })
    );

  }

  nextLearnedUnit(): any {
    return this.learnedUnit = this.learnedUnits.find(u => u.learns !== u.words);
  }

  loadUnitWords(unitId: string): Observable<any> {
    this.isReview = false;
    this.learnedUnit = this.learnedUnits.find(lu => lu.unit_id === unitId);
    return this.rest.index('words', {unit_id: unitId, per: 999}).pipe(
        tap(d => {
          this.loadWords(d.data, unitId);
        })
    );
  }

  saveWordState(student_id: string, learnType: string) {
    let learnedBook: any = {
      student_id: student_id,
      book_id: this.book.id,
      learn_type: learnType,
      error_words: [],
      learned_units: []
    };

    let ws = this.getWordState();
    if (ws) {
      learnedBook.error_words.push({
        unit_id: ws.unit_id,
        word_id: ws.word_id,
        repeats: ws.repeats,
        learns: ws.learns,
        reviews: ws.reviews,
        is_wrong: ws.is_wrong
      });
    }



    if (!this.isReview) {
      this.learnedUnit.last_word_index = this.lastWordIndex;
      learnedBook.learned_units.push(this.learnedUnit);
    }
    this.rest.update('learned_books/0', learnedBook).subscribe();
  }

  saveWordState2(student_id: string, learnType: string) {
    let error_words: any[] = [];
    //console.log(this.tracker.wordStates);
    Object.keys(this.wordStates).forEach(key => {
      let s = this.wordStates[key];
      error_words.push({
        unit_id: s.unit_id,
        word_id: s.word_id,
        repeats: s.repeats,
        learns: s.learns,
        reviews: s.reviews,
        is_wrong: s.is_wrong
      });
    });

    let learnedBook: any = {
      student_id: student_id,
      book_id: this.book.id,
      learn_type: learnType,
      error_words: error_words,
    };
    if (!this.isReview) {
      learnedBook.learned_units = this.learnedUnits;
    }
    this.rest.update('learned_books/0', learnedBook).subscribe();
  }

  reviewedToursDiff(lastUpdate: Date) {
    const timeDiff = Math.abs((new Date()).getTime() - lastUpdate.getTime());
    const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
    return hoursDiff;
  }

  loadErrWords(errWords: any[]) {
    this.total = errWords.length;
    this.stepper = new WordStepper(errWords.length);
    this.words = [];
    this.wordStates = {};

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

    //this.learnType = '复习';
    this.getWord();
  }

  loadWords(words :any[], unitId: string) {
    this.unitId = unitId;
    this.total = words.length;
    this.stepper = new WordStepper(words.length);
    this.words = [];

    words.forEach((w,i) => {
      this.words.push(w);
    });

    //this.learnType = '认读';
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

  updateLastWordIndex() {
    if (this.lastWordIndex < this.stepper.getIndexValue()) {
      this.lastWordIndex = this.stepper.getIndexValue();
    }
  }

  next(): any {
    this.stepper.next();
    this.updateLastWordIndex();
    return this.word = this.getWord();
  }

  // jump() {
  //   let repeats = this.getWordState().repeats;
  //   if (repeats < this.maxRepeats) {
  //     this.stepper.jump(repeats);
  //   }
  // }

  wrongAnswer() {
    let state = this.wordStates[this.stepper.getIndexValue()];
    if (!state) {
      this.wrongs++;
      state = {
        unit_id: this.unitId,
        word_id: this.getWord().id,
        repeats: 0,
        learns: 0,
        reviews: 0,
        is_wrong: true,
        completed: false};
    }

    console.log(state);
    state.repeats = 0;
    state.learns = state.learns + 1;
    this.stepper.jump(0);
    this.wordStates[this.getIndexValue()] = state;

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
    // if (this.stepper.isOver()) {
    //   this.isReview = false;
    //   this.words = [];
    //   this.wordStates = {};
    // }
    return this.stepper.isOver();
  }

  updateWordState(value: boolean) {
    if (value) {
      this.correctAnswer();
    }else{
      this.wrongAnswer();
    }
  }

  getWordImg(file: string): string {
    if (file) {
      return this.rest.getAssetUrl() + 'quick/img' + file;
    }
    return '';
  }

  getWordAudio(file: string): string {
    if (file) {
      return this.rest.getAssetUrl() + 'quick/v' + file;
    }
    return '';
  }

  playWord() {
    this.audio.playStream(this.getWordAudio(this.word.pronunciation)).subscribe();
  }

  getWordOptions(n: number): any[] {
    this.options = [];
    if (n > this.words.length) {
      n = this.words.length;
    }
    this.options.push(this.words[this.getIndexValue()]);
    let randomIndex = -1;
    let w: any = {};
    while (this.options.length < n) {
      randomIndex = Math.floor(Math.random() * this.words.length);
      w = this.words[randomIndex];
      if (this.options.findIndex(o => o.id === w.id) === -1) {
        this.options.push(w);
      }
    }
    let j = randomIndex % n;
    [this.options[1], this.options[j]] = [this.options[j], this.options[1]];
    return this.options;
  }

  formatText(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/<br\/>/g, '<br/>'));
  }

}
