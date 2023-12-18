import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {interval, map, Subscription, take, tap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {AppCtxService} from "../services/app-ctx.service";
import {QuizModalComponent} from "../quiz-modal/quiz-modal.component";
import {WordTrackerService} from "../services/word-tracker.service";
import {OverModalComponent} from "../over-modal/over-modal.component";

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class QuizPage implements OnInit {
  quiz: any = {};
  index: number = 0;
  question: any = {};
  //corrects: number = 0;
  //errors: number = 0;
  progress: number = 1;
  answered: boolean = false;
  count: Subscription | undefined;
  options: string[] = ['A','B','C','D'];
  startTime: Date = new Date();
  endTime: Date | undefined;
  private unitId: any;
  testTypes: any = {afterLearn: '章节后测试', beforeLearn: '章节前测试'};


  constructor(private ctx: AppCtxService, private tracker: WordTrackerService, private rest: RestApiService, private activatedRouter: ActivatedRoute, private router: Router,private modalCtrl: ModalController) { }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.unitId = params['unitId'];
      this.loadQuiz(this.ctx.getUserId(), params['unitId'], params['testType'], this.ctx.learnType);
      //this.loadQuiz('6573ea546eec2f4aa8c3ccb8', '65109f9c6eec2f38fc262392', 'afterQuiz', 'read');
    });
  }

  loadQuiz(studentId: string, unitId: string, testType: string, learnType: string) {
    this.rest.create('quizzes',{student_id: studentId, unit_id: unitId, test_type: testType, learn_type: learnType}).subscribe(res => {
      this.quiz = res.data;
      this.quiz.corrects = 0;
      this.quiz.wrongs = 0;
      this.startTime = new Date();
      this.next();
    });
  }

  saveQuiz() {
    this.rest.update("quizzes/" + this.quiz.id, {quiz: this.quiz}).subscribe(res => {

    });
  }

  next() {
    if (this.index === this.quiz.questions.length) {
      this.endTime = new Date();
      this.quiz.duration = Math.floor(this.endTime.getTime() - this.startTime.getTime());
      this.quiz.score = Math.round(100 * this.quiz.corrects / this.quiz.total);
      this.saveQuiz();
      this.quizOverModal();
    }else{
      this.answered = false;
      this.question = this.quiz.questions[this.index];
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



  async choice_answer(choiceId?: string) {
    console.log(choiceId);
    console.log(this.question.right_answer === choiceId);
    this.count?.unsubscribe();
    this.question.user_answer = choiceId;
    if (this.question.right_answer === this.question.user_answer) {
      this.question.result = true;
      this.quiz.corrects = this.quiz.corrects + 1;
    } else {
      this.question.result = false;
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
