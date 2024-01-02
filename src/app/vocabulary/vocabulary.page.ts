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
  private pagination: any = {page_no: 0};
  private query: any = {};

  constructor(private rest: RestApiService, private activatedRouter: ActivatedRoute, public ctx: AppCtxService, private  audio: AudioService) { }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe((params) => {
      this.query = {student_id: params["studentId"], book_id: params["bookId"], learn_type: params["learnType"]};
      this.loadErrorWord();
    });
  }

  loadErrorWord() {
    this.rest.show('learned_books/0', this.query).subscribe(res => {
      this.learnedBook = res.data;
      this.pagination = res.pagination;
    });

  }

  playWord(pronunciation: string) {
    this.audio.play(this.rest.getWordAudio(pronunciation));
  }


}
