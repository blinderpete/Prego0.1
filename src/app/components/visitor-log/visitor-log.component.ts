import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FetchService } from 'src/app/services/fetch.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-visitor-log',
  templateUrl: './visitor-log.component.html',
  styleUrls: ['./visitor-log.component.scss'],
})
export class VisitorLogComponent implements OnInit {
  dateFrom = new Date();
  dateTo = new Date();

  orgID: string = '';
  orgName: string;

  constructor(private modalCtrl: ModalController,
    private navParams: NavParams,
    private fetch: FetchService,
    private http: HttpClient) {
    this.orgID = this.navParams.get('orgid');
    this.orgName = this.navParams.get('orgname');
  }

  ngOnInit() { }
  cancel() {
    this.modalCtrl.dismiss();
  }

  requestReport() {
    console.log('Dates:: ', this.dateFrom + ' / ' + this.dateTo);
    let ret = {
      orgid: this.orgID,
      datefrom: this.dateFrom,
      dateto: this.dateTo
    }
    let url = this.fetch.getBaseURL();
    this.http.post(url + 'pregovisitorlog.jsn', JSON.stringify(ret))
      .subscribe(resp => {
        let serverResp = JSON.parse(JSON.stringify(resp));
        console.log(serverResp);
        if (serverResp.result == 'success') {

        } else {

        }
      });

    this.modalCtrl.dismiss(JSON.stringify(ret));
  }

}
