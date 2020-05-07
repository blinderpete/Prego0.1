import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  // baseURL: string = "https://123.concordsystems.co/app/";
  baseURL: string = 'https://time.concordsystems.co/home/';



  constructor(private http: HttpClient) { }

getBaseURL():string {
  return this.baseURL;
}

  async get(endpoint) {
    let response = await fetch(this.baseURL + endpoint);

    let json = await response.json();
    console.log(json);
    return json;
  }

  getHTTP(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }
  console.log('Any Params? '+JSON.stringify(params));
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
      //  reqOpts.params.set(k, params[k]);
        reqOpts.params = reqOpts.params.append(k, params[k]);
        console.log("Adding params to the reqOpts " + params[k]);
      }
    }
    return this.http.get(this.baseURL + '/' + endpoint, reqOpts);
  }


  async postHTTP(endpoint: string, body: any, reqOpts?: any) {
  //  let data = {"username":"Peter"};
    console.log(body);
    await this.http.post(this.baseURL + endpoint,
                  JSON.stringify(body)).subscribe(resp => {
      console.log(JSON.stringify(resp));

      return resp;
    });

  }


  async post(endpoint, data) {
    console.log(data);
    return this.postHTTP(this.baseURL + endpoint, (data));

  }
}
