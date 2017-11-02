import {Component, Input, Output, EventEmitter} from '@angular/core';
@Component({
  selector: 'size-block',
  template: require('./size-block.template.html'),
  styles: [ require('./size-block.scss')]
})

export class SizeBlockComponent { 
  public elements: any[];
  @Output()
  public selectedEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  public removedElement: any

  constructor() {
    this.setElement();
  }
  
  public ngOnInit(): void {}


  public setElement() {
  this.elements = [
    {imgUrl:'http://cdn.lostdog.mx/assets/img/size-tiny.png', name: 'Dimimuto', apiVal: '0'},
    {imgUrl:'http://cdn.lostdog.mx/assets/img/size-small.png', name: 'Pequeño', apiVal: '1'},
    {imgUrl:'http://cdn.lostdog.mx/assets/img/size-medium.png', name: 'mediano', apiVal: '2'},
    {imgUrl:'http://cdn.lostdog.mx/assets/img/size-big.png', name: 'grande', apiVal: '3'}
    ];
  }


  public changeElement(event: any): void {
    this.selectedEmitter.emit(event);
  }
}
