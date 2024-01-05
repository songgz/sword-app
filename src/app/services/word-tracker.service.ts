import { Injectable } from '@angular/core';
import {WordStepper} from "./word-stepper";
import {WordState} from "./word-state";
import {RestApiService} from "./rest-api.service";
import {Observable, tap} from "rxjs";
import {AudioService} from "./audio.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {StreamState} from "./stream-state";
import {MinAudioService} from "./min-audio.service";
import {Datetime} from "@ionic/core/dist/types/components/datetime/datetime";

@Injectable({
  providedIn: 'root'
})
export class WordTrackerService {
  words: any[] = [];
  wordStates: any = {};
  stepper: WordStepper = new WordStepper(0);
  total: number = 0;
  maxRepeats: number = 5;
  colors: string[] = ['err0', 'err1', 'err2', 'err3', 'err4', 'err5', 'err6'];
  rights: number = 0;
  wrongs: number = 0;
  word: any = {};
  isReview: boolean = false;
  learnedUnit: any = {};
  //audioState: StreamState | undefined;
  playing: boolean | undefined
  options: any[] = [];
  learned_book: any = {};
  erred: Boolean = false;
  startTime: number = 0;
  endTime: number = 0;

  constructor(private rest: RestApiService, public audio: AudioService, private sanitizer: DomSanitizer) {
    this.audio.playing.subscribe(playing => {
      this.playing = playing;
    });
  }

  initIndex() {
    if(this.learnedUnit?.last_word_index > 0) {
      this.wrongs = this.learnedUnit.wrongs + 0;
      this.rights = this.learnedUnit.rights + 0;
      this.stepper.completions = this.learnedUnit.last_word_index + 1;
      this.stepper.index = this.learnedUnit.last_word_index + 1;
      this.stepper.lastWordIndex = this.learnedUnit.last_word_index + 1;
    }else{
      this.wrongs = 0;
      this.rights = 0;
      this.stepper.completions = 0;
      this.stepper.index = 0;
      this.stepper.lastWordIndex = 0;
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
    this.learnedUnit = this.learned_book.learned_units.find((lu:any)=> lu.unit_id === unitId);
    return this.learnedUnit;
  }

  loadUnitWords(): Observable<any> {
    return this.rest.index('words', {unit_id: this.learnedUnit.unit_id, per: 999}).pipe(
        tap(d => {
          this.loadWords(d.data);
        })
    );
  }

  saveWordState() {
    let du = 0;
    if (this.endTime > this.startTime) {
      du = Math.round((this.endTime - this.startTime)/1000);
    }
    let learnedWord: any = {
      student_id: this.learned_book.student_id,
      book_id: this.learned_book.book_id,
      reviews: 0,
      completions: 0,
      durations: du < 15  ? du : 15
    }

    let learnedBook: any = {
      id: this.learned_book.id,
      error_words: [],
      learned_units: [],
      learned_words: []
    };

    if (!this.isReview) {
      learnedWord.completions = 1;
      this.learnedUnit.completions = this.rights + this.wrongs;
      this.learnedUnit.wrongs = this.wrongs;
      this.learnedUnit.rights = this.rights;
      this.learnedUnit.last_word_index = this.stepper.lastWordIndex;
      learnedBook.learned_units.push(this.learnedUnit);
    }else{
      learnedWord.reviews = 1;
    }
    let ws = this.getWordState();
    if (ws) {
      learnedBook.error_words.push({
        unit_id: ws.unit_id,
        dictionary_id: ws.dictionary_id,
        repeats: ws.repeats,
        learns: ws.learns,
        reviews: ws.reviews
      });
    }
    learnedBook.learned_words.push(learnedWord);

    this.rest.update('learned_books/'+this.learned_book.id, {learned_book: learnedBook}).subscribe();
  }

  deleteErrorWord() {
    return this.rest.destroy('learned_books/'+this.learned_book.id, {learned_unit_id: this.learnedUnit.id});
  }

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
        dictionary_id: ew?.dictionary_id,
        repeats: 5,
        learns: ew?.learns || 0,
        reviews: ew?.reviews || 0
      };

      this.wordStates[i] = state;
      this.words.push(ew.dictionary);
    });

    this.getWord();
  }

  loadWords(words :any[]) {
    this.total = words.length;
    this.stepper = new WordStepper(words.length);
    this.words = [];
    this.wordStates = {};

    words.forEach((w,i) => {
      this.words.push(w.dictionary);
    });

    this.initIndex();
    this.getWord();
  }

  getCompletions() {
    return this.stepper.completions;
  }

  getWord(): any {
    //this.startTime = Date.now();
    return this.word = this.words[this.stepper.getIndexValue()] || {};
  }

  getWordState(): WordState {
    return this.wordStates[this.stepper.getIndexValue()];
  }



  next(): any {
    this.stepper.next();
    return this.word = this.getWord();
  }

  wrongAnswer() {
    let state = this.wordStates[this.stepper.getIndexValue()];
    if (!state) {
      this.erred = true;
      this.wrongs++;
      state = {
        unit_id: this.learnedUnit.unit_id,
        dictionary_id: this.getWord().id,
        repeats: 0,
        learns: 0,
        reviews: 0};
    }
    state.repeats = 0;
    state.learns = state.learns + 1;
    this.stepper.jump(0);
    this.wordStates[this.getIndexValue()] = state;
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
    return this.colors[this.maxRepeats+1];
  }

  getIndexValue(): number {
    return this.stepper.getIndexValue();
  }

  isOver(): boolean {
    return this.stepper.isOver();
  }

  updateWordState(value: boolean) {
    if (this.stepper.index < this.stepper.indexValues.length) {
      if (value) {
        this.correctAnswer();
      }else {
        this.wrongAnswer();
      }
    }
  }

  getWordImg(file: string): string {
    if (file) {
      return this.rest.getAssetUrl() + 'quick/img' + file;
    }
    return '';
  }

  findWord(wordId: string) {
    return this.words.find(w => w.id === wordId);
  }

  playWord(word?: any) {
    if(word) {
      this.audio.play(this.rest.getWordAudio(word.pronunciation));
    }else{
      this.audio.play(this.rest.getWordAudio(this.word.pronunciation));
    }
  }

  playWordPronunciation(pronunciation: string) {
    this.audio.play(this.rest.getWordAudio(pronunciation));
  }

  play(url: string) {
    return this.audio.play(url);
  }

  getWordOptions(n: number): any[] {
    this.options = [];
    if (n > this.words.length) {
      n = this.words.length;
    }
    this.options.push(this.words[this.getIndexValue()]);
    let randomIndex = 0;
    let w: any = {};
    while (this.options.length < n) {
      randomIndex = Math.floor(Math.random() * this.words.length);
      w = this.words[randomIndex];
      if (this.options.findIndex(o => o.id === w.id) === -1) {
        this.options.push(w);
      }
    }
    this.options = this.shuffleArray(this.options);
    return this.options;
  }

  shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    return newArray.sort(() => Math.random() - 0.5);
  }

  formatText(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/<br\/>/g, '<br/>'));
  }

}
