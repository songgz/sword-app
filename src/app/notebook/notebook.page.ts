import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {AppCtxService} from "../services/app-ctx.service";
import {RestApiService} from "../services/rest-api.service";
import {Router} from "@angular/router";
import {HeaderComponent} from "../header/header.component";

@Component({
  selector: 'app-notebook',
  templateUrl: './notebook.page.html',
  styleUrls: ['./notebook.page.scss'],
  standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class NotebookPage implements OnInit {
  notebooks: any[] = [];

  constructor(public ctx: AppCtxService, private rest: RestApiService, private router: Router) { }

  ngOnInit() {

  }

  ionViewDidEnter(): void {
    this.loadLearnedBook(this.ctx.getUserId());
  }

  loadLearnedBook(studentId: string) {
    this.rest.index('statistics/notebook', {student_id: studentId}).subscribe(res => {
      this.notebooks = res.data;
    });
  }

  getWordImg(file: string) :string {
    return this.rest.getAssetUrl() + file;
  }

  openNote(bookId: string, learnType: string) {
    this.router.navigate(['/vocabulary'],{queryParams: {studentId: this.ctx.getUserId(), bookId: bookId, learnType: learnType}});

  }
}
