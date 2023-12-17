import {Component, Input, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {WordTrackerService} from "../services/word-tracker.service";
import {AppCtxService} from "../services/app-ctx.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-quiz-modal',
  templateUrl: './quiz-modal.component.html',
  styleUrls: ['./quiz-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class QuizModalComponent  implements OnInit {
  @Input() title: string | undefined;
  @Input() message: string | undefined;
  @Input() customStyles: any;

  constructor(public modalCtrl: ModalController, public tracker: WordTrackerService, public ctx: AppCtxService, private router: Router) {

  }

  ngOnInit() {}



  afterQuiz() {

    if(this.ctx.learnType === 'read') {
      this.router.navigate(['tabs/quiz'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id,learnType: this.ctx.learnType, testType: 'afterLearn'}});

    }
    if(this.ctx.learnType === 'listen') {
      this.router.navigate(['tabs/quiz-listen'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id,learnType: this.ctx.learnType, testType: 'afterLearn'}});

    }

    if(this.ctx.learnType === 'spell') {
      this.router.navigate(['tabs/quiz-spell'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id,learnType: this.ctx.learnType, testType: 'afterLearn'}});

    }


    this.modalCtrl.dismiss(null, 'ok');



  }

  nextUnit() {
    this.router.navigate(['tabs/word'], {queryParams: {bookId: this.tracker.book.id}});
    this.modalCtrl.dismiss(null, 'ok');

  }

  blackLearnCenter(){
    this.router.navigate(['tabs/learn']);
    this.modalCtrl.dismiss(null, 'ok');

  }



}
