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
  removeForm: any = {user_id: '', old_password: '', new_password: '', confirm_password: ''};
  @Input() title: string | undefined;
  @Input() message: string | undefined;
  constructor(public modalCtrl: ModalController, private rest: RestApiService, private ctx: AppCtxService) { }

  ngOnInit() {}

  submit() {

  }

}
