import { Component, OnInit } from '@angular/core';
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChangePasswordModalComponent  implements OnInit {
  passwordForm: any = {user_id: '', old_password: '', new_password: '', confirm_password: ''};

  constructor(public modalCtrl: ModalController, private rest: RestApiService, private ctx: AppCtxService) {
    this.passwordForm.user_id = this.ctx.getUser().id;
  }

  ngOnInit() {}

  changePassword() {
    this.rest.post('auths/change_password', this.passwordForm).subscribe({
      next: res => {
         this.modalCtrl.dismiss(null, 'cancel');

      },
      error: res => {
        this.modalCtrl.dismiss(null, 'cancel');

      }
    });

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

}
