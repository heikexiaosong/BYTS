import {Component, ViewChild, HostListener, ChangeDetectorRef  } from '@angular/core';
import {Content, NavController, AlertController, ToastController } from 'ionic-angular';
import {Storage} from '@ionic/storage';

import {Api} from "../../providers/api";
import {LoginPage} from "../login/login";
import {CustomerSelectPage} from "../customer-select/customer-select";
import {CommnetPage} from "../commnet/commnet";

@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {

  @ViewChild(Content) content: Content;

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

      console.log(JSON.stringify(event.key) + event.code);
      console.log("Code:" + this.productCode);
      if ( event.keyCode == 13 ){
        this.loadProduct(this.productCode);
        this.productCode = "";
      } else {
        this.productCode = this.productCode + event.key;
      }
  }

  public products;

  private selectedCustomer = {};
  private orderId = "";

  private  box = 0;
  private single = 0;

  private map = {
    "-1": "系统错误",
    "21003": "用户名不存在",
    "21005": "密码错误",
    "40000": "缺少参数",
    "20001": "您还没有登录，请登录",
    "43001": "查询对象没有找到",
    "40010": "验证不通过"
  }

  private productCode: string = "";

  constructor(private _nav: NavController,
              private _api: Api,
              public alertCtrl: AlertController,
              public cd: ChangeDetectorRef,
              public toastCtrl: ToastController,
              private storage: Storage) {
    this.products = [];
  }

  ionViewDidLoad() {
  }

  compareCustomer(e1, e2): boolean {
    return e1 && e2 ? e1.code === e2.code : e1 === e2;
  }

  private loadProduct(code) {

    console.log("Load: " + code);

    if (code.length == 0) {
      return;
    }

    // if ( code ==1){
    //   code  = "http://p.jobin9.com/qr/58ba60ea26a196073464cd1c";
    // } else {
    //   code  = "000000000001055";
    // }


    this._api.loadProduct(code).subscribe(
      data => {
        var result = data.json();
        console.log("Product: " + JSON.stringify(result));

        if (result.errcode) {
          if ( result.errcode == 20001 ) {
            this._nav.setRoot(LoginPage);
          } else {
            this.toastCtrl.create({
              message: "[编码: " + code + "]" + "\n" + (this.map[result.errcode.toString()] || result.errmsg),
              duration: 1000
            }).present();
          }
          return;
        }

        for (let i = 0; i < this.products.length; i++) {
          if (this.products[i].id === result.id) {
            return;
          }
        }

        result.desc = '';
        if (result.type == 'single') {
          result.desc = '件';
        } else if (result.type == 'box') {
          result.desc = '箱';
          this.box++;
        }
        this.single += result.quantity;

        this.products.push(result);
        this.cd.detectChanges();
        this.content.scrollToBottom();
      },
      err => console.error(err),
      () => {
        console.log('getRepos completed');
      }
    );

    this.productCode = "";
  }

  removeItem(product) {
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i] == product) {
        this.products.splice(i, 1);
        if ( product.type == 'box') {
          this.box--;
        }
        this.single -= product.quantity;
      }
    }
    this.cd.detectChanges();
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
            this.storage.set('access_token', "");
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
            this.selectedCustomer = {name: ""};
            this.orderId = "";
            this.box=0;
            this.single=0;
          }
        }]
    });

    confirm.present();
  }

  // 订单提交
  submit() {
    if (this.selectedCustomer == null
      || this.selectedCustomer["code"] == null
      || this.selectedCustomer["code"] == "") {
      debugger;
      alert("请选择一个客户");
      return
    }

    if (this.products == null || this.products.length == 0) {
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
              if (batchMap[product.batchId] == null) {
                batchMap[product.batchId] = [];
              }
              batchMap[product.batchId].push(product);
              relationQuantity = relationQuantity + product.quantity;
            }

            var goodsBatchList = [];
            for (let batchId in batchMap) {
              var list = batchMap[batchId];
              if (list != null && list.length > 0) {
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
                  batch["batchCode"] = product["batchCode"] || batch["batchCode"];
                  if (product["type"] == "box") {
                    batch.packagingList.push({
                      packaging: product.id,
                      quantity: product.quantity
                    });
                  } else if (product["type"] == "single") {
                    if (batch.qrcodes.indexOf(product.id) < 0) {
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
                  this.selectedCustomer = {name: ""};
                  this.orderId = "";
                  this.box=0;
                  this.single=0;
                } else {
                  if ( result.errcode == 20001 ) {
                    this._nav.setRoot(LoginPage);
                  } else {
                    alert("出库单生成失败: " + (this.map[result.errcode.toString()] || result.errmsg))
                  }
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

  // 用户输入框
  onustomerFocus(event) {
    new Promise((resolve, reject) => {
      this._nav.push(CustomerSelectPage, { resolve: resolve });
    }).then((data) => {
      this.selectedCustomer = data;
    });

  }

  commentFocus(event){

    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'title',
          placeholder: '备注说明, 最多128字符'
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '完成',
          handler: data => {
            console.log('Saved clicked' + JSON.stringify(data));
            this.orderId = data.title;
          }
        }
      ]
    });
    prompt.present();

    // new Promise((resolve, reject) => {
    //   this._nav.push(CommnetPage, { resolve: resolve });
    // }).then((data) => {
    //   debugger;
    //   console.log(JSON.stringify(data));
    // });
  }
}
