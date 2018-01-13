import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {GlobalFunctionService} from './global-function.service';
import {CookieManagerService} from './cookie-manager.service';

@Injectable()
export class UserService {
  public isAuth: boolean;
  public isAvatarSet: boolean;
  public user: any;
  public token: string;
  public userCookieName: string = 'user';
  public loading: boolean;
  public errors: {passwordReq: boolean, userReq: boolean, invalidUser: boolean};
  public mapsApi: any;
  public previousUrl: string;
  public timesTrying: number = 0;
  public forgotloading: boolean;
  public forgotSucess: boolean;
  public tempUserName: any;

  constructor (public api: ApiService, public router: Router, public globalService: GlobalFunctionService, public CookieService: CookieManagerService) {
    this.user = {};
    this.errors = {passwordReq: false, userReq: false, invalidUser: false};
    const userCookie: any = this.CookieService.getCookie(this.userCookieName);
    const userToken: any = this.CookieService.getCookie('authToken');
    if (userCookie) {
      this.user = userCookie;
      this.isAuth = true;
      this.isAvatarSet = true;
    } else {
      console.log('else login with no values auth');
      this.login(undefined, undefined, true);
      this.isAvatarSet = false;
    }
    if (userToken) {
      this.token = userToken.authToken;
    }
  }

  public setUser(response: any): void {
    if (response.token) {
      this.token = response.token;
      this.CookieService.setCookie('authToken', {authToken: this.token});
    }
    if (response.surname) {
      this.user.name = response.name || response.username;
      this.user.lastName = response.surname;
      this.user.avatar = response.avatar_url;
      this.user.email = response.email;
      this.user.lastName2 = response.lastname;
      this.user.address = response.address;
      this.user.phoneNumber = response.phone_number;
      this.user.username = response.username;
      this.isAuth = true;
      this.CookieService.setCookie(this.userCookieName, this.user);
      
    }
  }

    public getUserLocation(): Promise<any> {
      return new Promise((resolve, reject) => {
          let errorMessage: string;
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (sucess) => {
                  errorMessage = undefined;
                  this.user.location = {lat: sucess.coords.latitude , lng: sucess.coords.longitude};
                  resolve(this.user.location);
              }, (error) => {
                switch(error.code) {
                  case error.PERMISSION_DENIED:
                    errorMessage = 'User denied the request for Geolocation.';
                    break;
                  case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                  case error.TIMEOUT:
                    errorMessage = 'The request to get user location timed out.';
                    break;
                  case error['UNKNOWN_ERROR']:
                    errorMessage = 'An unknown error occurred.';
                    break;
                }
                this.openErrorModal(errorMessage);
                reject(undefined);
              });
          } else {
              errorMessage = 'Geolocation is not supported by this browser.';
              this.openErrorModal(errorMessage);
              reject(undefined);
          }        
      })
  }

  public openErrorModal (errorMessage: string): void {
      this.globalService.clearErroMessages();
      this.globalService.setErrorMEssage(errorMessage);
      this.globalService.openErrorModal();
  }


  public loginSucess(data: any): void {
    this.tempUserName = undefined;
    this.loading = false;
    this.timesTrying = 0;
    this.setUser(data);
    this.isAvatarSet = true;
    this.errors.invalidUser = false;
    if (this.previousUrl) {
    this.router.navigateByUrl(this.previousUrl);
    this.previousUrl = undefined;
    } else  {
      this.router.navigate(['/home']);
    }
    window.scroll(0,0);
  }

  public forgot(userName: string): Subscription {
    const url: string = 'https://fierce-falls-25549.herokuapp.com/api/users/' + userName + '/forgotPassword';
    this.forgotloading = true;
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': 'token ' + this.token
    };
    return this.api.post(url, {}, headers).subscribe(
      data => {
        this.forgotSucess = true;
        this.forgotloading = false;
        this.tempUserName = undefined;
      },
      error => {
        let messsage: string;
        this.forgotloading = false;
        this.forgotSucess = false;
        if (error.status === 404) {
          messsage = 'Usuario no encontrado';
        }else {
          messsage = 'hubo un problema al enviar el correo';
        }
        this.globalService.clearErroMessages();
        this.globalService.setErrorMEssage(messsage);
        this.globalService.openErrorModal();        
      }
    );
  }

  public loginNotSuccess(e: any): void {
    this.loading = false;
    this.errors.invalidUser = true;
    this.timesTrying++;
    console.error('error in login', e);
  }

  public login(username?: string, password?: string, noAuth?: boolean): void {
    if( password && username || noAuth) {
      const user:any = {password: password, username: username};
      this.loading = true;
      this.api.post('https://fierce-falls-25549.herokuapp.com/api/users/login', user).subscribe(
        data => this.loginSucess(data),
        e => this.loginNotSuccess(e),
      );
    } else {
      this.errors.userReq = !username ? true : false;
      this.errors.passwordReq = !password ? true : false;
    }
  }

  public logout(): void {
    this.isAuth = false;
    this.isAvatarSet = false;
    this.CookieService.deleteCookie(this.userCookieName);
    this.CookieService.deleteCookie('authToken');
    this.user = {};
  }
}