import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-learn',
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class LearnPage implements OnInit {
  bookCategories: any[] = [
    {code: 'ENGLISH_WORD', name: '单词速记'},
    {code: 'KNOWLEDGE', name: '知识速记'},
    {code: 'CHINESE_WORD', name: '汉字速记'}
  ];
  books: any[] = [];

  constructor(private rest: RestApiService) { }

  ngOnInit() {
    console.log(this.bookCategories.map(b => b.code));
    this.loadBooks();
  }

  loadBooks() {
    this.rest.index('books').subscribe(res => {
      this.books = res.data || [];
    });
  }

  filterBook(category: string) :any[] {
    return this.books.filter(b => b.category === category);
  }

  getWordImg(file: string) :string {
    return this.rest.getAssetUrl() + file;
  }

  getBookCategoryCodes(): string[] {
    return this.bookCategories.map(b => b.code);
  }

}
