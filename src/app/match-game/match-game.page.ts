import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AppCtxService} from "../services/app-ctx.service";
import {QuizModalComponent} from "../quiz-modal/quiz-modal.component";
import {AudioService} from "../services/audio.service";
import {WordTrackerService} from "../services/word-tracker.service";

@Component({
  selector: 'app-match-game',
  templateUrl: './match-game.page.html',
  styleUrls: ['./match-game.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MatchGamePage implements OnInit {
  words: any[] = [];
  x: any = {};
  y: any = {};
  xCol: any[] = [];
  yCol: any[] = [];
  count: number = 0;
  page_count: number = 0;
  page_no: number = 0;
  // unitId: string = '';
  // bookId: string = '';

  constructor(private tracker: WordTrackerService,  private modalCtrl: ModalController) {

  }

  ngOnInit() {
    // this.activatedRouter.queryParams.subscribe((params) => {
    //   this.unitId = params['unitId'];
    //   this.bookId = params['bookId'];
    //   this.loadWords(this.unitId, 1);
    // });
    this.page_count = Math.ceil(this.tracker.words.length / 10);
    this.page_no = 1;
    this.words = this.paginateArray(this.tracker.words, this.page_no, 10);
    this.xCol = this.shuffleArray(this.words);
    this.yCol = this.shuffleArray(this.words);


  }

  // loadWords(unitId: string, page: number) {
  //   this.rest.index('words', {unit_id: unitId, page: page, per: 10}).subscribe(res => {
  //     this.words = res.data;
  //     this.xCol = this.shuffleArray(this.words);
  //     this.yCol = this.shuffleArray(this.words);
  //     this.page_count = res.pagination.page_count;
  //     this.page_no = res.pagination.page_no;
  //
  //   });
  // }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  clickX(w: any){
    this.x = w;
    if(this.x.id && this.y.id) {
      this.check();
    }

  }

  clickY(w: any){
    this.y = w;
    if(this.x.id && this.y.id) {
      this.check();
    }
  }

  check() {
    this.tracker.audio.stop();
    if (this.x.id === this.y.id) {
      this.x.hedden = 'myButton';
      this.y.hedden = 'myButton';
      this.count++;
      this.x = {};
      this.y = {};
      this.tracker.audio.play('http://' + window.location.host + '/assets/audio/r.mp3');
      // let n = this.xCol.findIndex(c => c.id === this.x.id);
      // this.xCol.splice(n,1);
      // let m = this.yCol.findIndex(c => c.id === this.y.id);
      // this.yCol.splice(m,1);
    }else {
      this.tracker.audio.play('http://' + window.location.host + '/assets/audio/e2.mp3');
    }
    if (this.page_no === this.page_count && this.words.length === this.count) {
      this.nextUnitModal();

    }
    console.log('ff'+this.count);
    if (this.count === 10 && this.page_no <= this.page_count) {

      //this.loadWords(this.unitId, ++this.page_no);
      this.words = this.paginateArray(this.tracker.words, ++this.page_no, 10);
      this.xCol = this.shuffleArray(this.words);
      this.yCol = this.shuffleArray(this.words);
      this.count = 0;
    }
  }

  paginateArray(array: any[], page: number, pageSize: number): any[] {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return array.slice(startIndex, endIndex);
  }

  async nextUnitModal() {
    const modal = await this.modalCtrl.create({
      component: QuizModalComponent,
      cssClass: 'custom-modal',
      componentProps: {
        title: '学习提示',
        message: '是否进行章节后测试？'
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      //this.message = `Hello, ${data}!`;
      //this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.unitId, testType: this.ctx.learnType}});

    }

    if (role === 'cancel') {
      //this.router.navigate(['/tabs/word'], {queryParams: {bookId: this.bookId, unitId: this.unitId}});


    }
  }

}
