import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {WordReadComponent} from "../word-read/word-read.component";

import {TimerService} from "../services/timer-service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, ExploreContainerComponent, WordReadComponent],
})
export class Tab1Page {
  count = 0;
  timerSubscription: Subscription | undefined;

  constructor(public timerService: TimerService) {

  }

  start() {
    this.timerSubscription = this.timerService.startTimer(1000).subscribe(timerCount => {
      this.count = timerCount;
      console.log('Timer count:', timerCount);
    });
  }

  pause() {
    this.timerService.pauseTimer();
  }

  resume() {
    this.timerService.resumeTimer();
  }

  cancel() {
    this.timerSubscription?.unsubscribe();
    this.timerService.cancelTimer();
  }

  delay() {
    //this.timerService.delayTimer(2000);
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

}
