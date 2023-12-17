import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.page.html',
  styleUrls: ['./quiz-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class QuizListPage implements OnInit {
  quizzes: any[] = [];

  constructor(private rest: RestApiService, private ctx: AppCtxService) { }

  ngOnInit() {
    this.loadQuizzes(this.ctx.getUserId());
  }

  loadQuizzes(studentId: string) {
    this.rest.index('quizzes', {studentId: studentId}).subscribe(res => {
      this.quizzes = res.data;
    });

  }

}
