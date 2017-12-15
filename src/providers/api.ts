import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {LoadingController } from 'ionic-angular';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';

@Injectable()
export class Api {
    private headers = new Headers();

    private doamin = "http://channel.cloudinward.com/ws";

    //private doamin = "http://114.55.253.187:8125/ws";

    constructor(private http: Http,
                private _loadingController: LoadingController,
                private storage: Storage) {
        console.log('Hello Api Provider');
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
