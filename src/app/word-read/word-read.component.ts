import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {WordTrackerService} from "../services/word-tracker.service";
import {AppCtxService} from "../services/app-ctx.service";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {MemoryState} from "../models";
import {Hotkey, HotkeyModule, HotkeysService} from "angular2-hotkeys";
import {concatMap, from} from "rxjs";
import {MinAudioService} from "../services/min-audio.service";
import {AudioService} from "../services/audio.service";


@Component({
  selector: 'app-word-read',
  templateUrl: './word-read.component.html',
  styleUrls: ['./word-read.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HotkeyModule]
})
export class WordReadComponent  implements OnInit {
  @Output() learnOverEvent: EventEmitter<any> = new EventEmitter();
  protected readonly State = MemoryState;
  currentState: MemoryState = MemoryState.Initial;
  private answer: boolean = false;
  options: string[] = ['A','B','C','D'];

  constructor(public tracker: WordTrackerService, public ctx: AppCtxService, private hotkeys: HotkeysService) {
    this.setuphotkeys();
  }

  ngOnInit() {
    this.performAction('initial');
  }

  setuphotkeys() {
    this.hotkeys.add(new Hotkey('z', (event: KeyboardEvent): boolean => {
      switch (this.currentState) {
        case this.State.Survey:
          this.performAction('survey',true);
          break;
        case this.State.Evaluate:
          this.performAction('evaluate',true);
          break;
        default:
          console.log('Invalid action');
          break;
      }

      console.log('zz pressed');
      return false;
    }));
    this.hotkeys.add(new Hotkey('x', (event: KeyboardEvent): boolean => {
      switch (this.currentState) {
        case this.State.Survey:
          this.performAction('survey',false);
          break;
        case this.State.Evaluate:
          this.performAction('evaluate',false);
          break;
        case this.State.Repeater:
          this.performAction('repeater');
          break;
        case this.State.Next:
          this.performAction('next');
          break;
        default:
          console.log('Invalid action');
          break;
      }

      return false;
    }));

    this.hotkeys.add(new Hotkey('1', (event: KeyboardEvent): boolean => {
      switch (this.currentState) {
        case this.State.Survey:
          this.performAction('survey',true);
          break;
        case this.State.Evaluate:
          this.performAction('evaluate',true);
          break;
        default:
          console.log('Invalid action');
          break;
      }

      console.log('zz pressed');
      return false;
    }));
    this.hotkeys.add(new Hotkey('2', (event: KeyboardEvent): boolean => {
      switch (this.currentState) {
        case this.State.Survey:
          this.performAction('survey',false);
          break;
        case this.State.Evaluate:
          this.performAction('evaluate',false);
          break;
        case this.State.Repeater:
          this.performAction('repeater');
          break;
        case this.State.Next:
          this.performAction('next');
          break;
        default:
          console.log('Invalid action');
          break;
      }

      return false;
    }));
  }

  performAction(action: string, option?: boolean) {
    switch (action) {
      case 'initial':
        this.currentState = this.State.Survey;
        this.tracker.getWord();
        this.tracker.playWord();
        if (this.tracker.testable()) {
          this.tracker.getWordOptions(4);
        }
        break;
      case 'survey':
        //const audioUrls = ['http://' + window.location.host + '/assets/audio/a.mp3', 'http://114.55.39.31:8790/quick/v/m/morning.mp3'];
        if (option) {
          this.tracker.play('http://' + window.location.host + '/assets/audio/a.mp3');
          this.tracker.playWord();
          this.currentState = this.State.Evaluate;
        } else {
          this.tracker.play('http://' + window.location.host + '/assets/audio/e.mp3')
          this.tracker.playWord();
          this.answer = false;
          this.currentState = this.State.Repeater;
        }
        break;
      case 'evaluate':
        if (option) {
          this.tracker.play('http://' + window.location.host + '/assets/audio/e2.mp3')
          this.answer = true;
          this.performAction('next');
        } else {
          this.tracker.play('http://' + window.location.host + '/assets/audio/e.mp3')
          this.answer = false;
          this.currentState = this.State.Repeater;
        }
        break;
      case 'repeater':
        this.tracker.playWord();
        this.currentState = this.State.Next;
        break;
      case 'next':
        this.tracker.play('http://' + window.location.host + '/assets/audio/n.mp3')
        this.tracker.updateWordState(this.answer);
        this.tracker.saveWordState();

        if (this.tracker.isOver()) {
          this.learnOverEvent.emit();
        } else {
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
