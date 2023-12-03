import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {RestApiService} from "../services/rest-api.service";
import {AudioService} from "../services/audio.service";
import {QuizAlertComponent} from "../quiz-alert/quiz-alert.component";
import {WordTracker} from "../services/WordTracker";
import {StreamState} from "../services/stream-state";

@Component({
  selector: 'app-word',
  templateUrl: './word.page.html',
  styleUrls: ['./word.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, QuizAlertComponent]
})
export class WordPage implements OnInit {
  //units: any[] = [];
  learnedUnit: any = {};
  //words: any[] = [];
  word: any = {};
  //wordState: WordState|undefined;
  learnedUnits: any[] = [];
  //errorWords: any[] = [];

  audioState: StreamState | undefined;
  state: any = 'survey';
  tracker: WordTracker;
  options: any[] = [];
  answer: boolean = false;
  learnTypes: any[] = [
    {code: 'review', name: '复习'},
    {code: 'beforeQuiz', name: '课前测试'},
    {code: 'afterQuiz', name: '课后测试'},
    {code: 'read', name: '认读'},
    {code: 'listen', name: '听读'},
    {code: 'spell', name: '拼写'},
    {code: 'matchGame', name: '消消乐'}
  ];
  learnType: string = 'read';
  book: any = {};
  isReview: boolean = false;

  constructor(private activatedRouter: ActivatedRoute, private router: Router, private rest: RestApiService, private sanitizer: DomSanitizer, private audio: AudioService, private alertController: AlertController) {
    this.tracker = new WordTracker();
    this.activatedRouter.queryParams.subscribe((params) => {
      this.learnType = params['learnType'];
      this.loadLearnedBook('653c68696eec2f1ea8aa1a2a', params['bookId'], params['learnType']);
      //this.loadUnits(params['bookId']);
    });

    this.audio.getState().subscribe(state => {
      this.audioState = state;
    });

  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    //this.presentAlert();
  }


  // loadUnits(bookId: string) {
  //   this.rest.index('units', {book_id: bookId}).subscribe(res => {
  //     // this.units = res.data;
  //     // this.unit = this.units[0];
  //     //this.loadWords(this.unit.id);
  //     // this.loadErrorWords('653c68696eec2f1ea8aa1a2a', this.unit.id);
  //   });
  // }

  loadLearnedBook(studentId: string, bookId: string, learnType: string) {
    this.rest.show('learned_books/0', {student_id: studentId, book_id: bookId, learn_type: learnType}).subscribe(res => {
      this.learnedUnits = res.data.learned_units;
      this.book = res.data.book;
      let errorWords = res.data.error_words;
      if (errorWords.length > 0) {
        this.isReview = true;
        this.tracker.loadErrWords(errorWords);
        this.start();

      }else{
        this.learnedUnit = this.learnedUnits.find(u => u.learns !== u.words);
        this.openUnit(this.learnedUnit.unit_id);
      }
    });
  }

  loadWords(unitId: string) {
    this.rest.index('words', {unit_id: unitId, per: 999}).subscribe(res => {
     // console.log(res.data);
      let words = res.data;
      this.tracker.loadWords(words, unitId);
      this.start();
      //console.log(this.tracker.words);
      //this.word = this.tracker.getWord();
      //this.wordState = this.tracker.getWordState();

    });
  }

  openUnit(unitId: string) {
    //this.unit = this.units.find(u => u.id === unitId);
    this.loadWords(unitId);
    //this.loadErrorWords('653c68696eec2f1ea8aa1a2a', this.unit.id);
    this.presentAlert();
  }

  playWord() {
    this.audio.playStream(this.getWordAudio(this.word.pronunciation)).subscribe();
  }

  start() {
    this.state = 'survey';
    this.word = this.tracker.getWord();
    this.playWord();

    this.options = [];
    if (this.isReview === true && this.tracker.testable()) {
      this.getWordOptions(4);
    }

  }

  survey(value: boolean) {
    //this.playWord();

    if (value) {
      this.state = 'evaluate';
    } else {
      this.answer = false;

      this.state = 'repeater';
    }
  }


  evaluate(value: boolean) {
    if (value) {
      this.answer = true;

      this.next();
      this.state = 'survey';
    } else {
      this.answer = false;

      this.state = 'repeater';
    }
  }

  repeater() {
    this.playWord();
    this.state = 'next';
  }



  next() {
    this.updateWordState(this.answer);


    if (!this.isReview && this.learnType == 'read') {
      this.learnedUnit.wrongs = this.tracker.rights;
      this.learnedUnit.learns = this.tracker.getCompletions();
    }

    if (this.tracker.isOver()) {
      this.saveWordState();//保存

      if (this.isReview === true) {
        this.isReview = false;
        this.learnedUnit = this.learnedUnits.find(u => u.learns !== u.words);
        this.openUnit(this.learnedUnit.unit_id);
      }else{
        if (this.learnType === 'read') {
          this.router.navigate(['/match-game'], {queryParams: {unitId: this.learnedUnit.unit_id}});

          //this.presentAfter();
        }
      }




    }else{
      this.tracker.next();
      this.start();
    }
  }

  updateWordState(value: boolean) {
    if (value) {
      this.tracker.correctAnswer();
    }else{
      this.tracker.wrongAnswer();
    }
  }



  saveWordState() {
    let error_words: any[] = [];
    //console.log(this.tracker.wordStates);
    Object.keys(this.tracker.wordStates).forEach(key => {
      let s = this.tracker.wordStates[key];
        error_words.push({
          unit_id: s.unit_id,
          word_id: s.word_id,
          repeats: s.repeats,
          learns: s.learns,
          reviews: s.reviews,
          is_wrong: s.is_wrong
        });
    });

    let body: any = {
      student_id: '653c68696eec2f1ea8aa1a2a',
      book_id: this.book.id,
      learn_type: this.learnType,
      error_words: error_words,
    };
    if (this.learnType === 'read') {
      body.learned_units = this.learnedUnits;
    }
    this.rest.create('learned_books', body).subscribe();
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

  getWordOptions(n: number): any[] {
    this.options = [];
    this.options.push(this.tracker.words[this.tracker.getIndexValue()]);
    let randomIndex = -1;
    let w: any = {};
    while (this.options.length < n) {
      randomIndex = Math.floor(Math.random() * this.tracker.words.length);
      w = this.tracker.words[randomIndex];
      if (this.options.findIndex(o => o.id === w.id) === -1) {
        this.options.push(w);
      }
    }
    let j = randomIndex % n;
    [this.options[1], this.options[j]] = [this.options[j], this.options[1]];
    return this.options;
  }

  replyOption(wordId: string) {
    this.answer = (wordId === this.word.id);
    this.next();
  }



  async presentAlert() {
    const alert = await this.alertController.create({
      header: '学习提示',
      message: '是否进行章节前测试？',
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            //this.learnType = 'read';
          },
        },
        {
          text: '确定',
          role: 'confirm',
          handler: () => {
            //this.learnType = 'beforeQuiz'
            this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.learnedUnit.unit_id, testType: this.learnType}});
          },
        }
      ]
    });

    await alert.present();
  }

  async presentAfter() {
    const alert = await this.alertController.create({
      header: '学习提示',
      message: '是否进行章节后测试？',
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            this.learnType = 'read';
          },
        },
        {
          text: '确定',
          role: 'confirm',
          handler: () => {
            this.learnType = 'beforeQuiz'
            this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.learnedUnit.unit_id, testType: this.learnType}});
          },
        }
      ]
    });

    await alert.present();
  }

  formatText(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/<br\/>/g, '<br/>'));
  }

  protected readonly JSON = JSON;
}
