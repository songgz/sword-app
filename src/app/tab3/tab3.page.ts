import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule} from '@angular/common';
import { RestApiService } from '../services/rest-api.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class Tab3Page {
  items: any[] = [
    {title:'sfafdfa', imageUrl:'http://114.55.39.31:8790/quick/cimg/1439899912291876866.jpg'},
    {title:'sfafdfa', imageUrl:'http://114.55.39.31:8790/quick/cimg/1439899912291876866.jpg'},
    {title:'sfafdfa', imageUrl:'http://114.55.39.31:8790/quick/cimg/1439899912291876866.jpg'},
    {title:'sfafdfa', imageUrl:'http://114.55.39.31:8790/quick/cimg/1439899912291876866.jpg'},
    {title:'sfafdfa', imageUrl:'http://114.55.39.31:8790/quick/cimg/1439899912291876866.jpg'},
    {title:'sfafdfa', imageUrl:'http://114.55.39.31:8790/quick/cimg/1439899912291876866.jpg'}
  ];
  books: any[] = [];
  bookUrl = "";

  constructor(private rest: RestApiService) {
    this.bookUrl = this.rest.getAssetUrl();
    this.rest.index('books').subscribe(res => {
      this.books = res.data || [];
    });
  }

  activeTab: number = 0;

  changeTab(tabIndex: number) {
    console.log(tabIndex);
    this.activeTab = tabIndex;
  }

  showOptions(v: any) {

  }

  deletePhoto(v: any) {

  }

  openMenu(v:any) {}
}


