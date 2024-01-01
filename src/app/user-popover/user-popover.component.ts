import { Component, OnInit } from '@angular/core';
import {IonicModule, ModalController, PopoverController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {ChangePasswordModalComponent} from "../change-password-modal/change-password-modal.component";
import {AppCtxService} from "../services/app-ctx.service";
import {Router} from "@angular/router";
import {RechargeComponent} from "../recharge/recharge.component";

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class UserPopoverComponent  implements OnInit {

  constructor(private ctx: AppCtxService, private popoverController: PopoverController, private modalCtrl: ModalController, private router: Router) {}

  selectOption(option: string) {
    // 处理选择菜单项的逻辑
    console.log('选中的选项:', option);
    this.popoverController.dismiss();
  }

  ngOnInit() {}

  async changePasswordModal() {
    await this.popoverController.dismiss();
    const modal = await this.modalCtrl.create({
      component: ChangePasswordModalComponent,
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm') {
      }
    });

    return modal.present();
  }

  async rechargeModal() {
    await this.popoverController.dismiss();
    const modal = await this.modalCtrl.create({
      component: RechargeComponent,
    });

    modal.onWillDismiss().then((result) => {
      if (result.role === 'confirm') { }
    });

    return  modal.present();
  }

  logout() {
    this.ctx.logout();
    this.popoverController.dismiss();
    this.router.navigate(['/login']);
  }

}
