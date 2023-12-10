import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule } from '@angular/forms';
import {IonicModule, ModalController} from '@ionic/angular';
import {ChangePasswordModalComponent} from "../change-password-modal/change-password-modal.component";
import {RechargeComponent} from "../recharge/recharge.component";
import {HeaderComponent} from "../header/header.component";
import {AppCtxService} from "../services/app-ctx.service";


@Component({
  selector: 'app-student',
  templateUrl: './student.page.html',
  styleUrls: ['./student.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class StudentPage implements OnInit {



  constructor(private modalCtrl: ModalController, public ctx: AppCtxService) {

  }

  ngOnInit() {


  }

  async changePasswordModal() {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      //this.message = `Hello, ${data}!`;
    }
  }

  async rechargeModal() {
    const modal = await this.modalCtrl.create({
      component: RechargeComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      //this.message = `Hello, ${data}!`;
    }
  }



}
