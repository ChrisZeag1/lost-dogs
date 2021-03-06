import { Component, ViewChild, ElementRef, Input, SimpleChanges} from '@angular/core';
import {UserService} from '../../../common/services/user.service';
import {ValidationService} from '../../../common/services/validation.service';
import {formObj} from '../../create-account/account.component';
import {GlobalFunctionService} from '../../../common/services/global-function.service';
import {MailingRewardService} from '../../../common/services/mailing-reward.service';
import {DogCardService} from '../../../common/services/dog-card.service';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {OpenSpayService} from '../../../common/services/openspay.service';
import {LostFoundService} from '../../../common/services/lost-found.service';

export interface ICard {
  number: formObj;
  ownerName: formObj;
  expMonth: formObj;
  expYear: formObj;
  ccv: formObj;
  method: formObj;
  type: formObj;
}

@Component({
  selector: 'form-payment',
  template: require('./form-payment.template.html'),
  styles: [ require('./form-payment.scss')]
})
export class FormPaymentComponent {
  public creaditCard: ICard;
  public extra: {
    terms: formObj,
    noPersonalData: formObj
  };
  public months: string[];
  public years: string[];
  public cardSpin: boolean;
  public loading: boolean;
  public sucess: boolean;
  public dogId: string;
  public transcationId: string;
  public rewardAmount: string;
  public lostParam: string;
  public chargeCreate: boolean;
  @Input()
  public fromLostPage: boolean;
  @Input()
  public loadingImg: boolean;
  @Input()
  adsTotal: number;
  public _chargeCreateAmount = +process.env.BASE_COST;

  constructor (
    public userService: UserService,
    public router: Router,
    public validate: ValidationService,
    public globalService: GlobalFunctionService,
    public mailingService: MailingRewardService,
    public dogService: DogCardService,
    public activeRoute: ActivatedRoute,
    public openSpayService: OpenSpayService,
    public lostService: LostFoundService
  ) {
    this.creaditCard = {
      method: {valid: true, value: undefined, required: false, label: 'Método de pago'},
      number: {valid: true, value: undefined, required: true, label: 'Número de tarjeta'},
      ownerName: {valid: true, value: undefined, required: true, label: 'Nombre del dueño'},
      expMonth: {valid: true, value: undefined, required: true, label: 'Mes'},
      expYear: {valid: true, value: undefined, required: true, label: 'Año'},
      ccv: {valid: true, value: undefined, required: true, label: 'Ccv'},
      type: {valid: true, value: undefined, required: false, label: 'tipo de tarjeta'}
    };
    this.extra = {
      terms: {valid: true, value: undefined, required: true , label: 'Terminos & condiciones'},
      noPersonalData: {valid: true, value: undefined, required: true, label: 'No proporciones tu domicilio'}
    };
    this.months = [];
    this.years = [];
    const todaysYear: number = (new Date()).getFullYear();
    for (let i = 1; i <= 12; i++) {
      const twodigit: string = i < 10 ? '0' + i : '' + i;
      this.months.push(twodigit);
    }
    for (let i = todaysYear; i <= todaysYear + 10; i++) {
      this.years.push('' + i);
    }
  }

