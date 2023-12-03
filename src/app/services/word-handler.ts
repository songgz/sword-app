import {WordTracker} from "./WordTracker";

export abstract class WordHandler {
  public next: WordHandler | undefined;
  protected constructor(next?: WordHandler) {
    this.next = next;
  }
  handler(tracker: WordTracker): void {}
}

export class StartHandler extends WordHandler {
  constructor(next?: WordHandler) {
    super(next);
  }

  override handler(tracker: WordTracker) {

  }
}

export class SurveyHandler extends WordHandler {
  constructor(next?: WordHandler) {
    super(next);
  }

  override handler(tracker: WordTracker) {

  }
}

export class EvaluateHandler extends WordHandler {
  constructor(next?: WordHandler) {
    super(next);
  }

  override handler(tracker: WordTracker) {

  }
}

export class RepeaterHandler extends WordHandler {
  constructor(next?: WordHandler) {
    super(next);
  }

  override handler(tracker: WordTracker) {

  }
}

