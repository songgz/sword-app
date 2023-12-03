import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {BookModalComponent} from "../book-modal/book-modal.component";
import {AppCtxService} from "../services/app-ctx.service";

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
  learnedBooks: any[] = [];
  activeKind: string = "FREE";

  constructor(private ctx: AppCtxService, private rest: RestApiService, private sanitizer: DomSanitizer, private modalController: ModalController) {
    this.loadLearnedBooks(this.ctx.user_id, this.ctx.learnType);
    this.loadBooks(this.activeKind);
  }

  ngOnInit() {

  }

  isLearned(bookId: string) {
    return  -1 !== this.learnedBooks.findIndex(b => b.book_id === bookId);
  }

  loadBooks(kind: string) {
    this.rest.index('books', {kind: kind, per: 999}).subscribe(res => {
      this.books = res.data;
    });
  }

  loadLearnedBooks(studentId: string, learnType: string) {
    this.rest.index('learned_books', {student_id: studentId, learn_type: learnType, per: 999}).subscribe(res => {
      this.learnedBooks = res.data;
    });
  }

  changeCat(code: string) {
    this.activeKind = code;
    this.loadBooks(this.activeKind);
  }

  getWordImg(file: string) :string {
    return this.rest.getAssetUrl() + file;
  }

  filterBook(category: string) :any[] {
    return this.books.filter(b => b.category === category);
  }

  getCategoryCodes(): string[] {
    return this.bookCategories.map(b => b.code);
  }

  formatText(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/<br\/>/g, '<br/>'));
  }

  async presentCustomAlert(bookId: string) {
    let book = this.books.find(b => b.id === bookId);
    const modal = await this.modalController.create({
      component: BookModalComponent,
      componentProps: {
        title: book.name,
        message: book.desc,
        cover: this.getWordImg(book.cover)
      },

    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.addBook(this.ctx.user_id, book.id, this.ctx.learnType);
    }
  }

  addBook(studentId: string, bookId: string, learnType: string) {
    this.rest.create('learned_books', {student_id: studentId, book_id: bookId, learn_type: learnType}).subscribe(res => {
      this.learnedBooks.push(res.data);
    });
  }

  add(id: string) {
    this.presentCustomAlert(id);
    console.log(id);
  }

}
