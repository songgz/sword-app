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
  //private unitId: string | undefined;
  //completions: number = 0;
  rights: number = 0;
  wrongs: number = 0;
  word: any = {};
  //learnedUnits: any[] = [];
  //lastUpdate: Date = new Date("2023-01-01T08:00:00");
  //book: any = {};
  isReview: boolean = false;
  learnedUnit: any = {};
  //lastWordIndex: number = 0;
  audioState: StreamState | undefined;
  options: any[] = [];
  //student_id: string = '';
  //book_id: string = '';
  //learn_type: string = '';
  //learned_book_id: string = '';
  learned_book: any = {};

  constructor(private rest: RestApiService, private audio: AudioService, private sanitizer: DomSanitizer) {
    this.audio.getState().subscribe(state => {
      this.audioState = state;
    });
  }

  initIndex() {
    if (this.learnedUnit.last_word_index > 0) {
      this.wrongs = this.learnedUnit.wrongs;
      this.rights = this.learnedUnit.rights;
      this.stepper.index = this.learnedUnit.last_word_index + 1;
      this.stepper.lastWordIndex = this.stepper.index;
      this.stepper.completions = this.learnedUnit.completions;
    }
  }

  loadLearnedBook(studentId: string, bookId: string, learnType: string): Observable<any> {
    return this.rest.show('learned_books/0', {student_id: studentId, book_id: bookId, learn_type: learnType}).pipe(
        tap(res => {
          this.learned_book = res.data
          if (this.learned_book.error_words.length > 0 && this.reviewedToursDiff() > 12) {
            this.isReview = true;
            this.loadErrWords();
          }else{
            this.isReview = false;
            this.nextLearnedUnit();
            this.loadUnitWords().subscribe();
          }
        })
    );

  }

  nextLearnedUnit(): any {
    return this.learnedUnit = this.learned_book.learned_units.find((u:any) => u.completions < u.total);
  }

  getLearnUnit(unitId: string) {
    return this.learnedUnit = this.learned_book.learned_units.find((lu:any)=> lu.unit_id === unitId);
  }

  loadUnitWords(): Observable<any> {
    //this.learnedUnit = this.learned_book.learned_units.find((lu:any)=> lu.unit_id === unitId);
    return this.rest.index('words', {unit_id: this.learnedUnit.unit_id, per: 999}).pipe(
        tap(d => {
          this.loadWords(d.data);
        })
    );
  }

  saveWordState() {
    let learnedBook: any = {
      id: this.learned_book.id,
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
        reviews: ws.reviews
      });
    }

    if (!this.isReview) {
      this.learnedUnit.completions = this.rights + this.wrongs;
      this.learnedUnit.wrongs = this.wrongs;
      this.learnedUnit.rights = this.rights;
      this.learnedUnit.last_word_index = this.stepper.lastWordIndex;
      learnedBook.learned_units.push(this.learnedUnit);
    }

    this.rest.update('learned_books/'+this.learned_book.id, {learned_book: learnedBook}).subscribe();
  }

  // saveWordState2(student_id: string, learnType: string) {
  //   let error_words: any[] = [];
  //   //console.log(this.tracker.wordStates);
  //   Object.keys(this.wordStates).forEach(key => {
  //     let s = this.wordStates[key];
  //     error_words.push({
  //       unit_id: s.unit_id,
  //       word_id: s.word_id,
  //       repeats: s.repeats,
  //       learns: s.learns,
  //       reviews: s.reviews,
  //       is_wrong: s.is_wrong
  //     });
  //   });
  //
  //   let learnedBook: any = {
  //     student_id: student_id,
  //     book_id: this.book.id,
  //     learn_type: learnType,
  //     error_words: error_words,
  //   };
  //   if (!this.isReview) {
  //     learnedBook.learned_units = this.learnedUnits;
  //   }
  //   this.rest.update('learned_books/0', learnedBook).subscribe();
  // }

  reviewedToursDiff() {
    const timeDiff = Math.abs((new Date()).getTime() - new Date(this.learned_book.updated_at).getTime());
    const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
    return hoursDiff;
  }

  loadErrWords() {
    this.total = this.learned_book.error_words.length;
    this.stepper = new WordStepper(this.total);
    this.words = [];
    this.wordStates = {};

    this.learned_book.error_words.forEach((ew: any, i: number) => {
      let state: WordState = {
        unit_id: ew?.unit_id,
        word_id: ew?.word_id,
        repeats: ew?.repeats || this.maxRepeats,
        learns: ew?.learns || 0,
        reviews: ew?.reviews || 0
      };

      this.wordStates[i] = state;
      this.words.push(ew.word);
    });

    console.log(this.wordStates);
    //this.learnType = '复习';
    this.getWord();
  }

  loadWords(words :any[]) {
    this.total = words.length;
    this.stepper = new WordStepper(words.length);
    this.words = [];
    this.wordStates = {};

    words.forEach((w,i) => {
      this.words.push(w);
    });

    this.initIndex();
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
    let state = this.wordStates[this.stepper.getIndexValue()];
    if (!state) {
      this.wrongs++;
      state = {
        unit_id: this.learnedUnit.unit_id,
        word_id: this.getWord().id,
        repeats: 0,
        learns: 0,
        reviews: 0};
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
    }else {
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

  findWord(wordId: string) {
    return this.words.find(w => w.id === wordId);
  }

  playWord(word?: any) {
    if(word) {
      this.audio.playStream(this.getWordAudio(word.pronunciation)).subscribe();
    }else{
      this.audio.playStream(this.getWordAudio(this.word.pronunciation)).subscribe();
    }
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
