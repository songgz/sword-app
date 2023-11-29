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

@Component({
  selector: 'app-word',
  templateUrl: './word.page.html',
  styleUrls: ['./word.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, QuizAlertComponent]
})
export class WordPage implements OnInit {
  //units: any[] = [];
  unit: any = {};
  //words: any[] = [];
  word: any = {};
  //wordState: WordState|undefined;
  learnedUnits: any[] = [];
  //errorWords: any[] = [];

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
  learnType: string = 'review';
  book: any = {};

  constructor(private activatedRouter: ActivatedRoute, private router: Router, private rest: RestApiService, private sanitizer: DomSanitizer, private audio: AudioService, private alertController: AlertController) {
    this.tracker = new WordTracker();
    this.activatedRouter.queryParams.subscribe((params) => {
      this.loadLearnedBook('653c68696eec2f1ea8aa1a2a', params['bookId']);
      //this.loadUnits(params['bookId']);
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

  loadLearnedBook(studentId: string, bookId: string) {
    this.rest.show('learned_books/0', {student_id: studentId, book_id: bookId}).subscribe(res => {
      this.learnedUnits = res.data.learned_units;
      this.book = res.data.book;
      let errorWords = res.data.error_words;
      if (errorWords.length > 0) {
        this.tracker.loadErrWords(errorWords);
        this.word = this.tracker.getWord();
      }else{
        this.learnType = 'read';
        let unit = this.learnedUnits.find(u => u.learns !== u.words);
        this.openUnit(unit.unit_id);
      }
    });
  }

  loadWords(unitId: string) {
    this.rest.index('words', {unit_id: unitId, per: 999}).subscribe(res => {
      console.log(res.data);
      let words = res.data;
      this.tracker.loadWords(words);
      console.log(this.tracker.words);
      this.word = this.tracker.getWord();
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

  survey(value: boolean) {
    this.playWord();

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
    if (this.learnType == 'read') {
      if (!this.answer) {
        this.unit.wrongs++;
      }
      this.unit.learns++;
    }



    if (this.answer) {
      this.tracker.correctAnswer();
    }else{
      this.tracker.wrongAnswer();
    }

    this.tracker.jump();

    if (this.tracker.testable()) {
      this.getRandomWords(4);
    }

    if (this.tracker.isOver()) {
      //保存
      this.saveWordState();


     let unit = this.learnedUnits.find(u => u.learns !== u.words);
     this.openUnit(unit.unit_id);

    }else{
      this.tracker.next();
      this.word = this.tracker.getWord();
      this.state = 'survey';
    }
  }

  saveWordState() {
    let error_words: any[] = [];
    this.tracker.wordStates.forEach(s => {
      if (s.is_wrong) {
        error_words.push({
          unit_id: s.unit_id,
          word_id: s.word_id,
          repeats: s.repeats,
          learns: s.learns,
          reviews: s.reviews,
          is_wrong: s.is_wrong
        });
      }
    });

    let body: any = {
      student_id: '653c68696eec2f1ea8aa1a2a',
      book_id: this.book.id,
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

  getRandomWords(n: number): any[] {
    this.options = [];
    let m = this.tracker.getIndexValue();
    let randomIndex = -1;
    while (this.options.length < n) {
      randomIndex = Math.floor(Math.random() * this.tracker.words.length);
      if (m !== randomIndex) {
        this.options.push(this.tracker.words[randomIndex]);
      }
      if (this.options.length === n - 1) {
        this.options.splice(m % n, 0, this.tracker.getWord());
      }
    }
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
            this.learnType = 'read';
          },
        },
        {
          text: '确定',
          role: 'confirm',
          handler: () => {
            this.learnType = 'beforeQuiz'
            this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.unit.id}});
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
