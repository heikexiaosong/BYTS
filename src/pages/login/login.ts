import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {Storage} from '@ionic/storage';

import {Api} from "../../providers/api";

import { ScanPage } from "../scan/scan";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  public newUser = {
      username: '',
      password: ''
  };
  public loginFormControl: FormGroup;

  constructor(
    private _nav: NavController,
    public navParams: NavParams,
    private api: Api,
    private storage: Storage) {
    this.loginFormControl = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');

      this.storage.get('access_token').then((val) => {
          console.log('access_token: ' + val);
          if ( val ){
              this.api.refresh(val).subscribe(
                  data => {
                      var result = data.json();
                      console.log("Login Result: " +  JSON.stringify(result));
                      if ( result.access_token  ){
                          this.storage.set('access_token', result.access_token);
                          sessionStorage.setItem('access_token', result.access_token);
                          this._nav.setRoot(ScanPage);
                      }
                  },
                  err => console.error(err),
                  () => {
                      console.log('getRepos completed');
                  }
              );
          }
      });
  }

  public login() {

    // Validation
    if (!this.loginFormControl.valid) {
      alert("用户名/密码不能为空");
      return;
    }

      //Take the values from  the form control
      this.newUser.username = this.loginFormControl.get("username").value.trim();
      this.newUser.password = this.loginFormControl.get("password").value;

    this.api.login(this.newUser.username, this.newUser.password).subscribe(
          data => {
              var result = data.json();
              console.log("Login Result: " +  JSON.stringify(result));
              if ( result.access_token  ){
                  this.storage.set('access_token', result.access_token);
                  sessionStorage.setItem('access_token', result.access_token);
                  this._nav.setRoot(ScanPage);
              } else {
                  if ( result.errcode == 20001 ) {
                    this._nav.setRoot(LoginPage);
                  } else {
                    var map = {
                      "-1": "系统错误",
                      "21003": "用户名不存在",
                      "21005": "密码错误",
                      "40000": "缺少参数",
                      "20001": "您还没有登录，请登录",
                      "43001": "查询对象没有找到",
                      "40010": "验证不通过"
                    }
                    alert( map[result.errcode.toString()] || result.errmsg );
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
