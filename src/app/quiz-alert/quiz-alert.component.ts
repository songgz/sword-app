import {Component, Input, OnInit} from '@angular/core';
import {AlertController, AlertOptions, IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-quiz-alert',
  templateUrl: './quiz-alert.component.html',
  styleUrls: ['./quiz-alert.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class QuizAlertComponent implements AlertOptions {
  @Input() title: string | undefined;
  @Input() message: string | undefined;
  constructor(private alertController: AlertController) { }

  ngOnInit() {}

  async dismiss() {
    const alert = await this.alertController.getTop();
    if (alert) {
      await alert.dismiss();
    }
  }

}
