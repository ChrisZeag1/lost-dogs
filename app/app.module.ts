import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {AppRouterModule, routerComponents} from './app.router';
import {appComponent} from './app.component';
import  {generalHeaderComponent} from './common/components/header/general-header.component';
import {generalFooterComponent} from './common/components/footer/general-footer.component';
@NgModule({
  imports: [BrowserModule, AppRouterModule],
  declarations: [appComponent, routerComponents, generalHeaderComponent, generalFooterComponent],
  bootstrap:    [appComponent]
})
export class AppModule {}