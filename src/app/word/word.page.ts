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
import {AppCtxService} from "../services/app-ctx.service";

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
  spells: any[][] = [[],[],[],[]];

  constructor(private ctx: AppCtxService, private activatedRouter: ActivatedRoute, private router: Router, private rest: RestApiService, private sanitizer: DomSanitizer, private audio: AudioService, private alertController: AlertController) {
    this.tracker = new WordTracker();
    this.activatedRouter.queryParams.subscribe((params) => {
      this.learnType = params['learnType'];
      this.loadLearnedBook(this.ctx.user_id, params['bookId'], this.ctx.learnType);
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
    this.loadWords(unitId);
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
    if (this.ctx.learnType === 'spell') {

      console.log('spell');
      this.randSpell();
      console.log(this.spells);
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

    console.log(this.tracker.getCompletions());
    console.log(this.tracker.stepper.completions);


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
      if (!this.isReview && this.learnedUnit) {
        this.learnedUnit.wrongs = this.tracker.wrongs;
        this.learnedUnit.learns = this.tracker.getCompletions();
      }
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
      student_id: this.ctx.user_id,
      book_id: this.book.id,
      learn_type: this.ctx.learnType,
      error_words: error_words,
    };
    if (!this.isReview) {
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

  wordSpells: string[] = [];

  randSpell() {
    this.spells = [[],[],[],[],[]];
    let w1 = this.word.word;
    this.wordSpells = w1.split('');
    let w2 = this.getRandomLetters(w1);
    let n = 0;

    for (let i = 0; i < w1.length; i++) {
      n = Math.floor(Math.random() * 100);
      if (n % 2 === 0) {
        this.spells[0].push(w1[i]);
        this.spells[1].push(w2[i]);
      }else{
        this.spells[0].push(w2[i]);
        this.spells[1].push(w1[i]);
      }

    }


  }

  getRandomLetters(str: string): string {
    const letters: string = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    let c: string = '';
    for (let i = 0; i < str.length; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      c = letters.charAt(randomIndex);
      if (c === str[i]) {
        c = letters.charAt(randomIndex - 3) || letters.charAt(randomIndex + 3);
      }
      if (str[i] === ' ') {
        c = ' ';
      }
      result += c;
    }
    return result;
  }

  sp(i: number, row: number) {
    if (i === this.spells[2].length) {
      this.spells[2].push(row);
    }else if(i < this.spells[2].length){
      this.spells[2][i] = row;
    }
    if(this.spells[2].length === this.spells[0].length) {
      if(this.spells[3].length === 0) {
        this.answer = this.checkSpell(3);
        this.checkSpell(4);
        if(this.answer) {
          this.state = 'next';
        }
      }else{
        if (this.checkSpell(4)) {
          this.state = 'next';
        }
      }

    }
    console.log(this.spells);
  }

  // sp2(i: number) {
  //   if (i === this.spells[2].length) {
  //     this.spells[2].push(1);
  //   }else if(i < this.spells[2].length){
  //     this.spells[2][i] = 1;
  //   }
  //   if(this.spells[2].length === this.spells[0].length) {
  //     this.checkSpell();
  //   }
  //   console.log(this.spells);
  // }

  checkSpell(m:number) {
    let r: number = 0;
    let w: string = this.word.word;
    for (let i = 0; i < this.spells[0].length; i++) {
      if (this.spells[this.spells[2][i]][i] === w[i]) {
        console.log(this.spells[3][i]);
        this.spells[m][i]===undefined ? this.spells[m].push(1) : this.spells[m][i] = 1;
          r++;
      }else{
        this.spells[m][i]===undefined ? this.spells[m].push(0) : this.spells[m][i]  = 0;
      }
    }
    return r === this.spells[m].length;
  }

  updateSpell(i: number, row: number) {
    if(this.spells[3][i] === 0 && this.spells[2][i] === row) {
      this.spells[3][i] = 1;
    }
  }

//   getLetterColor(t) {
//   var e = t.status
// , i = "gray";
//   if (this.optStatus > 0)
//   switch (e) {
//   case "error":
//     i = "#56BDFF";
//     break;
//   case "checked":
//     i = "orange";
//     break;
//   default:
//     i = "#ff0000"
//   }
//   return i
// }

  getErrColor(i:number) {
    if(this.spells[4][i] === 1 && this.spells[3][i] === 0){
      return 'err0';
    }else if (this.spells[3][i] === 0) {
      return 'err2';
    }
    return 'err6';
  }

  isErrSpell(i: number, row: number) {
    if(this.spells[4][i] === 0) {
      if (this.spells[2][i] === 0) {
        return row !== 0;
      }else if (this.spells[2][i] === 1) {
        return row !== 1;
      }
    }
    return false;
  }
}
