import { Component, OnInit } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgOptimizedImage]
})
export class BookPage implements OnInit {
  bookCategories: any[] = [
    {code: 'ENGLISH_WORD', name: '单词速记'},
    {code: 'KNOWLEDGE', name: '知识速记'},
    {code: 'CHINESE_WORD', name: '汉字速记'}
  ];
  kinds: any[] = [
    {code: "FREE", name: "免费"},
    {code: "BABY", name: "幼儿"},
    {code: "PRIMARY", name: "小学"},
    {code: "MIDDLE", name: "初中"},
    {code: "HIGH", name: "高中"},
    {code: "COLLEGE", name: "大学"},
    {code: "GO_ABROAD", name: "出国"},
    {code: "COMMON", name: "通用"}
  ];
  books: any[] = [];
  activeKind: string = "FREE";

  constructor(private rest: RestApiService) { }

  ngOnInit() {
    this.loadBooks(this.activeKind);
  }

  loadBooks(kind: string) {
    this.rest.index('books', {kind: kind, per: 999}).subscribe(res => {
      this.books = res.data;
    });
  }

  changeCat(code: string) {
    this.activeKind = code;
    this.loadBooks(this.activeKind);
  }

  getWordImg(file: string) :string {
    return this.rest.getAssetUrl() + file;
  }

  add(id: string) {
    console.log(id);
  }

  filterBook(category: string) :any[] {
    return this.books.filter(b => b.category === category);
  }

  getCategoryCodes(): string[] {
    return this.bookCategories.map(b => b.code);
  }

}
