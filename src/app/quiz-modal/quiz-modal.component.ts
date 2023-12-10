import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-quiz-modal',
  templateUrl: './quiz-modal.component.html',
  styleUrls: ['./quiz-modal.component.scss'],
})
export class QuizModalComponent  implements OnInit {
  @Input() message: string | undefined;

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

}
