import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RestApiService } from '../services/rest-api.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab2Page {
  units: any[] = [];
  words: any[] = [];
  word: any = {};

  constructor(private rest: RestApiService,private sanitizer: DomSanitizer) {
    this.rest.index('units', {book_id: '651096176eec2f38fc25d93f'}).subscribe(res => {
      this.units = res.data;
      this.loadWords(this.units[0].id)
    });

    //this.loadWords('651096176eec2f38fc25d940');
    

  }

  formatText(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/<br\/>/g, '<br/>'));
  }

  getWordImg(file: string): string {
    return this.rest.getAssetUrl() + 'quick/img' + file;
  }

  loadWords(unitId: string) {
    this.rest.index('words', {unit_id: unitId}).subscribe(res => {
      this.words = res.data;
      this.word = this.words[0];
    });

  }

  openUnit(unitId: string) {
    this.loadWords(unitId);
  }

}
