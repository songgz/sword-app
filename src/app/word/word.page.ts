import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, ModalController, ToastController} from '@ionic/angular';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {RestApiService} from "../services/rest-api.service";
import {AudioService} from "../services/audio.service";
import {StreamState} from "../services/stream-state";
import {AppCtxService} from "../services/app-ctx.service";
import {AlertModalComponent} from "../alert-modal/alert-modal.component";
import {WordTrackerService} from "../services/word-tracker.service";
import {WordReadComponent} from "../word-read/word-read.component";
import {WordListenComponent} from "../word-listen/word-listen.component";
import {WordSpellComponent} from "../word-spell/word-spell.component";
import {QuizModalComponent} from "../quiz-modal/quiz-modal.component";
import {LearnedModalComponent} from "../learned-modal/learned-modal.component";

@Component({
  selector: 'app-word',
  templateUrl: './word.page.html',
  styleUrls: ['./word.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, WordReadComponent, WordListenComponent, WordSpellComponent]
})
export class WordPage implements OnInit {

  learnTypes: any[] = [
    {code: 'review', name: '复习'},
    {code: 'beforeLearn', name: '课前测试'},
    {code: 'afterLearn', name: '课后测试'},
    {code: 'read', name: '认读'},
    {code: 'listen', name: '听读'},
    {code: 'spell', name: '拼写'},
    {code: 'matchGame', name: '消消乐'}
  ];
  started: boolean = false;

  @ViewChild('wordReadComponentRef') wordReadComponentRef: WordReadComponent | undefined;
  @ViewChild('wordListenComponentRef') wordListenComponentRef: WordListenComponent | undefined;
  @ViewChild('wordSpellComponentRef') wordSpellComponentRef: WordSpellComponent | undefined;

  constructor(public ctx: AppCtxService,
              public tracker: WordTrackerService,
              private activatedRouter: ActivatedRoute,
              private router: Router,
              //private rest: RestApiService,
              //private sanitizer: DomSanitizer,
              //private audio: AudioService,
              private modalCtrl: ModalController,
              private toastCtl: ToastController) {



  }

  ngOnInit() {

    this.activatedRouter.queryParams.subscribe((params) => {

      this.load(this.ctx.getUserId(), params['bookId'] || this.tracker.learned_book.book_id, this.ctx.learnType);


    });

  }

  load(studentId: string, bookId: string, learnType: string) {
    this.tracker.loadLearnedBook(studentId, bookId, learnType).subscribe(res => {
      if (this.tracker.isReview) {
        this.addCom();
      }else{
        this.openUnit(this.tracker.learnedUnit.unit_id);
      }
    });
  }

  ionViewDidEnter() {
    this.started = false;
  }


  openUnit(unitId: string) {
    this.started = false;
    this.tracker.getLearnUnit(unitId);
    console.log('ss');
    console.log(this.tracker.learnedUnit);
    if(this.tracker.isReview) {
      this.presentToast("请先完成复习内容!", "middle");
    }else if(this.tracker.learnedUnit.completions === this.tracker.learnedUnit.total) {
      //this.presentToast(this.tracker.learnedUnit.unit_name +"单元已学完!", "middle").then();
      this.learnedModal().then(() => {
        this.started = true;
      });
    }else if (!this.tracker.learnedUnit.before_learn_quiz) {
        this.prevUnitModal();
    }else{
        this.tracker.loadUnitWords().subscribe(res => {
          this.addCom();
        });
    }
  }

  addCom() {
    this.started = true;
    switch (this.ctx.learnType) {
      case "read":
        this.wordReadComponentRef?.performAction('initial');
        break;
      case "listen":
        this.wordListenComponentRef?.performAction('initial');
        break;
      case "spell":
        this.wordSpellComponentRef?.performAction('initial');
        break;
      default:
        console.log("It's an unknown.");
    }
  }

  async presentToast(msg: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastCtl.create({
      message: msg,
      duration: 2500,
      position: position,
      color: 'danger'
    });

    await toast.present();
  }

  async learnedModal() {
    const modal = await this.modalCtrl.create({
      component: LearnedModalComponent,
      cssClass: 'custom-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm') {
        this.tracker.deleteErrorWord().subscribe(res =>{
          this.load(this.tracker.learned_book.student_id, this.tracker.learned_book.book_id, this.tracker.learned_book.learn_type);
        });
      }
    });

    await modal.present();
  }

  async prevUnitModal() {
    const modal = await this.modalCtrl.create({
      component: AlertModalComponent,
      cssClass: 'custom-modal',
      componentProps: {
        title: '学习提示',
        message: '是否进行章节前测试？'
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm') {
        switch (this.ctx.learnType) {
          case "read":
            this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id, learnType: this.ctx.learnType, testType: 'beforeLearn'}});
            break;
          case "listen":
            this.router.navigate(['/tabs/quiz-listen'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id, learnType: this.ctx.learnType, testType: 'beforeLearn'}});
            break;
          case "spell":
            this.router.navigate(['/tabs/quiz-spell'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id, learnType: this.ctx.learnType, testType: 'beforeLearn'}});
            break;
          default:
            console.log("It's an unknown.");
        }
      } else {
        this.tracker.loadUnitWords().subscribe(res => {
          this.addCom();
        });
      }
    });

    await modal.present();
  }

  async nextUnitModal() {
    const modal = await this.modalCtrl.create({
      component: QuizModalComponent,
      cssClass: 'custom-modal'
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
    }
    if (role === 'cancel') {
    }
  }


  handleOverEvent() {
    if (this.tracker.isReview === true) {
      this.tracker.isReview = false;
      this.openUnit(this.tracker.nextLearnedUnit().unit_id);
    }else{

      switch (this.ctx.learnType) {
        case "read":
          if (this.tracker.learned_book?.book?.kind === 'FREE') {
            this.nextUnitModal();
          }else{
            this.router.navigate(['tabs/match-game'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id,bookId: this.tracker.learned_book.book_id}});
          }
          break;
        case "listen":
          this.nextUnitModal();
          break;
        case "spell":
          this.nextUnitModal();
          break;
        default:
          console.log("It's an unknown.");
      }

    }

  }

}
