import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {WordTrackerService} from "../services/word-tracker.service";
import {AppCtxService} from "../services/app-ctx.service";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {MemoryState} from "../models";

@Component({
  selector: 'app-word-listen',
  templateUrl: './word-listen.component.html',
  styleUrls: ['./word-listen.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class WordListenComponent  implements OnInit {
  @Output() learnOverEvent: EventEmitter<any> = new EventEmitter();
  protected readonly State = MemoryState;
  currentState: MemoryState = MemoryState.Initial;
  private answer: boolean = false;
  options: string[] = ['A','B','C','D'];

  constructor(public tracker: WordTrackerService, public ctx: AppCtxService) { }

  ngOnInit() {
    this.performAction('initial');
  }

  performAction(action: string, option?: boolean) {
    switch (action) {
      case 'initial':
        this.currentState = MemoryState.Survey;
        this.tracker.getWord();
        this.tracker.playWord();
        if (this.tracker.testable()) {
          this.tracker.getWordOptions(4);
        }
        break;
      case 'survey':
        this.tracker.playWord();
        if (option) {
          this.currentState = MemoryState.Evaluate;
        } else {
          this.answer = false;
          this.currentState = MemoryState.Repeater;
        }
        break;
      case 'evaluate':
        if (option) {
          this.answer = true;
          this.performAction('next');
        } else {
          this.answer = false;
          this.currentState = MemoryState.Repeater;
        }
        break;
      case 'repeater':
        this.tracker.playWord();
        this.currentState = MemoryState.Next;
        break;
      case 'next':
        this.tracker.updateWordState(this.answer);
        this.tracker.saveWordState();

        if (this.tracker.isOver()) {
          this.learnOverEvent.emit();
        }else{
          this.tracker.next();
          this.performAction('initial');
        }
        break;
      default:
        console.log('Invalid action');
        break;
    }
  }

  replyOption(wordId: string) {
    this.answer = (wordId === this.tracker.word.id);
    this.performAction('next');
  }

}
