import {Component} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Router, NavigationEnd} from '@angular/router';
import {GlobalFunctionService} from '../../common/services/global-function.service';
import {UserService} from  '../../common/services/user.service';
import {CookieManagerService} from  '../../common/services/cookie-manager.service';
require('../../common/plugins/masks.js');

@Component({
  selector: 'payment',
  template: require('./payment.template.html'),
  styles: [ require('./payment.scss')]
})

export class PaymentComponent {
  public title: string;

  constructor(public globalService: GlobalFunctionService, public router: Router, public userService: UserService, public cookieService: CookieManagerService) {
    const subscription = this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd && data.url.length) {
         const urlLoc = data.url.split('/')[1];
        const urlLoction = data.url && data.url.split('/')[2];
        const urlChildLoction = urlLoction && urlLoction.split('?')[0];
        if (urlChildLoction === 'review') {
          this.title = 'Sigue las instrucciones';
        }else if (urlChildLoction === 'form') {
          this.title = 'Agrega tu tarjeta';
        }
        if (urlLoc !== 'payment') {
          localStorage.removeItem('evidence-picture-0');
          localStorage.removeItem('evidence-text-0');
          subscription.unsubscribe();
        }        
      }
    });
  }
  public ngOnInit(): void {
    if (!this.userService.isAuth) {
      this.userService.previousUrl = this.router.url;
      this.router.navigate(['/login']);
    }
  }
}