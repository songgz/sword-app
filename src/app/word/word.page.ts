import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
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

  constructor(public ctx: AppCtxService, public tracker: WordTrackerService, private activatedRouter: ActivatedRoute, private router: Router, private rest: RestApiService, private sanitizer: DomSanitizer, private audio: AudioService, private modalCtrl: ModalController) {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.tracker.loadLearnedBook(this.ctx.getUserId(), params['bookId'], this.ctx.learnType).subscribe(res => {
        if (this.tracker.isReview) {
          this.started = true;
          if(ctx.learnType === 'read'){
            this.wordReadComponentRef?.performAction('initial');
          }
          if(ctx.learnType === 'listem') {
            this.wordListenComponentRef?.performAction('initial');
          }
          if(ctx.learnType === 'spell') {
            this.wordSpellComponentRef?.performAction('initial');
          }
        }else{
          this.prevUnitModal().then(a=> {
            this.started = true;
          });
        }
      });
    });

  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.started = false;
  }


  openUnit(unitId: string) {
    this.started = false;
    this.tracker.getLearnUnit(unitId);
    this.tracker.loadUnitWords().subscribe();
    //this.loadWords(unitId);
    this.prevUnitModal();
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
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {

      if(this.ctx.learnType === 'read') {
        this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id, learnType: this.ctx.learnType, testType: 'beforeLearn'}});
      }
      if(this.ctx.learnType === 'listen') {
        this.router.navigate(['/tabs/quiz-listen'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id, learnType: this.ctx.learnType, testType: 'beforeLearn'}});

      }
      if(this.ctx.learnType === 'spell') {
        this.router.navigate(['/tabs/quiz-spell'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id, learnType: this.ctx.learnType, testType: 'beforeLearn'}});

      }

    }

    if (role === 'cancel') {
      this.started = true;
      this.wordReadComponentRef?.performAction('initial');
    }
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
      this.openUnit(this.tracker.nextLearnedUnit().unit_id);
    }else{
      if (this.ctx.learnType === 'read') {
        this.router.navigate(['tabs/match-game'], {queryParams: {unitId: this.tracker.learnedUnit.unit_id,bookId: this.tracker.learned_book.book_id}});

      }
      if(this.ctx.learnType === 'listen') {
        this.nextUnitModal();
      }

    }

  }

}
