import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {WordReadComponent} from "../word-read/word-read.component";
import {delayWhen, exhaustMap, filter, interval, mapTo, scan, Subject, Subscription, switchMap, tap} from "rxjs";
import {CountdownService} from "../services/countdown.service";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, ExploreContainerComponent, WordReadComponent],
})
export class Tab1Page {
  countdownTime = 0;
  paused = false;
  private countdownSubscription: Subscription | undefined;

  constructor(private readonly countdownService: CountdownService) {}


  start(): void {
    this.countdownService.start(10);
    this.countdownSubscription = this.countdownService.countdownDelayed.subscribe((delayed) => {
      this.countdownTime = delayed;
    });
  }

  pause(): void {
    this.countdownService.pause();
  }

  resume(): void {
    this.countdownService.resume();
  }

  stop(): void {
    this.countdownService.stop();
    this.countdownSubscription?.unsubscribe();
    this.countdownTime = 0;
  }

  delay(): void {
    this.countdownService.delay(5);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
