import { Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: '<div>{{header}}</div><div><a routerLink="home">home</a>  <a routerLink="board">board</a>  <a routerLink="account">account</a>  <a routerLink="lostfound">lostfound</a>  <a routerLink="profile">profile</a>  <a routerLink="selection">selection</a></div><router-outlet></router-outlet><div>{{footer}}</div>'
})
export class appComponent {
  public header: string;
  public footer: string;
  constructor () {
    this.header = 'this is the header';
    this.footer = 'this is the footer';
  }
};