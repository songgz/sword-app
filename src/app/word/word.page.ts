import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {RestApiService} from "../services/rest-api.service";
import {AudioService} from "../services/audio.service";
import {WordTrackerService} from "../services/word-tracker.service";

@Component({
    selector: 'app-word',
    templateUrl: './word.page.html',
    styleUrls: ['./word.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class WordPage implements OnInit {
    units: any[] = [];
    unit: any = {};
    words: any[] = [];
    word: any = {};
    learnedUnits: any[] = [];
    errorWords: any[] = [];

    state: any = 'survey';
    tracker: any = {};
    options: any[] = [];

    constructor(private activatedRouter: ActivatedRoute, private router: Router, private rest: RestApiService, private sanitizer: DomSanitizer, private audio: AudioService, private alertController: AlertController) {
        this.tracker = new WordTrackerService();
    }

    ngOnInit() {
        this.activatedRouter.queryParams.subscribe((params) => {
            this.loadUnits(params['bookId']);
            this.loadLearnedBook(params['bookId']);
        });
    }

    ionViewDidEnter() {
        this.presentAlert();
    }





    loadUnits(bookId: string) {
        this.rest.index('units', {book_id: bookId}).subscribe(res => {
            this.units = res.data;
            this.unit = this.units[0];
            this.loadWords(this.unit.id);
            // this.loadErrorWords('653c68696eec2f1ea8aa1a2a', this.unit.id);
        });
    }

    loadLearnedBook(bookId: string) {
        this.rest.index('learned_books', {book_id: bookId}).subscribe(res => {
            this.errorWords = res.data.errorWords;
            this.learnedUnits = res.data.learnedUnits;
        });
    }

    loadWords(unitId: string) {
        this.rest.index('words', {unit_id: unitId}).subscribe(res => {
            this.words = res.data;
            this.tracker.loadWords(this.words);
            this.word = this.tracker.word;
        });
    }

    loadErrorWords(studentId: string, unitId: string) {
        this.rest.index('learned_units', {student_id: studentId, unit_id: unitId}).subscribe(res => {
            this.errorWords = res.data[0]?.error_words;
        });
    }

    openUnit(unitId: string) {
        this.unit = this.units.find(u => u.id === unitId);
        this.loadWords(this.unit.id);
        //this.loadErrorWords('653c68696eec2f1ea8aa1a2a', this.unit.id);
        this.presentAlert();
    }

    playWord() {
        this.audio.playStream(this.getWordAudio(this.tracker.word.pronunciation)).subscribe();
    }

    survey(value: boolean) {
        this.playWord();


        if (value) {
            this.state = 'evaluate';
        } else {
            this.state = 'repeater';
        }
    }


    evaluate(value: boolean) {
        if (value) {
            this.next();
            this.state = 'survey';
        } else {
            this.state = 'repeater';
        }
    }

    repeater() {
        this.playWord();
        this.state = 'next';
    }

    next() {
        console.log(this.state);
        console.log("ee" + this.tracker.getErrLevel());
        if (this.state === 'next') {
            this.tracker.reoccur(true);
        } else if (this.tracker.getErrLevel() !== 6) {
            this.tracker.reoccur(false);
        }

        this.tracker.next();
        this.word = this.tracker.word;
        if (this.tracker.getErrLevel() === 5) {
            this.getRandomWords(4);
        }
        this.state = 'survey';
    }

    getWordImg(file: string): string {
        if (file) {
            return this.rest.getAssetUrl() + 'quick/img' + file;
        }
        return '';
    }

    getWordAudio(file: string): string {
        if (file) {
            return this.rest.getAssetUrl() + 'quick/v' + file;
        }
        return '';
    }

    getRandomWords(n: number): any[] {
        this.options = [];
        let m = this.tracker.getWordIdx();
        let randomIndex = -1;
        while(this.options.length < n) {
            randomIndex = Math.floor(Math.random() * this.words.length);
            if (m !== randomIndex) {
                this.options.push(this.words[randomIndex]);
            }
            if (this.options.length === n - 1) {
                this.options.splice(m % n, 0, this.word);
            }
        }
        return this.options;
    }

    replyOption(wordId: string) {
        if (wordId === this.word.id) {

        }
        this.next();
    }



    async presentAlert() {
        const alert = await this.alertController.create({
            header: '学习提示',
            message: '是否进行章节前测试？',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    handler: () => {
                        console.log('Alert canceled');
                    },
                },
                {
                    text: '确定',
                    role: 'confirm',
                    handler: () => {
                        this.router.navigate(['/tabs/quiz'], {queryParams: {unitId: this.unit.id}});
                    },
                }
            ]
        });

        await alert.present();
    }

    formatText(text: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(text.replace(/<br\/>/g, '<br/>'));
    }

    protected readonly JSON = JSON;
}
