import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";

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

  constructor(private rest: RestApiService, private ctx: AppCtxService) { }

  ngOnInit() {
    this.loadQuiz('657415236eec2f4bc81ea60a');
  }

  loadQuiz(quizId: string) {
    this.rest.show('quizzes/'+quizId, {}).subscribe(res => {
      this.quiz = res.data;
    });

  }

}
