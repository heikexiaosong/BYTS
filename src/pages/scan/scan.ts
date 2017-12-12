import {Component, ViewChild} from '@angular/core';
import {Content, NavController} from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import {Api} from "../../providers/api";

import {BarcodeScanner} from "@ionic-native/barcode-scanner";

import {LoginPage} from "../login/login";

@Component({
    selector: 'page-scan',
    templateUrl: 'scan.html'
})
export class ScanPage {

    @ViewChild(Content) content: Content;

    public products;
    public customers;

    private selectedCustomer = {};
    private orderId = "";

    constructor(private _nav: NavController,
                private _api: Api,
                private _barcodeScanner: BarcodeScanner,
                public alertCtrl: AlertController) {
        this.products = [];
        this.customers = [];
    }

    ionViewDidLoad() {
        this._api.loadCustomers(100).subscribe(
            data => {
                var result = data.json();
                console.log("Login Result: " + JSON.stringify(result));
                this.customers = result;
            },
            err => console.error(err),
            () => {
                console.log('getRepos completed');
            }
        );
    }

    compareCustomer(e1, e2): boolean {
        return e1 && e2 ? e1.code === e2.code : e1 === e2;
    }

    public scanQR() {
        this._barcodeScanner.scan().then((barcodeData) => {
            if (barcodeData.cancelled) {
                console.log("User cancelled the action!");
                return false;
            }
            console.log("Scanned successfully!");
            console.log(barcodeData);

            this._api.loadProduct(barcodeData.text).subscribe(
                data => {
                    var result = data.json();
                    console.log("Login Result: " + JSON.stringify(result));

                    if ( result.errcode ){
                        alert("[Code: " + barcodeData.text + "]" + result.errmsg);
                        return;
                    }

                    result.desc = '';
                    if (result.type == 'single') {
                        result.desc = '单个';
                    } else if (result.type == 'box') {
                        result.desc = '箱';
                    }

                    let include = false;
                    for (let i = 0; i < this.products.length; i++) {
                        if (this.products[i].id === result.id) {
                            this.products[i].quantity = this.products[i].quantity + result.quantity;
                            include = true;
                            break;
                        }
                    }

                    if ( !include ){
                        this.products.push(result);
                    }
                    this.content.scrollToBottom();
                },
                err => console.error(err),
                () => {
                    console.log('getRepos completed');
                }
            );
        }, (err) => {
            console.log(err);
        });
    }

    removeItem(product) {
        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i] == product) {
                this.products.splice(i, 1);
            }
        }
    }

    logout() {
        let confirm = this.alertCtrl.create({
            message: '确定要退出当前账户?',
            buttons: [
                {
                    text: '取消',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: '确定',
                    handler: () => {
                        this._nav.setRoot(LoginPage);
                    }
                }]
        });

        confirm.present();
    }

    reset() {

        let confirm = this.alertCtrl.create({
            message: '确定要重置页面数据?',
            buttons: [
                {
                    text: '取消',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: '确定',
                    handler: () => {
                        this.products = [];
                        this.selectedCustomer = {};
                        this.orderId = "";
                    }
                }]
        });

        confirm.present();
    }

    // 订单提交
    submit() {
        if ( this.selectedCustomer==null
            || this.selectedCustomer["code"] ==null
            || this.selectedCustomer["code"] == "" ){
            debugger;
            alert("请选择一个客户");
            return
        }

        if ( this.products==null || this.products.length==0 ){
            alert("不能创建空明细订单");
            return
        }

        let confirm = this.alertCtrl.create({
            message: '确定要提交数据?',
            buttons: [
                {
                    text: '取消',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: '确定',
                    handler: () => {
                        var batchMap = {};
                        var relationQuantity = 0;
                        for (let product of this.products) {
                            if  ( batchMap[product.batchId] == null ){
                                batchMap[product.batchId] = [];
                            }
                            batchMap[product.batchId].push(product);
                            relationQuantity = relationQuantity + product.quantity;
                        }

                        var goodsBatchList = [];
                        for (let batchId in batchMap) {
                            var list = batchMap[batchId];
                            if ( list!=null && list.length > 0 ){
                                debugger;
                                var batch_base = list[0];
                                var batch = {
                                    batch: batch_base["batchId"],
                                    batchCode: batch_base["batchCode"],
                                    goods: batch_base["goodsId"],
                                    packagingList: [],
                                    qrcodes: [],
                                    total: 0
                                };

                                for (let product of list) {
                                    if ( product["type"] == "box" ){
                                        batch.packagingList.push({
                                            packaging: product._id,
                                            quantity: product.quantity
                                        });
                                    } else if ( product["type"] == "single" ){
                                        if ( batch.qrcodes.indexOf(product.id) < 0 ){
                                            batch.qrcodes.push(product.id);
                                        }
                                    } else {
                                        console.log("Type 格式不正确: " + JSON.stringify(product));
                                        continue;
                                    }
                                    batch.total = batch.total + product.quantity;
                                }
                                goodsBatchList.push(batch);
                            }
                        }

                        debugger;

                        var order_content = {
                            order: this.orderId,
                            customer: this.selectedCustomer["_id"],
                            customerName: this.selectedCustomer["name"],
                            relationQuantity: relationQuantity,
                            goodsBatchList: goodsBatchList
                        };

                        this._api.submitOrder(order_content).subscribe(
                            data => {
                                var result = data.json();
                                console.log("Order Submit Result: " + JSON.stringify(result));
                                result.desc = '';
                                if (result.errmsg == 'ok') {
                                    alert("出库单生成成功");
                                    this.products = [];
                                    this.selectedCustomer = {};
                                    this.orderId = "";
                                } else {
                                    alert("出库单生成失败: " + result.errmsg )
                                }
                            },
                            err => console.error(err),
                            () => {
                                console.log('getRepos completed');
                            }
                        );
                    }
                }
            ]
        });
        confirm.present();
    }
}
