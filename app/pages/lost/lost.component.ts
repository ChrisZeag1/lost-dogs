import { Component, ElementRef, ViewChild} from '@angular/core';
import {DogCardService} from '../../common/services/dog-card.service';
import {LostFoundService} from '../../common/services/lost-found.service';
import {Router, NavigationEnd} from '@angular/router';
import {UserService} from  '../../common/services/user.service';
import {GlobalFunctionService} from '../../common/services/global-function.service';

require('../../common/plugins/masks.js');
require('../../common/plugins/nodoubletapzoom.js');

@Component({
  selector: 'lost',
  template: require('./lost.template.html'),
  styles: [ require('./lost.scss')]
})
export class lostComponent {
  public dogCards: number[];
  public generalAnswer: any;
  public goBack: boolean;
  public fullWidth: number;
  public progress: number;
  public displayIntro: boolean;
  @ViewChild('Progress')
  public progressDom: ElementRef;
  public window: Window;

  constructor (public dogCardService: DogCardService, public lostService: LostFoundService, public router: Router, public userService: UserService, public domEl: ElementRef, public globalService: GlobalFunctionService) {
    this.dogCards = [];
    this.progress = 0;
    this.window = window;
    for (let i = 0; i < 13; ++i) {
      this.dogCards.push(i);
    }
    // route change detection
    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
         window.scroll(0,0);
        const urlChildLoction = data.url.split('/')[2];
        const Indexlocation = this.lostService.sequence.indexOf(urlChildLoction);
        this.lostService.pagePosition = Indexlocation !== -1 ? Indexlocation : 0;
        if (this.lostService.retrieveData) {
          this.lostService.retrieveData(this.lostService.pageAnswers[this.lostService.pagePosition], this.lostService);
          this.lostService.retrieveData = undefined;
        }

        setTimeout(() => {
          this.lostService.maskInit();
        }, 20)
        // if the  page is option then an empty array should be set, but for this, the page should NOT have aldeay an answer and the previous
        // page should have one.
        const previousIndex = this.lostService.pagePosition === 0 ? this.lostService.pagePosition : this.lostService.pagePosition -1;
        if (this.lostService.optional && this.lostService.pageAnswers[previousIndex] && !this.lostService.pageAnswers[this.lostService.pagePosition]) {
          this.lostService.pageAnswers[this.lostService.pagePosition] = [];
        }
        this.goBack = this.lostService.pagePosition !== 0 && !this.lostService.pageAnswers[previousIndex];
        this.progress = this.lostService.pagePosition / (this.lostService.sequence.length - 1);
        this.progress = this.lostService.inReviewPage ? 1 : this.progress;
      }
    });
  }
  public ngOnInit(): void {
    if (!this.userService.isAuth) {
      this.userService.previousUrl = this.router.url;
      this.router.navigate(['/login']);
    }
    this.lostService.resetService();
    this.displayIntro = true;
    this.dogCardService.open = true;
    this.lostService.parentPage = this.router.url.split('/')[1];
    this.fullWidth = this.progressDom.nativeElement.clientWidth;
    // sequence could change according to the action Lost/ Found.
    const lost: boolean = this.lostService.parentPage === 'lost';
    this.lostService.searchService.addQuery('lost', !lost);
    this.lostService.searchService.addQuery('pageSize', this.lostService.searchService._pageSize);
    if (lost) {
      this.lostService.sequence = this.lostService.defualtSequence;
      this.lostService.displayedSequence = this.lostService.defaultDisplayedSequence;
    } else if(!lost) {
      this.lostService.sequence = this.lostService.defualtSequence;
      this.lostService.displayedSequence = this.lostService.defaultDisplayedSequence;
    }

    this.lostService.displayedSequence.forEach((value: any, index: number) => {
      this.lostService.pageAnswers.push(undefined);
    });
  }

  public ngAfterViewInit(): void {
  }  

  public ngDoCheck(): void {
    if (this.goBack) {
      this.lostService.back();
      this.goBack = false;
    }
  }

  public onFocusAddres() {
    this.lostService.latLng = undefined;
    this.lostService.address = undefined;
  }

  public imgBlockRemove(): void {
    // making angular copy in order for the ngChange to detecte it;
    this.lostService.imgAnswer = JSON.parse(JSON.stringify(this.lostService.imgAnswer));
    this.lostService.imgAnswer.disabled = false;
    this.lostService.setAnwer();
  }

   public multipleBlockRemove(index: number): void {
     const name: string = this.lostService.multipleImgAnswers[index].name;
    if (name === 'Placa Id') {
      this.lostService.openNameInput = false; 
    }
    if (name && name.match(/back-color/g)) {
      return;
    }    
    // json parse so that Onchanges can detect the change.
    this.lostService.multipleImgAnswers = JSON.parse(JSON.stringify(this.lostService.multipleImgAnswers));
    this.lostService.multipleImgAnswers[index].disabled = false;
    this.lostService.setAnwer();
  } 

  public start(): void {
    this.displayIntro=false;
    this.dogCardService.open=false;
     this.lostService.start = true;
    this.lostService.searchService.resetResults();
    this.lostService.searchService.search().add(() => {
      this.lostService.setAnwer();
    });
  }

  public showReview(): boolean {
    const answer: any[] = this.lostService.pageAnswers[this.lostService.pagePosition];
    const values: any[]= Array.isArray(answer) && answer.filter((value)=>{return value.disabled});
    const inColor: boolean = this.lostService.defualtSequence[this.lostService.pagePosition]==='color';
    return inColor && values.length > 1;
  }
  
}
