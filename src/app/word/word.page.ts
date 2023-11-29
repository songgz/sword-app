import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {RestApiService} from "../services/rest-api.service";
import {AudioService} from "../services/audio.service";
import {WordTrackerService} from "../services/word-tracker.service";
import {QuizAlertComponent} from "../quiz-alert/quiz-alert.component";
import {WordTracker} from "../services/WordTracker";
import {WordState} from "../services/word-state";


@Component({
  selector: 'app-word',
  templateUrl: './word.page.html',
  styleUrls: ['./word.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, QuizAlertComponent]
})
export class WordPage implements OnInit {
  units: any[] = [];
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

  constructor(private activatedRouter: ActivatedRoute, private router: Router, private rest: RestApiService, private sanitizer: DomSanitizer, private audio: AudioService, private alertController: AlertController) {
    this.tracker = new WordTracker();
    this.activatedRouter.queryParams.subscribe((params) => {
      this.loadLearnedBook('653c68696eec2f1ea8aa1a2a', params['bookId']);
      this.loadUnits(params['bookId']);
    });

  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    //this.presentAlert();
  }


  loadUnits(bookId: string) {
    this.rest.index('units', {book_id: bookId}).subscribe(res => {
      this.units = res.data;
      this.unit = this.units[0];
      //this.loadWords(this.unit.id);
      // this.loadErrorWords('653c68696eec2f1ea8aa1a2a', this.unit.id);
    });
  }

  loadLearnedBook(studentId: string, bookId: string) {
    this.rest.show('learned_books/0', {student_id: studentId, book_id: bookId}).subscribe(res => {

      let errorWords = res.data.error_words;
      this.learnedUnits = res.data.learned_units;
      if (errorWords.length > 0) {
        this.tracker.loadErrWords(errorWords);
        this.word = this.tracker.getWord();


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
    this.unit = this.units.find(u => u.id === unitId);
    this.loadWords(this.unit.id);
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
      if (this.learnedUnits.length > 0) {
        this.loadWords(this.learnedUnits[0].unit_id);

      }

    }else{
      this.tracker.next();
      this.word = this.tracker.getWord();
      this.state = 'survey';
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
            console.log('Alert canceled');
          },
        },
        {
          text: '确定',
          role: 'confirm',
          handler: () => {
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