  public ngOnInit(): void {
    this.mailingService.evidence.text = localStorage.getItem('evidence-text-0');
    this.mailingService.evidence.picture = localStorage.getItem('evidence-picture-0');
    this.openSpayService.initOpenPay();
    if (!this.fromLostPage) {
      this.lostService.resetService();
    }
    if (!this.userService.isAuth) {
      return;
    }
    const monthSelect: JQuery = $('#cc-month');
    const yearSelect: JQuery = $('#cc-year');
    monthSelect.change(() => {
      this.creaditCard.expMonth.value = monthSelect.val();
      this.creaditCard.expMonth.valid = true;
    });
    yearSelect.change(() => {
      this.creaditCard.expYear.value = yearSelect.val().substring(2, 4);
      this.creaditCard.expYear.valid = true;
    });
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.dogId = params.cID;
      this.transcationId = params.transcation;
      this.lostParam = params.Lt;
      const value: string = this.lostService.defualtSequence[this.lostService.defualtSequence.length - 1];
      this.chargeCreate = !!~this.router.url.indexOf(value);

      this.rewardAmount = params.rW || (this.dogService.dogData && this.dogService.dogData.reward);
       this.rewardAmount =  this.rewardAmount &&  this.rewardAmount + '';
       this.backToBoard();
      if (this.rewardAmount && this.dogService.dogData && +this.rewardAmount < 10) {
        this.noChargeProcced();
      }
      if (!this.dogService.dogData && this.dogId) {
        this.dogService.getDog(this.dogId).add(() => {
          this.setReward(params.rW);
        });
      }else if (!this.dogService.dogData && this.transcationId) {
      this.mailingService.getTransaction(this.userService.token, this.transcationId).add(() => {
        this.mailingService.transaction && this.dogService.getDog(this.mailingService.transaction.dog_id).add(() => {
          this.setReward(params.rW);
        });
      });
    } else if (this.chargeCreate) {
      this.setAdsTotal(this.adsTotal);
    }
    });
  }

  public ngAfterViewInit(): void {
    $('select').material_select();
    $('#cc-number').mask('0000-0000-0000-0000');
    $('#ccv'). mask('0000');
    if (this.userService.isAuth) {
      this.creaditCard.ownerName.value = this.userService.user.name + ' ' + this.userService.user.lastName + ' ' + this.userService.user.lastName2;
    }
    if (/review/g.test(this.router.url)){
      this.extra.noPersonalData.value = true;
    }
  }

  public setReward(param: string): void  {
    this.rewardAmount =  !param ? this.dogService.dogData.reward : param;
    this.rewardAmount =  this.rewardAmount || '00.00';
    if (+this.rewardAmount < 10) {
      this.noChargeProcced();
    }
    this.backToBoard();
  }

  public backToBoard(): void {
    if (this.dogService.dogData && this.dogService.dogData.rewardPayed && !this.fromLostPage) {
      this.globalService.clearErroMessages();
      this.globalService.setErrorMEssage('El perro ya tiene una transacción en proceso');
      this.globalService.setSubErrorMessage('Espera a que termine la transacción pediente');
      this.globalService.openErrorModal();
      this.router.navigateByUrl('/board');
    }
  }

  public pay(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.creaditCard.type.value = this.validate.cardType;
    this.globalService.clearErroMessages();
    const card: boolean = this.validation(this.creaditCard);
    const extras: boolean = this.validation(this.extra);
    const validateCardNum: any = this.openSpayService.validateCardNum(this.creaditCard.number.value);
    const validateCvc: any = this.openSpayService.validateCvc(this.creaditCard.number.value, this.creaditCard.ccv.value);
    const validateExpiry: any = this.openSpayService.validateExpiry(this.creaditCard.expMonth.value, '20' + this.creaditCard.expYear.value);
    if (card && extras && validateCardNum && validateExpiry && validateCvc) {
      this.cardSpin = true;
      this.loading = true;
      this.proccedTransaction();
    } else  {
      if (!validateExpiry) {
        this.creaditCard.expYear.valid = false;
        this.creaditCard.expMonth.valid = false;
        this.globalService.setErrorMEssage('Fecha invalida');
      }
      if (!validateCardNum) {
        this.creaditCard.number.valid = false;
        this.globalService.setErrorMEssage('Número de tarjeta invalido');
      }
      if (!validateCvc) {
        this.creaditCard.ccv.valid = false;
        this.globalService.setErrorMEssage('CCV invalido');
      }
      this.globalService.openErrorModal();
    }
  }

  public validation(formObj: any): boolean {
    let validFrom: boolean = true;
    const formObjKeys: string[] = Object.keys(formObj);
    let message: string;
    formObjKeys.forEach((value: string, valueIndex: number) => {
      if (formObj[value].required && !formObj[value].value) {
        validFrom = false;
        formObj[value].valid = false;
        message = message ? message : formObj[value].label +' requerido';
      } else if (!formObj[value].valid) {
        validFrom = false;
        message = message ? message : formObj[value].label +' requerido';
      }
    });
    this.globalService.setErrorMEssage(message);
    return validFrom;
  }

  public proccedTransaction(): void {
    const tokenData: any = this.openSpayService.mapTokenData(this.creaditCard);
    this.openSpayService.createToken(tokenData).then((sucess: any) => {
      if (this.openSpayService.tokenId) {
        const transDesc: string = this.chargeCreate ? 'pago para reportar perro' : 'pago de recompensa de ' + this.userService.user.name + ' para el perro >' + this.dogService.dogData._id;
        const chargeObj: any = this.openSpayService.mapChargeRequest(this.rewardAmount, this.userService.user,transDesc);
        if (this.transcationId) {
          this.openSpayService.chargeClient(chargeObj, this.userService.token, this.transcationId).add(() => {
            this.loading = false;
            if (this.openSpayService.sucessPaymentId || this.openSpayService.dataPayment.rescuer) {
              this.sucess = true;
              this.globalService.paymentRewardSucess = true;
              $('html, body').animate({ scrollTop: 0 }, 500);
            }
          });
        } else if (this.dogId) {
          this.mailingService.sendEmailsToUsers(false, this.userService.token, this.dogService.dogData._id, chargeObj).add(() => {
            this.loading = false;
            if (!this.mailingService.errorInEmails) {
              this.sucess = true;
              this.globalService.paymentRewardSucess = true;
              $('html, body').animate({ scrollTop: 0 }, 500);
            }
          });
        } else if (this.chargeCreate) {
          this.lostService.saveToApi(chargeObj).add(() => {
            this.loading = false;
            if (this.lostService.savedData) {
            }
          });
        }        
      }
    }).catch((error) => {
      this.loading = false;
      console.error('proccedTransaction error in token > ', error);
    });
  }

  public noChargeProcced(): void {
    const today: Date = new Date();
    this.loading = true;
    this.creaditCard.number.value = '4111-1111-1111-1111';
    this.creaditCard.ownerName.value = 'Jhon Doe';
    this.creaditCard.expMonth.value = (today.getMonth() + 1) + '';
    this.creaditCard.expYear.value = ((today.getFullYear() + 2) + '').substring(2, 4);
    this.creaditCard.ccv.value = '123';
    this.extra.noPersonalData.value = true;
    this.extra.terms.value = true;
    this.pay();
  }

  public ngOnChanges(changes: SimpleChanges): void {
   if (changes.adsTotal) {
       this.setAdsTotal(changes.adsTotal.currentValue);
   }
  }  

  public setAdsTotal(adsTotal: number): void {
    if (typeof adsTotal  === 'number') {
      this.rewardAmount = (this._chargeCreateAmount + adsTotal).toFixed(2);
    } else {
      this.rewardAmount = this._chargeCreateAmount.toFixed(2);
    }
  }
};
