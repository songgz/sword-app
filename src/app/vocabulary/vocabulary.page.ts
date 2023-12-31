import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {ActivatedRoute} from "@angular/router";
import {AppCtxService} from "../services/app-ctx.service";
import {AudioService} from "../services/audio.service";

@Component({
  selector: 'app-vocabulary',
  templateUrl: './vocabulary.page.html',
  styleUrls: ['./vocabulary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class VocabularyPage implements OnInit {
  learnedBook: any = {};

  constructor(private rest: RestApiService, private activatedRouter: ActivatedRoute, public ctx: AppCtxService, private  audio: AudioService) { }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.loadErrorWord(params["studentId"],params["bookId"],params["learnType"]);
    });
  }

  loadErrorWord(studentId: string, bookId: string, learnType: string) {
    this.rest.show('learned_books/0', {student_id: studentId, book_id: bookId, learn_type: learnType}).subscribe(res => {
      this.learnedBook = res.data;
    });

  }

  playWord(pronunciation: string) {
    this.audio.play(this.rest.getWordAudio(pronunciation));
  }
}
