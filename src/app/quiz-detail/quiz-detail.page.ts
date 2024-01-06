import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.page.html',
  styleUrls: ['./quiz-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class QuizDetailPage implements OnInit {
  quiz: any = {};
  options: string[] = ['A','B','C','D'];

  constructor(private rest: RestApiService, private ctx: AppCtxService, private activatedRouter: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.loadQuiz(params['quizId']);
    });

  }

  loadQuiz(quizId: string) {
    this.rest.show('quizzes/'+quizId, {}).subscribe(res => {
      this.quiz = res.data;
    });

  }

  getChoiceLetter(question: any) {
    let i = question.choices.findIndex((c:any)=> c.id === question.user_answer);
    return this.options[i];
  }

  getOptionColor(question: any, choice: any) {
    if (question.right_answer === choice.id) {
      return 'err1';
    }else{
      if (question.user_answer === choice.id) {
        return 'danger';
      }
    }
    return '';
  }

}
