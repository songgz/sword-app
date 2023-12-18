import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {interval, map, Subscription, take, tap} from "rxjs";
import {AppCtxService} from "../services/app-ctx.service";
import {WordTrackerService} from "../services/word-tracker.service";
import {RestApiService} from "../services/rest-api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {OverModalComponent} from "../over-modal/over-modal.component";

@Component({
  selector: 'app-quiz-spell',
  templateUrl: './quiz-spell.page.html',
  styleUrls: ['./quiz-spell.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class QuizSpellPage implements OnInit {
  quiz: any = {};
  index: number = 0;
  question: any = {};
  progress: number = 1;
  answered: boolean = false;
  private unitId: any;
  mySpell: any = {
    word: [],
    option1: [],
    option2: [],
    answer: [],
    answerResult: [],
    revise: [],
    reviseResult: []
  };
  word: any;
  private answer: boolean = false;
  count: Subscription | undefined;
  testTypes: any = {afterLearn: '章节后测试', beforeLearn: '章节后测试'};

  constructor(private ctx: AppCtxService, public tracker: WordTrackerService,  private rest: RestApiService, private activatedRouter: ActivatedRoute, private router: Router,private modalCtrl: ModalController) { }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.unitId = params['unitId'];
      this.loadQuiz(this.ctx.getUserId(), params['unitId'], params['testType'], this.ctx.learnType);
      //this.loadQuiz('6573ea546eec2f4aa8c3ccb8', '65109f9c6eec2f38fc262392', 'afterQuiz', 'listen');
    });
  }

  loadQuiz(studentId: string, unitId: string, testType: string, learnType: string) {
    this.rest.create('quizzes',{student_id: studentId, unit_id: unitId, test_type: testType, learn_type: learnType}).subscribe(res => {
      this.quiz = res.data;
      this.next();
    });
  }

  saveQuiz() {
    this.rest.update("quizzes/" + this.quiz.id, this.quiz).subscribe(res => {

    });
  }

  initSpell(word: string) {
    this.mySpell = {
      word: [],
      option1: [],
      option2: [],
      answer: [],
      answerResult: [],
      revise: [],
      reviseResult: []
    };

    this.randSpellOption(word);
    console.log(this.mySpell);
  }

  randSpellOption(word: string) {
    this.mySpell.word = word.split('');
    let letters = this.getRandomLetters(this.mySpell.word);
    let num = 0;
    for (let i = 0; i < this.mySpell.word.length; i++) {
      num = Math.floor(Math.random() * 99);
      if (num % 2 === 0) {
        this.mySpell.option1.push(this.mySpell.word[i]);
        this.mySpell.option2.push(letters[i]);
      } else {
        this.mySpell.option1.push(letters[i]);
        this.mySpell.option2.push(this.mySpell.word[i]);
      }
    }
  }

  spellOptionReply(option: string, col: number) {
    if (col === this.mySpell.answer.length) {
      this.mySpell.answer.push(this.mySpell[option][col]);
    } else if (col < this.mySpell.answer.length) {
      this.mySpell.answer[col] = this.mySpell[option][col];
    }

    if (this.isSpellOver()) {
      if (this.check('answer')) {
        this.answer = true;
      }else {
        this.answer = false;
      }
      this.choice_answer();
    }


  }

  isSpellOver() {
    return this.mySpell.answer.length === this.mySpell.word.length;
  }

  check(typ: string): boolean {
    for (let i = 0; i < this.mySpell.word.length; i++) {
      if (this.mySpell[typ][i] === this.mySpell.word[i]) {
        this.mySpell[typ + 'Result'][i] = 1;
      } else {
        this.mySpell[typ + 'Result'][i] = 0;
      }
    }
    return this.mySpell[typ + 'Result'].reduce((sum: number, n: number) => sum + n, 0) === this.mySpell.word.length;
  }

  isErrorLetter(typ: string, col: number): boolean {
    //this.currentState === this.State.Survey
    return this.mySpell[typ + 'Result'][col] === 1;
  }

  getCellColor(option: string, col: number) {
    if (!this.answered) {
      return this.mySpell.answer[col] === this.mySpell[option][col] ? 'hui-col' : '';
    }else{
      if (this.mySpell.answerResult[col] === 0) {
        return this.mySpell.word[col] === this.mySpell[option][col] ? 'err-col' : '';

      }
    }
    return '';


  }

  getLetterColor(col: number) {
    if (this.mySpell.reviseResult[col] === 1 && this.mySpell.answerResult[col] === 0) {
      return 'err0';
    } else if (this.mySpell.answerResult[col] === 0) {
      return 'err2';
    }
    return 'err6';
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


  next() {
    if (this.index === this.quiz.questions.length) {
      this.saveQuiz();
      //this.quizOverModal();
    }else{
      this.answered = false;
      this.question = this.quiz.questions[this.index];
      this.word = this.tracker.findWord(this.question.word_id);
      this.initSpell(this.word.word);
      //console.log(this.tracker.findWord(this.question.word_id));
      //this.tracker.playWord(this.tracker.findWord(this.question.word_id));
      this.index = this.index + 1;

      this.count = this.countDown(10000).subscribe({
        //next: step => {},
        error: err => console.error(err),
        complete: () => {
          this.choice_answer();
        }
      });

    }
  }


  async choice_answer() {
    this.count?.unsubscribe();
    if (this.answer) {
      this.question.result = true;
      this.quiz.corrects = this.quiz.corrects + 1;
    } else {
      this.quiz.wrongs = this.quiz.wrongs + 1;
    }
    this.answered = true;
    await this.sleep(2000);
    this.next();

  }

  sleep(ms: number) {
    return new Promise(resolve=>setTimeout(resolve, ms))
  }

  countDown(delay: number ) {
    let step = delay / 100;
    return interval(step).pipe(
      take(100),
      map(x => 100 - x - 1),
      tap(n => this.progress = n / 100.0)
    );
  }

  async quizOverModal() {
    const modal = await this.modalCtrl.create({
      component: OverModalComponent,
      cssClass: 'custom-modal',
      componentProps: {
        total: this.quiz.questions?.length,
        rights: this.quiz.corrects,
        wrongs: this.quiz.wrongs,
        score: 0
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      //this.message = `Hello, ${data}!`;
      this.router.navigate(['/tabs/quiz-list'], {queryParams: {studentId: this.ctx.getUserId()}});

    }
  }




}
