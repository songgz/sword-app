import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {RouterLink} from "@angular/router";
import {AppCtxService} from "../services/app-ctx.service";

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
//<ion-icon name="eye-outline"></ion-icon>
 //<ion-icon name="headset-outline"></ion-icon>
  //<ion-icon name="create-outline"></ion-icon>
  //<ion-icon name="pencil-outline"></ion-icon>
  learnTypes: any[] = [
    { iconName: 'pencil-outline', code: 'spell', selected: false },
    { iconName: 'headset-outline',code: 'listen', selected: false },
    { iconName: 'eye-outline', code: 'read', selected: false }
  ];
  selectedItem: any = this.learnTypes[2];

  constructor(private ctx: AppCtxService, private rest: RestApiService) { }

  ngOnInit() {
    this.loadLearnedBooks(this.ctx.user.id, this.ctx.learnType);
  }

  selectItem(selectedItem: any) {
    this.learnTypes.forEach(item => item.selected = false);
    selectedItem.selected = true;
    this.ctx.learnType = selectedItem.code;
  }

  loadLearnedBooks(studentId: string, learnType: string) {
    this.rest.index('learned_books', {student_id: studentId, learn_type: learnType ,per: 999}).subscribe(res => {
      this.books = res.data || [];
    });
  }

  filterBook(category: string) :any[] {
    return this.books.filter(b => b.book?.category === category);
  }

  getWordImg(file: string) :string {
    return this.rest.getAssetUrl() + file;
  }

  getBookCategoryCodes(): string[] {
    return this.bookCategories.map(b => b.code);
  }

}
