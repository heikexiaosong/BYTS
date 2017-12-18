import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {LoadingController, ToastController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';
import { Network } from '@ionic-native/network';

@Injectable()
export class Api {
    private headers = new Headers();

  private doamin = "http://channel.cloudinward.com/ws";

  //private doamin = "http://114.55.253.187:8125/ws";

  private net_toast;


    dismissHandler() {
      console.info('Toast onDidDismiss()');
      this.net_toast = null;
    }

    constructor(private http: Http,
                private _loadingController: LoadingController,
                private network: Network,
                public toastCtrl: ToastController,
                private storage: Storage) {

      console.log('Hello Api Provider');


      let disconnectSubscription = network.onDisconnect().subscribe(() => {
        console.log('network was disconnected :-(');
        if ( this.net_toast == null ) {
          this.net_toast = this.toastCtrl.create({
            message: '网络通讯中断, 请检查网络设置',
            showCloseButton: true,
            closeButtonText: '知道了'
          });
          this.net_toast.onDidDismiss(this.dismissHandler);
          this.net_toast.present();
        }

      });


      // stop disconnect watch （停止断网检测）
      // disconnectSubscription.unsubscribe();
      // watch network for a connection
      let connectSubscription = network.onConnect().subscribe(() => {
        console.log('network connected!');
        if(this.network.type != 'none') {
          if ( this.net_toast == null ) {
            this.net_toast.dismiss();
          }
        }
      });

      console.log(network.type)
    }

    login(username, password) {
        this.storage.set('access_token', '');
        let loading = this._loadingController.create({
            content: "Please wait...",
        });
        loading.present();
        var subscribe = this.http.post(this.doamin + `/token/login`, {username: username, password: password});
        loading.dismiss();
        return subscribe;
    }

    refresh(access_token) {
        this.storage.set('access_token', '');
        let loading = this._loadingController.create({
            content: "Please wait...",
        });
        loading.present();
        var subscribe = this.http.post(this.doamin + `/users/refreshtoken?access_token=` + access_token, {});
        loading.dismiss();
        return subscribe;
    }

    loadCustomers(perPage) {
        this.storage.set('access_token', '');
        let loading = this._loadingController.create({
            content: "Please wait...",
        });
        loading.present();

        let access_token = sessionStorage.getItem('access_token');

        var subscribe = this.http.get(this.doamin + `/customers?access_token=` + access_token + `&perPage=` + perPage);
        loading.dismiss();
        return subscribe;
    }

    loadProduct(code) {
        this.storage.set('access_token', '');
        let loading = this._loadingController.create({
            content: "Please wait...",
        });
        loading.present();

        let access_token = sessionStorage.getItem('access_token');

        var subscribe = this.http.get(this.doamin + `/code?access_token=` + access_token + `&code=` + code);
        loading.dismiss();
        return subscribe;
    }

    submitOrder(order) {
        this.storage.set('access_token', '');
        let loading = this._loadingController.create({
            content: "Please wait...",
        });
        loading.present();

        let access_token = sessionStorage.getItem('access_token');

        var subscribe = this.http.post(this.doamin + `/order?access_token=` + access_token, order||{});
        loading.dismiss();
        return subscribe;
    }

}
