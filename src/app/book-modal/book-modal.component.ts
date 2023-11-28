import {Component, Input, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-book-modal',
  templateUrl: './book-modal.component.html',
  styleUrls: ['./book-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class BookModalComponent  implements OnInit {
  @Input() bookId: string = '';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() cover: string = '';
  selectedBook : boolean = false ;
  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  async dismissModal() {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss(this.selectedBook);
    }
  }

  selectBook() {
    this.selectedBook = true;
    this.dismissModal();
  }



}
