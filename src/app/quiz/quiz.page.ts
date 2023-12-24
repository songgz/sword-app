import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController, NavController} from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AppCtxService} from "../services/app-ctx.service";
import {WordTrackerService} from "../services/word-tracker.service";
import {OverModalComponent} from "../over-modal/over-modal.component";
import {TimerService} from "../services/timer-service";

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
  progress: number = 1;
  answered: boolean = false;
  options: string[] = ['A','B','C','D'];
  startTime: Date = new Date();
  endTime: Date | undefined;
  testTypes: any = {afterLearn: '章节后测试', beforeLearn: '章节前测试'};
  isPause: boolean = false;

  constructor(private ctx: AppCtxService, private rest: RestApiService, private activatedRouter: ActivatedRoute, private router: Router,private modalCtrl: ModalController,public timerService: TimerService) { }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
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
      this.index = 0;

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

      this.timerService.cancelTimer();
      this.timerService.startTimer(1000).subscribe({
        next: c => {
          this.progress = (10 - c) / 10;
          if (c > 9 && !this.answered) {
            console.log('cc'+c);
            this.choice_answer();
          }

        }
      });
    }
  }





  choice_answer(choiceId?: string) {
    this.question.user_answer = choiceId;
    if (this.question.right_answer === this.question.user_answer) {
      this.question.result = true;
      this.quiz.corrects++;
    } else {
      this.question.result = false;
      this.quiz.wrongs++;
    }
    //console.log(this.question);
    this.answered = true;

      this.timerService.delayTimer(2000, ()=>{
        if(!this.isPause){
          this.next();
        }
      });
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
        total: this.quiz.total,
        rights: this.quiz.corrects,
        wrongs: this.quiz.wrongs,
        score: this.quiz.score
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.router.navigate(['/tabs/quiz-list'], {queryParams: {studentId: this.ctx.getUserId()}});

    }


  }

  stop() {
    this.isPause = true;
    this.timerService.pauseTimer();
  }


  start() {
    this.isPause = false;
    this.next();
  }

  ionViewDidLeave(): void {
    this.timerService.cancelTimer();
  }

}
