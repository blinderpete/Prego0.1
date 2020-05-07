import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-pin',
  templateUrl: './pin.component.html',
  styleUrls: ['./pin.component.scss'],
})
export class PinComponent implements OnInit {
  enteredPin: any;  // the pin the user enters
  systemPin: any; // the pin we got from the system

  constructor(private modalCtrl: ModalController,
    private navParams: NavParams) {
    this.systemPin = this.navParams.get('pin');
    console.log(this.systemPin);
  }

  ngOnInit() { }

  isPinCorrect() {

    if (this.enteredPin == this.systemPin) {
      // all good so carry on
      this.modalCtrl.dismiss(null);

    } else {
      // not correct
      this.modalCtrl.dismiss('Pin does not match');
    }
  }
}
