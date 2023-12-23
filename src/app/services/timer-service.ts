import {Injectable} from "@angular/core";
import {interval, Observable, Subject, Subscription, take, takeUntil} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timer$ = new Subject<number>();
  private destroy$ = new Subject<any>();
  timerSubscription: Subscription | undefined;
  // private isTimerActive = false;
  private isTimerPaused = false;
  private timerCount = 0;
  isTimerRunning = false;
  private timeOut: number | undefined;

  startTimer(intervalMs: number): Observable<number> {
    // if(!this.isTimerActive) {
    //   this.timerCount = 0;
    // }
    this.isTimerRunning = true;
    this.isTimerPaused = false;
    this.timerSubscription = interval(intervalMs).pipe(
      takeUntil(this.destroy$)
      //take(10)
    ).subscribe(() => {
      console.log(this);
      if (this.isTimerRunning && !this.isTimerPaused) {
        this.timerCount++;
        this.timer$.next(this.timerCount);
      }
    });
    // this.isTimerActive = true;
    // this.isTimerPaused = false;
    return this.timer$.asObservable();
  }

  pauseTimer(): void {
    this.isTimerPaused = true;
  }

  resumeTimer(): void {
    this.isTimerPaused = false;
  }

  cancelTimer(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.timerSubscription?.unsubscribe();
    //this.isTimerActive = false;
    this.isTimerRunning = false;
    this.timerCount = 0;
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
  }

  delayTimer(delayMs: number, callback: Function): void {
    if (this.isTimerRunning) {
      //this.timerSubscription?.unsubscribe();
      this.isTimerRunning = false;
      this.timeOut = setTimeout(() => {
        this.isTimerRunning = true;
        callback();
      }, delayMs);
    }
  }
  // delayTimer(delayMs: number, callback: Function): void {
  //   if (this.isTimerActive && !this.isTimerPaused) {
  //     this.timerSubscription?.unsubscribe();
  //     setTimeout(() => {
  //       if (!this.isTimerPaused) {
  //         this.startTimer(1000);
  //         callback();
  //       }
  //     }, delayMs);
  //   }
  // }
}
