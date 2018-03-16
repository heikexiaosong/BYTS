import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {Api} from "../../providers/api";

/**
 * Generated class for the CustomerSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-customer-select',
  templateUrl: 'customer-select.html',
})
export class CustomerSelectPage {


  private keyword:string = "";

  public customers  = [];

  public showCustomers  = [];

  private resolve:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
                private _api: Api) {
    this.resolve = navParams.get('resolve');
    this.customers = [];
  }

  ionViewDidLoad() {
    this.customers = [];
    console.log('ionViewDidLoad CustomerSelectPage');

    this._api.loadCustomers(100, '').subscribe(
      data => {
        var result = data.json();
        console.log("Login Result: " + JSON.stringify(result));
        this.customers = result;
        this.showCustomers = this.customers;
      },
      err => console.error(err),
      () => {
        console.log('getRepos completed');
      }
    );

  }


  searchCustomer(event){
    this.showCustomers = [];
    this._api.loadCustomers(100, this.keyword).subscribe(
      data => {
        var result = data.json();
        console.log("Login Result: " + JSON.stringify(result));
        this.customers = result;
        this.showCustomers = this.customers;
      },
      err => console.error(err),
      () => {
        console.log('getRepos completed');
      }
    );
  }

  customerSelected(customer) {
    this.resolve(customer); // 可在 resolve 中添加返回的数据，如 this.resolve(data);
    this.navCtrl.pop();
  }


}
