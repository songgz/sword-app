import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {interval, map, Subscription, take, tap} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {AppCtxService} from "../services/app-ctx.service";

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


  constructor(private ctx: AppCtxService, private rest: RestApiService, private activatedRouter: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.loadQuiz(this.ctx.getUserId(), params['unitId'], params['testType'], this.ctx.learnType);
    });


  }

  saveQuiz() {
    this.rest.update("quizzes/" + this.quiz.id, this.quiz).subscribe(res => {

    });
  }

  next() {
    if (this.index === this.quiz.questions.length) {
      this.saveQuiz();

    }
    this.answered = false;
    this.question = this.quiz.questions[this.index];
    this.index = this.index + 1;
    this.count = this.countDown(5000).subscribe({
      //next: step => {},
      error: err => console.error(err),
      complete: () => {
        this.choice_answer();
      }
    });
  }

  countDown(delay: number ) {
    let step = delay / 100;
    return interval(step).pipe(
      take(100),
      map(x => 100 - x - 1),
      tap(n => this.progress = n / 100.0)
    );
  }

  loadQuiz(studentId: string, unitId: string, testType: string, learnType: string) {
    this.rest.create('quizzes',{student_id: studentId, unit_id: unitId, test_type: testType, learn_type: learnType}).subscribe(res => {
      this.quiz = res.data;
      this.next();
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
    await this.sleep(2500);
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

}
