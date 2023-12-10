import {Component, Input, OnInit} from '@angular/core';
import {AppCtxService} from "../services/app-ctx.service";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HeaderComponent  implements OnInit {

  @Input()  title: string = '';
  constructor(public ctx: AppCtxService) { }

  ngOnInit() {}

}
