import {Component, Input, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-over-modal',
  templateUrl: './over-modal.component.html',
  styleUrls: ['./over-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule]
})
export class OverModalComponent  implements OnInit {
  @Input() total: number | undefined;
  @Input() rights: number | undefined;
  @Input() wrongs: number | undefined;
  @Input() score: number | undefined;
  @Input() customStyles: any;

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  submit() {
    this.modalCtrl.dismiss(null, 'confirm');

  }

}
