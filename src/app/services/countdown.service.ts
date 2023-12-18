import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  delayWhen,
  filter,
  interval,
  map,
  mapTo,
  Observable,
  scan,
  Subject,
  takeUntil,
  tap
} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CountdownService {
  private readonly countdownStarted$ = new Subject<void>();
  private readonly countdownStopped$ = new Subject<void>();
  private readonly countdownResumed$ = new Subject<void>();
  private readonly countdownPaused$ = new BehaviorSubject<boolean>(false);
  private readonly countdownDelayed$ = new BehaviorSubject<number>(0);
  private readonly currentTime$ = interval(1000).pipe(
    filter(() => !this.countdownPaused$.value),
    tap((v)=>{console.log(v)}),
    delayWhen(() => this.countdownPaused$.pipe(filter((paused) => !paused)).pipe(map(() => this.countdownDelayed$.value))),
    scan((acc, curr) => acc - 1, this.countdownDelayed$.value),
    takeUntil(this.countdownStopped$)
  );

  constructor() { }

  get currentTime(): number {
    const remainingTime = Math.max(this.countdownDelayed$.value - this._getCurrentTime(), 0);
    return this.countdownDelayed$.value > 0 ? remainingTime : -remainingTime;
  }

  get paused() {
    return this.countdownPaused$.value;
  }

  start(countdownTime: number): void {
    this.countdownDelayed$.next(countdownTime);
    this.countdownStarted$.next();
  }

  stop(): void {
    this.countdownStopped$.next();
  }

  pause(): void {
    if (!this.countdownPaused$.value) {
      this.countdownPaused$.next(true);
    }
  }

  resume(): void {
    if (this.countdownPaused$.value) {
      this.countdownResumed$.next();
      this.countdownPaused$.next(false);
    }
  }

  delay(delayTime: number): void {
    const remainingTime = Math.max(this.currentTime, 0);
    this.countdownDelayed$.next(remainingTime + delayTime);
  }

  get countdownStarted(): Observable<void> {
    return this.countdownStarted$.asObservable();
  }

  get countdownStopped(): Observable<void> {
    return this.countdownStopped$.asObservable();
  }

  get countdownResumed(): Observable<void> {
    return this.countdownResumed$.asObservable();
  }

  get countdownPaused(): Observable<boolean> {
    return this.countdownPaused$.asObservable();
  }

  get countdownDelayed(): Observable<number> {
    return this.countdownDelayed$.asObservable();
  }

  get countdownCompleted(): Observable<void> {
    return this.currentTime$.pipe(
      filter((time) => time <= 0),
      mapTo(undefined)
    );
  }

  private _getCurrentTime(): number {
    let currentTime: number = 0;
    this.currentTime$.subscribe((value) => {
      currentTime = value;
    });
    return currentTime;
  }

}
