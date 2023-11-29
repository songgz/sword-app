import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {ActivatedRoute} from "@angular/router";

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

  constructor(private rest: RestApiService, private activatedRouter: ActivatedRoute) {

  }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      //this.loadQuiz('653c68696eec2f1ea8aa1a2a', params['unitId'], params['testType']);
      this.loadWords(params['unitId'], 1);
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
    if (this.count == 10 && this.page_no <= this.page_count) {
      this.loadWords('65109f9c6eec2f38fc262392', ++this.page_no);
      this.count = 0;
    }
  }

}
