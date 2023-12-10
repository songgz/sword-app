import { Component, OnInit } from '@angular/core';
import {IonicModule, ModalController, ToastController} from "@ionic/angular";
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['./recharge.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RechargeComponent  implements OnInit {
  rechargeForm: any = {student_id: '', card_password: ''};
  constructor(public modalCtrl: ModalController, private rest: RestApiService, private ctx: AppCtxService,  private toastController: ToastController) {
    this.rechargeForm.student_id = this.ctx.getUser().id;
  }

  ngOnInit() {}

  submit() {
    this.rest.post('students/recharge' , this.rechargeForm).subscribe({
      next: res => {
        this.ctx.userSubject.next(res.data);
        this.modalCtrl.dismiss(null, 'cancel');
      },
      error: err => {
        this.modalCtrl.dismiss(null, 'cancel');
        this.presentToast(err.error.error, "bottom").then();
      }
    });
  }


  async presentToast(msg: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: position,
      color: 'danger'
    });

    await toast.present();
  }
}


