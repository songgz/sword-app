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
  words: any[] = [];
  word: any = {};
  learnedUnits: any[] = [];
  errorWords: any[] = [];

  state: any = 'survey';
  tracker: any = {};
  options: any[] = [];
  completed: boolean = false;

  constructor(private activatedRouter: ActivatedRoute, private router: Router, private rest: RestApiService, private sanitizer: DomSanitizer, private audio: AudioService, private alertController: AlertController) {
    this.tracker = new WordTrackerService();
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

      this.errorWords = res.data.error_words;
      this.learnedUnits = res.data.learned_units;
      if (this.errorWords.length > 0) {

        this.tracker.loadErrorWords(this.errorWords);
        this.word = this.tracker.word;

        //this.tracker.loadWords(this.words);

      }
    });
  }

  loadWords(unitId: string) {
    this.rest.index('words', {unit_id: unitId}).subscribe(res => {
      console.log(res.data);
      this.words = res.data;
      this.tracker.loadWords(this.words);
      this.word = this.tracker.word;

    });
  }

  openUnit(unitId: string) {
    this.unit = this.units.find(u => u.id === unitId);
    this.loadWords(this.unit.id);
    //this.loadErrorWords('653c68696eec2f1ea8aa1a2a', this.unit.id);
    this.presentAlert();
  }

  playWord() {
    this.audio.playStream(this.getWordAudio(this.tracker.word.pronunciation)).subscribe();
  }

  survey(value: boolean) {
    this.playWord();


    if (value) {
      this.state = 'evaluate';
    } else {
      this.completed = false;
      this.state = 'repeater';
    }
  }


  evaluate(value: boolean) {
    if (value) {
      this.completed = true;
      this.next();
      this.state = 'survey';
    } else {
      this.completed = false;
      this.state = 'repeater';
    }
  }

  repeater() {
    this.playWord();
    this.state = 'next';
  }

  next() {
    if (this.completed) {
      this.tracker.correctAnswer();
    }else{
      this.tracker.wrongAnswer();
    }
    this.tracker.reoccur();

    if (this.word.repeats === 5) {
      this.getRandomWords(4);
    }

    if (this.tracker.index + 1 === this.tracker.indexes.length) {
      if (this.learnedUnits.length > 0) {
        this.loadWords(this.learnedUnits[0].unit_id);

      }

    }else{
      this.tracker.next();
      this.word = this.tracker.word;
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
    let m = this.tracker.getWordIdx();
    let randomIndex = -1;
    while (this.options.length < n) {
      randomIndex = Math.floor(Math.random() * this.tracker.words.length);
      if (m !== randomIndex) {
        this.options.push(this.tracker.words[randomIndex]);
      }
      if (this.options.length === n - 1) {
        this.options.splice(m % n, 0, this.tracker.word);
      }
    }
    return this.options;
  }

  replyOption(wordId: string) {
    console.log(wordId);
    console.log(this.word.id);
    console.log(this.options);
    console.log("qqq"+this.word.repeats);
    this.completed = (wordId === this.word.id);
    this.next();

    console.log("hhh"+this.word.repeats);
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
