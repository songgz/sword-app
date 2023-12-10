import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertModalComponent} from "../alert-modal/alert-modal.component";
import {AppCtxService} from "../services/app-ctx.service";

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
  unitId: string = '';
  bookId: string = '';

  constructor(private ctx: AppCtxService, private rest: RestApiService, private activatedRouter: ActivatedRoute,private router: Router, private modalCtrl: ModalController) {

  }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.unitId = params['unitId'];
      this.bookId = params['bookId'];
      this.loadWords(this.unitId, 1);
    });

  }

  loadWords(unitId: string, page: number) {
    this.rest.index('words', {unit_id: unitId, page: page, per: 10}).subscribe(res => {
      this.words = res.data;
      this.xCol = this.shuffleArray(this.words);
      this.yCol = this.shuffleArray(this.words);
      this.page_count = res.pagination.page_count;
      this.page_no = res.pagination.page_no;

    });
  }

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
    this.check();
  }

  clickY(w: any){
    this.y = w;
    this.check();
  }

  check() {
    if (this.x.id === this.y.id) {
      this.x.hedden = 'myButton';
      this.y.hedden = 'myButton';
      this.count++;
      // let n = this.xCol.findIndex(c => c.id === this.x.id);
      // this.xCol.splice(n,1);
      // let m = this.yCol.findIndex(c => c.id === this.y.id);
      // this.yCol.splice(m,1);
    }

    if (this.page_no === this.page_count && this.words.length === this.count) {
      this.nextUnitModal();

    }
    if (this.count === 10 && this.page_no <= this.page_count) {

      this.loadWords(this.unitId, ++this.page_no);
      this.count = 0;
    }
  }

  async nextUnitModal() {
    const modal = await this.modalCtrl.create({
      component: AlertModalComponent,
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
      this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.unitId, testType: this.ctx.learnType}});

    }

    if (role === 'cancel') {
      this.router.navigate(['/tabs/word'], {queryParams: {bookId: this.bookId, unitId: this.unitId}});


    }
  }

}
