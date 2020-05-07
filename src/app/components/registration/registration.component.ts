import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FetchService } from 'src/app/services/fetch.service';
import { Plugins } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, ModalController } from '@ionic/angular';
import { PinComponent } from '../pin/pin.component';

const { Storage } = Plugins;

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {

  @Output() registrationEvent = new EventEmitter<string>();

  orgSites: number = 1;
  orgName: string = "";
  orgEmail: string = "";
  orgContact: string = "";
  orgAddress: string = "";
  orgPostCode: string = "";
  orgDescription: string = "";
  orgMobile: string = "";

  coupon: string = "";

  currentReg: any;
  siteAddress: any;
  orgID: any;
  siteID: any;
  pin: any;
  payment: number = 115;

  existingAccount: boolean;

  serverResp = {
    result: "",
    msg: "",
    pin: "",
    orgid: "",
    siteid: ""
  };

  constructor(private fetch: FetchService,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController) { 

      this.getStoredValues();
    }

  ngOnInit() { }

  async getStoredValues() {
    const resp = await  Storage.get({key:'prego'});
    this.serverResp = JSON.parse(resp.value);
    console.log('stored::',this.serverResp);

    this.orgID = this.serverResp.orgid;
    this.siteID = this.serverResp.siteid;
    if (this.orgID == "") { 
      this.registrationEvent.emit('reset');
    } else {
      this.registrationEvent.emit(JSON.stringify(this.serverResp));
    }
 
    // if (this.orgID != "" && this.siteID != "") {
    //   this.registrationEvent.emit(JSON.stringify(this.serverResp));
    // } else {
    // //  this.showMessage('');
    // }

  }

  calcPayAmount(ev) {
    let calcPay = 0;
    //  console.log(ev);
    let sites = ev.detail.value;
    if (sites== 0 || sites == '') {
      calcPay = 0;
    }  else if (sites == 1) {
      calcPay = 100;
    } else if (sites == 2) {
      calcPay = 150;
    } else if (sites > 2 && sites <= 10) {
      calcPay = 150 + ((sites - 2) * 25);
    } else if (sites > 10 && sites <= 50) {
      calcPay = 350 + ((sites - 10) * 20);
    } else {
      calcPay = 1150 + ((sites - 50) * 15);
    }
    this.payment = calcPay * 1.15;

    // console.log(this.orgSites,calcPay + ' ' + sites + '  incl:'+this.payment);
  }
  doLogin() {
    this.existingAccount = !this.existingAccount;
  }
  async login() {
    let postData = {
      orgid: this.orgID,
      location: this.siteAddress
    }
    let url = this.fetch.getBaseURL();
    this.http.post(url + 'pregologin.jsn', JSON.stringify(postData))
      .subscribe(resp => {
        this.serverResp = JSON.parse(JSON.stringify(resp));
        if (this.serverResp.result == 'success') {
          // turn on the Pin Acceptance
          this.pin = this.serverResp.pin;
          // we need to store the data
          this.showMessage(this.serverResp.msg);
          Storage.set({key:'prego', value: JSON.stringify(this.serverResp)});
          this.getPin(this.pin);

        } else {
          console.error(this.serverResp.msg);
          this.showMessage(this.serverResp.result + ' ' + this.serverResp.msg);
        }
      });
  }
  async getPin(pPin: string) {
    const theModal = await this.modalCtrl.create({
      component: PinComponent,
      componentProps: {
        pin: pPin
      }
    });
    await theModal.present();
    //const theData = 
    await theModal.onDidDismiss().then((resp) => {
      if (resp) {
        console.log(resp);
        this.registrationEvent.emit('1');
      }
    });
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



  async register() {

    if ( this.orgName == 'waikanae' && this.orgSites == 0) {
      this.reset();
      this.showMessage('RESET');
      return;
    }

    let postData = {
      name: this.orgName,
      desc: this.orgDescription,
      email: this.orgEmail,
      address: this.orgAddress,
      postcode: this.orgPostCode,
      contact: this.orgContact,
      mobile: this.orgMobile,
      sites: this.orgSites,
      coupon: this.coupon
    }
    let url = this.fetch.getBaseURL();
    this.http.post(url + 'pregoregister.jsn', JSON.stringify(postData))
      .subscribe(resp => {
        console.log(resp);
        this.serverResp = JSON.parse(JSON.stringify(resp));
        console.log('Msg', this.serverResp.msg);
        if (this.serverResp.result == 'success') {
          // save the 
          this.saveRegistration();
          let ret = {
            result: this.serverResp.result,
            amount: this.payment,
            orgid: this.serverResp.orgid,
            orgname: this.orgName
          }
          this.registrationEvent.emit(JSON.stringify(ret));
        } else {
            this.showMessage(this.serverResp.msg);
        }
      });

  }

  async saveRegistration() {
    await Storage.set({
      key: 'prego',
      value: JSON.stringify(this.serverResp.msg)
    });
  }

async reset() {
  await Storage.set({key:'prego',value: JSON.stringify({})});
  this.getStoredValues();
}

}
