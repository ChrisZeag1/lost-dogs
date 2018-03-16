import { Component} from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import {Router, NavigationEnd, Routes} from '@angular/router';
import {GlobalFunctionService} from './common/services/global-function.service';
import {ApiService} from './common/services/api.service';
import {UserService} from './common/services/user.service';
import {CookieManagerService} from './common/services/cookie-manager.service';
import 'jquery';
import 'materialize-css/dist/js/materialize.js';
import 'materialize-css/bin/materialize.css';
import 'hammerjs';
import 'hammer-timejs';

@Component({
  selector: 'my-app',
  encapsulation: ViewEncapsulation.None,
  template:  require('./app.template.html'),
  styles: [require('./main.scss')]
})
export class appComponent {
  // TODO: remove in prod only for temp access.
  public show: boolean;
  public loading: boolean;
  public errors: boolean;

  constructor (public routing: Router, public globalService: GlobalFunctionService, public api: ApiService, public cookieService: CookieManagerService, public userService: UserService) {
    this.routing.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.globalService.paymentRewardSucess = this.globalService.emailSendedReview = undefined;
        window.scroll(0,0);
      }
    });
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.userService.user.location = undefined;
    this.cookieService.setCookie(this.userService.userCookieName, this.userService.user);
  } 
};
