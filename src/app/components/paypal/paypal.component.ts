import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';
import { ToastController } from '@ionic/angular';
import { FetchService } from 'src/app/services/fetch.service';
import { HttpClient } from '@angular/common/http';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss'],
})
export class PaypalComponent implements OnInit {
  paypalEnvironmentProduction = "";
  paypalEnvironmentSandBox = "AYSTd0vSiltLpHTwWKqLQW6Me0GuLQChL7dFW0Gzpw5sofY9TO1JXJ4EDqsXcp8vyiVeAVcGDmwOoO5S";

  sandboxAccount = 'sb-0hr821477297@business.example.com';

  paymentAmount: string = '3.33';
  currency: string = 'NZD';
  currencyIcon: string = '$';

  @Input() payAmt: string = '';
  @Input() orgID: string = '';

  @Output() payEvent = new EventEmitter<string>();

  prego = {
    result: "",
    msg: "",
    pin: "",
    orgid: "",
    siteid: "",
    orgname: ""
  };

  constructor(private payPal: PayPal, private toastCtrl: ToastController,
    private fetch: FetchService,
    private http: HttpClient) { }


  ngOnInit() {
    console.log('OnInit::', this.payAmt);
    this.paymentAmount = this.payAmt;

    this.getStoredValues();
    console.log('Org ID: ',this.orgID);

  }
  ngAfterViewInit() {
  }

cancel () {
  this.payEvent.emit('2');
}

  async getStoredValues() {
    const resp = await Storage.get({ key: 'prego' });
    this.prego = JSON.parse(resp.value);
    console.log('PayPal::', this.prego);

    if (this.prego.orgid === "" && this.prego.siteid === "") {

    }

  }


  payWithPaypal() {
    if (this.orgID == "gallagher@kawau11" || this.orgID == "addingtonbrass") {
      // this is a developer pass...
    console.log('Developer:: ','We are skipping PayPal');
      let falseResp = {
            "client": {
              "environment": "sandbox",
              "product_name": "PayPal iOS SDK",
              "paypal_sdk_version": "2.16.0",
              "platform": "iOS"
            },
            "response_type": "payment",
            "response": {
              "id": "PAY-1AB23456CD789012EF34GHIJ",
              "state": "approved",
              "create_time": "2016-10-03T13:33:33Z",
              "intent": "sale"
            }
          };
      this.sendPayData(falseResp);
//      this.showSuccess(JSON.parse(JSON.stringify(falseResp)));   
      return;
    }


    console.log("Pay:: ", this.currency + this.paymentAmount);
    this.payPal.init({
      PayPalEnvironmentProduction: 'YOUR_PRODUCTION_CLIENT_ID',
      PayPalEnvironmentSandbox: 'AYSTd0vSiltLpHTwWKqLQW6Me0GuLQChL7dFW0Gzpw5sofY9TO1JXJ4EDqsXcp8vyiVeAVcGDmwOoO5S'
    }).then(() => {
      // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
      this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
        // Only needed if you get an "Internal Service Error" after PayPal login!
        //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
      })).then(() => {
        let payment = new PayPalPayment(this.paymentAmount, this.currency, 'Description', 'sale');
        this.payPal.renderSinglePaymentUI(payment).then((res) => {
          console.log(res);
          this.sendPayData(res);
        //  this.showSuccess(JSON.parse(JSON.stringify(res)));
          this.showSuccess('Paid successfully - Thankyou');
          // Successfully paid

          // Example sandbox response
          //
          // {
          //   "client": {
          //     "environment": "sandbox",
          //     "product_name": "PayPal iOS SDK",
          //     "paypal_sdk_version": "2.16.0",
          //     "platform": "iOS"
          //   },
          //   "response_type": "payment",
          //   "response": {
          //     "id": "PAY-1AB23456CD789012EF34GHIJ",
          //     "state": "approved",
          //     "create_time": "2016-10-03T13:33:33Z",
          //     "intent": "sale"
          //   }
          // }
        }, () => {
          // Error or render dialog closed without being successful
        });
      }, () => {
        // Error in configuration
      });
    }, () => {
      // Error in initialization, maybe PayPal isn't supported or something else
    });
  }


  async showSuccess(resp) {

    let toast = await this.toastCtrl.create({
      message: resp,
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
    toast.present();
  }

  sendPayData(payRes: any) {
    let postData = {
      orgid: this.orgID,
      paypal: payRes
    }
    let url = this.fetch.getBaseURL();
    this.http.post(url + 'pregopaypal.jsn', JSON.stringify(postData))
      .subscribe(resp => {
        let resJSON = JSON.parse(JSON.stringify(resp));
        if (resJSON.result == 'success') {
          // turn on the Pin Acceptance
          this.payEvent.emit('success');
          // we need to store the data


        } else {
          console.error(resJSON);
        }
      });
  }

  testPayPalHandling() {
    let ppResp = {
      "client": {
        "environment": "sandbox",
        "product_name": "PayPal iOS SDK",
        "paypal_sdk_version": "2.16.0",
        "platform": "iOS"
      },
      "response_type": "payment",
      "response": {
        "id": "PAY-1AB23456CD789012EF34GHIJ",
        "state": "approved",
        "create_time": "2016-10-03T13:33:33Z",
        "intent": "sale"
      }
    };

    this.sendPayData(ppResp);


  }


}
