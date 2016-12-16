import { Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: '<div>{{header}}</div><div>{{footer}}</div>'
})
export class appComponent {
  public header: string;
  public footer: string;
  constructor () {
    this.header = 'this is the header';
    this.footer = 'this is the footer';
  }
};
