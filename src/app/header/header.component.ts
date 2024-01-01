import {Component, Input, OnInit} from '@angular/core';
import {AppCtxService} from "../services/app-ctx.service";
import {IonicModule, PopoverController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {UserPopoverComponent} from "../user-popover/user-popover.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HeaderComponent  implements OnInit {

  @Input()  title: string = '';
  constructor(public ctx: AppCtxService,private popoverController: PopoverController) { }

  ngOnInit() {}

  async openPopover(event: Event) {
    const popover = await this.popoverController.create({
      component: UserPopoverComponent,
      event: event,
      translucent: true,
    });

    return await popover.present();
  }

}
