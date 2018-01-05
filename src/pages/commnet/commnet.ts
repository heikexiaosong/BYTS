import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the CommnetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-commnet',
  templateUrl: 'commnet.html',
})
export class CommnetPage {

  private resolve:any;

  private comment:String = "";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.resolve = navParams.get('resolve');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CommnetPage');
  }

  cancel(){
    this.navCtrl.pop();
  }

  submit(){
    this.resolve(this.comment); // 可在 resolve 中添加返回的数据，如 this.resolve(data);
    this.navCtrl.pop();
  }

}
