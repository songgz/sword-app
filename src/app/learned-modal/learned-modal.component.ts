import {Component, Input, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-learned-modal',
  templateUrl: './learned-modal.component.html',
  styleUrls: ['./learned-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class LearnedModalComponent  implements OnInit {
  @Input() title: string | undefined;
  @Input() message: string | undefined;
  @Input() customStyles: any;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(null, 'confirm');
  }

}
