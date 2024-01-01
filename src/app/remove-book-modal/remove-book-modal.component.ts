import {Component, Input, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-remove-book-modal',
  templateUrl: './remove-book-modal.component.html',
  styleUrls: ['./remove-book-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RemoveBookModalComponent  implements OnInit {
  isRecord: boolean = false;
  isBook: boolean = false;
  @Input() title: string | undefined;
  @Input() message: string | undefined;
  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  submit() {
    let data = {del: ''};
    if (this.isBook) {
      data.del = 'book';
    }else if (this.isRecord) {
      data.del = 'record';
    }
    this.modalCtrl.dismiss(data, 'ok');
  }

}
