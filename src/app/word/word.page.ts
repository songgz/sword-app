import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {ActivatedRoute} from "@angular/router";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {RestApiService} from "../services/rest-api.service";
import {AudioService} from "../services/audio.service";

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
  states: any = {survey: {result: null, color: ''}, evaluate: {result: null, color: ''}, repeater: {result: null}, next: {result: null}};
  state: any = 'survey';
  errLevels: number[] = [1, 3, 6, 12, 24, 48];
  learnedUnit: any = {};
  traces: string[] = [];

  constructor(private router: ActivatedRoute, private rest: RestApiService,private sanitizer: DomSanitizer, private audio: AudioService) { }

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
    this.loadLearnedUnits('653c68696eec2f1ea8aa1a2a', unitId);
  }

  loadUnits(bookId: string) {
    this.rest.index('units', {book_id: bookId}).subscribe(res => {
      this.units = res.data;
      this.loadWords(this.units[0].id)
    });
  }

  loadLearnedUnits(studentId: string, unitId: string) {
    this.rest.index('learned_units', {student_id: studentId, unit_id: unitId}).subscribe(res => {
      this.learnedUnit = res.data[0];
    });
  }

  openUnit(unitId: string) {
    this.loadWords(unitId);
  }

  survey(value: boolean) {
    this.audio.playStream(this.getWordAudio(this.word.pronunciation)).subscribe();
    this.states['survey']['result'] = value;
    if (value) {
      this.state = 'evaluate';
    } else {
      this.state = 'repeater';
    }
  }


  evaluate(value: boolean) {
    this.states['evaluate']['result'] = value;
    if (value) {
      this.state = 'survey' ;
      this.nextWord();
    } else {
      this.state = 'repeater';
    }

  }

  repeater() {
    this.audio.playStream(this.getWordAudio(this.word.pronunciation)).subscribe();
    this.state = 'next';
  }

  next() {
      this.state = 'survey';
      this.nextWord();
  }
  nextWord() {

    let index = this.words.findIndex(w => w.id === this.word.id);
    let next = index + 1;
    if (next < this.words.length) {
      this.word = this.words[next];
    }

  }

  getWordAudio(file: string): string {
    if (file) {
      return this.rest.getAssetUrl() + 'quick/v' + file;
    }
    return '';
  }

  makeQuestion() {

  }

}
