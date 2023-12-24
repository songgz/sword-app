import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {WordTrackerService} from "../services/word-tracker.service";
import {AppCtxService} from "../services/app-ctx.service";
import {MemoryState} from "../models";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {Components} from "@ionic/core";
import IonInput = Components.IonInput;

@Component({
    selector: 'app-word-spell',
    templateUrl: './word-spell.component.html',
    styleUrls: ['./word-spell.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class WordSpellComponent implements OnInit {
    @Output() learnOverEvent: EventEmitter<any> = new EventEmitter();
    protected readonly State = MemoryState;
    currentState: MemoryState = MemoryState.Initial;
    private answer: boolean = false;
    mySpell: any = {
        word: [],
        option1: [],
        option2: [],
        answer: [],
        answerResult: [],
        revise: [],
        reviseResult: []
    };
    wordForm!: UntypedFormGroup;

    constructor(public tracker: WordTrackerService, public ctx: AppCtxService, private formBuilder: UntypedFormBuilder) {

    }

    ngOnInit() {
      this.wordForm = this.formBuilder.group({
        wordInput: ['', []]
      });
      this.performAction('initial');
    }

    performAction(action: string, option?: boolean) {
        switch (action) {
            case 'initial':
                this.wordForm.controls['wordInput'].setValue('');
                this.currentState = this.State.Survey;
                this.tracker.getWord();
                this.tracker.playWord();
                this.initSpell(this.tracker.word.word);
                break;
            case 'survey': //拼写
                if (this.isSpellOver()) {
                    if (this.check('answer')) {
                        this.answer = true;
                        this.currentState = this.State.Next;
                        if (option) {
                            this.performAction('next');
                        }
                    }else {
                        this.answer = false;
                        this.currentState = this.State.Evaluate;
                        this.check('revise');
                        if(option) {
                          //this.wordForm.controls['wordInput'].setValue('');
                          this.delayedInteraction();
                        }
                    }

                }
                break;
            case 'evaluate': //改错
              if (this.isSpellOver()) {
                if (this.check('answer')) {
                  this.currentState = this.State.Next;
                }
                if(this.check('revise')) {
                  this.currentState = this.State.Next;
                  if (option) {
                    this.performAction('next');
                  }
                }
              }
              break;
            case 'next':
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

    initSpell(word: string) {
        this.mySpell = {
            word: [],
            option1: [],
            option2: [],
            answer: [],
            answerResult: [],
            revise: [],
            reviseResult: []
        };
        this.mySpell.word = word.split('');
        this.randSpellOption();
    }

    randSpellOption() {
        let letters = this.getRandomLetters(this.mySpell.word);
        let num = 0;
        for (let i = 0; i < this.mySpell.word.length; i++) {
            num = Math.floor(Math.random() * 99);
            if (num % 2 === 0) {
                this.mySpell.option1.push(this.mySpell.word[i]);
                this.mySpell.option2.push(letters[i]);
            } else {
                this.mySpell.option1.push(letters[i]);
                this.mySpell.option2.push(this.mySpell.word[i]);
            }
        }
    }

    spellOptionReply(option: string, col: number) {
        if (col === this.mySpell.answer.length) {
            this.mySpell.answer.push(this.mySpell[option][col]);
        } else if (col < this.mySpell.answer.length) {
            this.mySpell.answer[col] = this.mySpell[option][col];
        }

        if(this.currentState === this.State.Survey) {
          this.performAction('survey');

        }
        if (this.currentState === this.State.Evaluate) {
          this.check('answer');
          this.performAction('evaluate');
        }

    }

    isSpellOver() {
        return this.mySpell.answer.length === this.mySpell.word.length;
    }

    check(typ: string): boolean {
        for (let i = 0; i < this.mySpell.word.length; i++) {
            if (this.mySpell[typ][i] === this.mySpell.word[i]) {
                this.mySpell[typ + 'Result'][i] = 1;
            } else {
                this.mySpell[typ + 'Result'][i] = 0;
            }
        }
        return this.mySpell[typ + 'Result'].reduce((sum: number, n: number) => sum + n, 0) === this.mySpell.word.length;
    }

    isErrorLetter(typ: string, col: number): boolean {
        return this.mySpell[typ + 'Result'][col] === 1;
    }

    getCellColor(option: string, col: number) {
        if (this.currentState === this.State.Survey) {
            return this.mySpell.answer[col] === this.mySpell[option][col] ? 'hui-col' : '';
        }

        if (this.currentState === this.State.Evaluate) {
            if (this.mySpell.reviseResult[col] === 0 && this.mySpell.answerResult[col] === 0) {
                return this.mySpell.word[col] === this.mySpell[option][col] ? 'err-col' : '';

            }
        }
        return '';


    }

    getLetterColor(col: number) {
        if (this.mySpell.reviseResult[col] === 1 && this.mySpell.answerResult[col] === 0) {
            return 'err0';
        } else if (this.mySpell.answerResult[col] === 0) {
            return 'err2';
        }
        return 'err6';
    }


    getRandomLetters(str: string): string {
        const letters: string = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        let c: string = '';
        for (let i = 0; i < str.length; i++) {
            const randomIndex = Math.floor(Math.random() * letters.length);
            c = letters.charAt(randomIndex);
            if (c === str[i]) {
                c = letters.charAt(randomIndex - 3) || letters.charAt(randomIndex + 3);
            }
            if (str[i] === ' ') {
                c = ' ';
            }
            result += c;
        }
        return result;
    }

    onInputFocus() {
        //this.wordInput = '';
    }

    onInputChange(event: CustomEvent) {
      if (this.wordForm.controls['wordInput']) {
        this.wordForm.controls['wordInput'].markAllAsTouched();
      }
    }

    onEnterPressed() {
        if (this.currentState === this.State.Survey) {
            this.mySpell.answer = this.wordForm.get('wordInput')?.value.split('');
            this.performAction('survey', true);
        }
        if (this.currentState === this.State.Evaluate) {
            this.mySpell.revise = this.wordForm.get('wordInput')?.value.split('');
            this.performAction('evaluate', true);
        }
    }

    delayedInteraction() {
        setTimeout(() => {
          this.wordForm.controls['wordInput'].setValue('');
        }, 2000); // 2秒延迟
    }


}
