import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {ActivatedRoute} from "@angular/router";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {RestApiService} from "../services/rest-api.service";

@Component({
  selector: 'app-word',
  templateUrl: './word.page.html',
  styleUrls: ['./word.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class WordPage implements OnInit {
  units: any[] = [];
  words: any[] = [];
  word: any = {};
  states: any = {test: {result: null, color: ''}, review: {result: null, color: ''}, read: {result: null}};
  state: any = 'test';

  constructor(private router: ActivatedRoute, private rest: RestApiService,private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.router.queryParams.subscribe((res)=>{
      this.loadUnits(res['bookId']);
    });

  }

  formatText(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/<br\/>/g, '<br/>'));
  }

  getWordImg(file: string): string {
    return this.rest.getAssetUrl() + 'quick/img' + file;
  }

  loadWords(unitId: string) {
    this.rest.index('words', {unit_id: unitId}).subscribe(res => {
      this.words = res.data;
      this.word = this.words[0];
    });

  }

  loadUnits(bookId: string) {
    this.rest.index('units', {book_id: bookId}).subscribe(res => {
      this.units = res.data;
      this.loadWords(this.units[0].id)
    });
  }

  openUnit(unitId: string) {
    this.loadWords(unitId);
  }

  know(value: boolean) {
    this.states['test']['result'] = value;
    if (value) {
      this.state = 'review';
    } else {
      this.state = 'read';
    }
  }

  review(value: boolean) {
    this.states['review']['result'] = value;
    if (value) {
      this.state = 'test' ;
      this.nextWord();
    } else {
      this.state = 'read';
    }

  }

  nextWord() {
    let index = this.words.findIndex(w => w.id === this.word.id);
    let next = index + 1;
    if (next < this.words.length) {
      this.word = this.words[next];
    }
  }

}
