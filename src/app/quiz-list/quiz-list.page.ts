import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule, NavController} from '@ionic/angular';
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

  constructor(private rest: RestApiService, private ctx: AppCtxService, private navCtrl: NavController) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.loadQuizzes(this.ctx.getUserId());
  }

  loadQuizzes(studentId: string) {
    this.rest.index('quizzes', {student_id: studentId}).subscribe(res => {
      this.quizzes = res.data;
    });
  }

  goBack() {
    this.navCtrl.back();
  }

}
