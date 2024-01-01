import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {RestApiService} from "../services/rest-api.service";
import {RouterLink} from "@angular/router";
import {AppCtxService} from "../services/app-ctx.service";
import {HeaderComponent} from "../header/header.component";
import {ChangePasswordModalComponent} from "../change-password-modal/change-password-modal.component";
import {RemoveBookModalComponent} from "../remove-book-modal/remove-book-modal.component";

@Component({
  selector: 'app-learn',
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, HeaderComponent]
})
export class LearnPage implements OnInit {
  bookCategories: any[] = [
    {code: 'ENGLISH_WORD', name: '单词速记'},
    {code: 'KNOWLEDGE', name: '知识速记'},
    {code: 'CHINESE_WORD', name: '汉字速记'}
  ];
  learnBooks: any[] = [];
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

  constructor(public ctx: AppCtxService, private rest: RestApiService, private modalCtrl: ModalController) {
    this.selectedItem = this.learnTypes.find(lt=> lt.code === this.ctx.learnType);
    this.selectedItem.selected = true;
  }

  ngOnInit() {

  }

  ionViewDidEnter(): void {
    this.loadLearnedBooks(this.ctx.getUserId(), this.ctx.learnType);
  }

  selectItem(selectedItem: any) {
    this.learnTypes.forEach(item => item.selected = false);
    selectedItem.selected = true;
    this.selectedItem = selectedItem;
    this.ctx.learnType = selectedItem.code;
    this.loadLearnedBooks(this.ctx.getUserId(), this.ctx.learnType);
  }

  loadLearnedBooks(studentId: string, learnType: string) {
    this.rest.index('learned_books', {student_id: studentId, learn_type: learnType ,per: 999}).subscribe(res => {
      this.learnBooks = res.data || [];
    });
  }

  filterBook(category: string) :any[] {
    return this.learnBooks.filter(b => b.book?.category === category);
  }

  getWordImg(file: string) :string {
    return this.rest.getAssetUrl() + file;
  }

  getBookCategoryCodes(): string[] {
    return this.bookCategories.map(b => b.code);
  }

  deleteBook() {

  }

  async removeBookModal(learnedBook: any) {
    console.log(learnedBook);
    const modal = await this.modalCtrl.create({
      component: RemoveBookModalComponent,
      componentProps: {
        title: learnedBook.book.name,
        message: ''
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'ok') {
        if (result.data.del.length > 0) {
          this.rest.destroy('learned_books/' + learnedBook.id, {del: result.data.del}).subscribe();
          this.loadLearnedBooks(this.ctx.getUserId(), this.ctx.learnType);
        }
      }
    });



    await modal.present();
  }



}
