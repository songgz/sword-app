import {Observable, Subscription} from "rxjs";

export class Timer1 {
  private timer$: Observable<number>;
  private subscription: Subscription | undefined;
  private delay: number;
  private callback: Function;

  constructor(delay: number, callback: Function) {
    this.delay = delay;
    this.callback = callback;
    this.timer$ = new Observable<number>((observer) => {
      let count = 0;
      const intervalId = setInterval(() => {
        observer.next(count++);
      }, delay);
      return () => clearInterval(intervalId);
    });
  }

  start() {
    if (!this.subscription) {
      this.subscription = this.timer$.subscribe((count) =>
        this.callback(count)
      );
    }
  }

  pause() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  resume() {
    if (!this.subscription) {
      this.subscription = this.timer$.subscribe((count) =>
        this.callback(count)
      );
    }
  }

  cancel() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  delayTimer() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
      setTimeout(() => this.start(), this.delay);
    }
  }
}
