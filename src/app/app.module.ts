import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { Network } from '@ionic-native/network';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import { IonicStorageModule } from '@ionic/storage';

import { Api } from '../providers/api';

import { LoginPage } from '../pages/login/login';
import { ScanPage } from '../pages/scan/scan';
import { HomePage } from '../pages/home/home';
import { CustomerSelectPage } from "../pages/customer-select/customer-select";
import { CommnetPage } from '../pages/commnet/commnet';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    ScanPage,
    CustomerSelectPage,
    CommnetPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    ScanPage,
    HomePage,
    CustomerSelectPage,
    CommnetPage
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler },
    Api,
    StatusBar,
    SplashScreen,
    Network
  ]
})
export class AppModule { }
