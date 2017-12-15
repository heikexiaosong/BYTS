import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomerSelectPage } from './customer-select';

@NgModule({
  declarations: [
    CustomerSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomerSelectPage),
  ],
})
export class CustomerSelectPageModule {}
