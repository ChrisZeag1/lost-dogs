import { Component} from '@angular/core';

@Component({
  selector: 'home',
  template: require('./home.template.html')
})
export class homeComponent {
  public dir: string;
  constructor () { }
};
