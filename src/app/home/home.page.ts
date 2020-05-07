import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { ToastController, ModalController } from '@ionic/angular';

import { VisitorLogComponent } from '../components/visitor-log/visitor-log.component';
const { Storage } = Plugins;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  showHide: boolean;
  readyToPay: boolean;
  payCalculated: string;

  orgName: any = "Your Org Name Here";
  orgID: string;
  siteID : string;

  prego = {
    result: "",
    msg: "",
    pin: "",
    orgid: "",
    siteid: "",
    orgname: ""
  };

  constructor(private toastCtrl:ToastController,
              private modalCtrl:ModalController) {
    this.getStoredValues();
  }

  ngOnInit() {
  }

  toggle() {
    this.showHide = !this.showHide;
  }
  async retrieveVisitLog() {
    // open modal that asks for from/to dates
    // then requests email of visits
    const theModal = await this.modalCtrl.create({
      component: VisitorLogComponent,
      componentProps: {
        orgid: this.prego.orgid,
        orgname: this.prego.orgname
      }
    });
    await theModal.present();
    //const theData = 
    await theModal.onDidDismiss().then((resp) => {
      const range = JSON.parse(JSON.stringify(resp)).data;
      console.log('DateRange',range);
      if (range != undefined) {
        console.log(range);
  
      }
    });
  }
  isReset() {
    this.getStoredValues();
    this.readyToPay = false;
    this.showHide = false;
    console.log('Reset', this.showHide + ' ' + this.readyToPay);
  }

  payMessage(event) {
    console.log(event);
    if (event == 'success') {

      this.readyToPay = false;
      this.showHide = false;
      this.showMessage('Now login sites');
    } else if (event == '2') {
      // they canceled the paypal component - came back

      this.readyToPay = false;
      this.showHide = false;
      this.showMessage('Try Again');
    }
  }

  async getStoredValues() {
    const resp = await Storage.get({ key: 'prego' });
    this.prego = JSON.parse(resp.value);
    console.log('stored::', this.prego);

    if (this.prego.orgid === "" && this.prego.siteid === "") {
      // we should straight to Visit Capture
      this.orgName = this.prego.orgname;
      this.showHide = false;
    }

  }

  registrationMessage(event) {
    let resp = JSON.parse(event);
    console.log(resp);
    if (event == '0') {
      // all paid or they signing onto existing registration
      this.payMessage('success');
    } else if (event == '1') {
      this.showHide = true; // false = show the registration component
      this.readyToPay = false; // false = don't show the PayPal component
    } else if (event =='reset') {
      this.showHide = false; // false = show the registration component
      this.readyToPay = false; // false = don't show the PayPal component
    } else {
      // the have to pay
      console.log('readyToPay.....')
      console.log(resp);
      this.payCalculated = resp.amount;
      this.orgID = resp.orgid;
      this.siteID = resp.siteid;
      this.orgName = resp.orgname;
      //let's ensure values are set
      this.showHide = false; // false = show the registration component
      this.readyToPay = false; // false = don't show the PayPal component
      console.log('starting with:: showHide ' + this.showHide + ' readyToPay ' + this.readyToPay);
      if (this.siteID != undefined) {
        this.showHide = true;
      } else if( this.orgID != undefined ) {
        // If we must have an Organisation registered now
        this.readyToPay = true;
      }
      console.log('ending with:: showHide ' + this.showHide + ' readyToPay ' + this.readyToPay);
    }
  }

  async showMessage(msg) {
    const theToast = await this.toastCtrl.create({
      message: msg,
      position: "middle",
      cssClass: "thankyou",
      buttons: [
        {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    theToast.present();
  }

}

// if (resp.siteID === '' && resp.orgid === "") {
//   this.showHide = false;
// } else if (resp.orgid != "") {
//   this.showHide = true;
// } else {
//   this.readyToPay = true;
// }
