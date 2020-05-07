import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ToastController, IonInput, AlertController } from '@ionic/angular';
import { FetchService } from 'src/app/services/fetch.service';
import { HttpClient } from '@angular/common/http';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.scss'],
})
export class CaptureComponent implements OnInit {
//@ViewChild('eName',{read:'', static:false}) eName : IonInput;
 // @ViewChild('entername',{read:"", static:false}) entername : any;

@Output() isReset = new EventEmitter<string>();

orgID : string;
siteID : string;

yourName : string = "";
yourOrg : string = "";
yourMobile : string = "";
yourEmail : string = "";

terms = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tincidunt, " +
"felis at malesuada volutpat, velit odio cursus mi, ac feugiat justo augue " +
"vel mauris. Nam non bibendum lacus, et varius est. Nunc ornare interdum pharetra." +
" Mauris a imperdiet arcu. Etiam nec dui lectus. Mauris mollis volutpat sapien nec " + 
"luctus. Suspendisse in consectetur nisl. Etiam luctus sed neque vel sodales. "+
"Aenean ex tortor, venenatis eget mi sit amet, finibus finibus mauris." +
" " ;

prego = {
  result: "",
  msg: "",
  pin: "",
  orgid: "",
  siteid: "",
  orgname: ""
};

  constructor(private speech: SpeechRecognition,
        private toast:ToastController,
        private fetch:FetchService,
        private http:HttpClient,
        private alertCtrl:AlertController) { }

  ngOnInit() {

this.getStoredValues();

    this.speech.isRecognitionAvailable().then((available: boolean) => {
      console.log(available);
    })
      .catch((err) => console.log(err));
  }

  async getStoredValues() {
    const resp = await  Storage.get({key:'prego'});
    this.prego = JSON.parse(resp.value);
    console.log('Captures::',this.prego);

  }
async doAlert(header, msg, sub?) {
  const alert = await this.alertCtrl.create({
    header: header,
    subHeader: sub,
    message: msg,
    buttons: ['OK']
  });
  alert.present();
}

  timeIn() {
    this.sendCapture('Time In');
  }

  async timeOut() {
    if ( this.yourMobile  == 'waikanae') {
      console.log('Start the Reset process....');
      await this.reset();
      await this.resetStoredData();
      this.showMessage('RESET');
      this.isReset.emit('reset');
      return;
    }

    this.sendCapture('Time Out');
  }

  reset() {
    this.yourEmail = "";
    this.yourMobile = "";
    this.yourName = "";
    this.yourOrg = "";

 //   this.eName.setFocus();
  }

async doThankYou() {
  const theToast = await this.toast.create({
    message: "Thank you!",
    position: "middle",
    cssClass: "thankyou",
    duration: 1500
  });
  theToast.present();
}

sendCapture(type:string) {
  if (this.yourName == "" && (this.yourMobile == "" || this.yourEmail =="" )) {
  //  this.showMessage('We need your name and at least either Email or Mobile');
    this.doAlert('Warning!','We need your name and at least either Email or Mobile');
    return;
  }
  let postData = {
    orgid : this.prego.orgid,
    siteid : this.prego.siteid,
    visittype: type,
    yourname: this.yourName,
    yourorg: this.yourOrg,
    youremail: this.yourEmail,
    yourmobile: this.yourMobile
  }
  let url = this.fetch.getBaseURL();
  this.http.post(url + 'pregocapture.jsn', JSON.stringify(postData))
    .subscribe(resp => {
      let resJSON = JSON.parse(JSON.stringify(resp));
      if (resJSON.result == 'success') {
        this.doThankYou();
        this.reset();
      } else {
        this.showMessage(resJSON.msg);
        console.error(resJSON);
      }
    });

    //

}


  startListen(options) {
    // Start the recognition process
    this.speech.startListening(options)
      .subscribe(
        (matches: string[]) => console.log(matches),
        (onerror) => console.log('error:', onerror)
      )
  }
  stopListen() {
    // Stop the recognition process (iOS only)
    this.speech.stopListening()
  }

  getSupportedLang() {
    // Get the list of supported languages
    this.speech.getSupportedLanguages()
      .then(
        (languages: string[]) => console.log(languages),
        (error) => console.log(error)
      )
  }

  checkPermission() {
    // Check permission
    this.speech.hasPermission()
      .then((hasPermission: boolean) => console.log(hasPermission))
  }

  requestPermission() {
    // Request permissions
    this.speech.requestPermission()
      .then(
        () => console.log('Granted'),
        () => console.log('Denied')
      )
  }



  async showMessage(msg) {
    const theToast = await this.toast.create({
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


  async resetStoredData() {
    await Storage.set({key:'prego',value: JSON.stringify({})});
    this.getStoredValues();
  }

}
