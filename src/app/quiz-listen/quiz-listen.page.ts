import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {interval, map, Subscription, take, tap} from "rxjs";
import {MemoryState} from "../models";
import {WordTrackerService} from "../services/word-tracker.service";
import {RestApiService} from "../services/rest-api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {OverModalComponent} from "../over-modal/over-modal.component";
import {AppCtxService} from "../services/app-ctx.service";

@Component({
  selector: 'app-quiz-listen',
  templateUrl: './quiz-listen.page.html',
  styleUrls: ['./quiz-listen.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class QuizListenPage implements OnInit {
  quiz: any = {};
  index: number = 0;
  question: any = {};
  progress: number = 1;
  answered: boolean = false;
  count: Subscription | undefined;
  options: string[] = ['A','B','C','D'];
  private unitId: any;
  testTypes: any = {afterLearn: '章节后测试', beforeLearn: '章节前测试'};

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

  async choice_answer(choiceId?: string) {
    console.log(choiceId);
    console.log(this.question.right_answer === choiceId);
    this.count?.unsubscribe();
    this.question.user_answer = choiceId;
    if (this.question.right_answer === this.question.user_answer) {
      this.question.result = true;
      this.quiz.corrects = this.quiz.corrects + 1;
    } else {
      this.quiz.wrongs = this.quiz.wrongs + 1;
    }
    this.answered = true;
    await this.sleep(2000);
    this.next();

    if (this.index === this.quiz.questions.length) {
      this.count?.unsubscribe();

    }

  }

  sleep(ms: number) {
    return new Promise(resolve=>setTimeout(resolve, ms))
  }


  next() {
    if (this.index === this.quiz.questions.length) {
      this.saveQuiz();
      this.quizOverModal();
    }else{
      this.answered = false;
      this.question = this.quiz.questions[this.index];
      console.log(this.tracker.findWord(this.question.word_id));
      this.tracker.playWord(this.tracker.findWord(this.question.word_id));
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


  showAnswer(choiceId: string) {
    if (this.answered) {
      if (this.question.right_answer === choiceId) {
        return 'success';
      } else {
        if (this.question.user_answer === choiceId) {
          return 'danger';
        }
      }
    }
    return '';
  }


}
