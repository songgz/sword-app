import { Component, EnvironmentInjector, inject } from '@angular/core';
import {IonicModule, IonTabs} from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {}

  onTabChange(event: any): void {
    const selectedTab = event;
    console.log('激活的 Tab 标签是：', selectedTab);
  }
}
