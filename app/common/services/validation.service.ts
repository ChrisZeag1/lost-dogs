import {Injectable} from '@angular/core';

@Injectable ()
export class ValidationService {
  
  constructor(){};

  public name(field: string):boolean {
    const nameRegex: RegExp = /^(?!.*\s\s)(?!.*-)[a-zA-Z- ]+$/i;
    if (!nameRegex.test(field) || !field) {
      return false;
    }
    return true;
  }

  public phone(field: string): boolean {
    const phoneRegex: RegExp = /^[0-9-\.\+\(\)]+$/i;
    if (!phoneRegex.test(field)) {
      return false;
    }
    return true;    
  }

  public email(field: string): boolean {
    const emailRegex: RegExp = /^[\w\-\.\+]+@[\w\-\.\+]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(field)) {
      return false;
    }
    return true;
  }

  public userName(field: string): boolean {
    const userNameRegex: RegExp = /^([a-zA-Z0-9]{5,30})$/i;
    if (!field || !userNameRegex.test(field)) {
      return false;
    }
    return true;
  }

  public onlyNumbers(field: string, min: number = undefined, max: number = undefined): boolean {
    if (!min || !max) {
      min = 0;
      max = 100;
    }
    const regexVar: string = '^[0-9]{min,max}$';
    const numRegex: RegExp = new RegExp(regexVar.replace('min', String(min)).replace('max', String(max)));
    if (!numRegex.test(field)) {
      return false;
    }
    return true;
  }

  public stringHipens(field: string): boolean {
    const nameRegex: RegExp = /^(?!.*\s\s)(?!.*--)[a-zA-Z- ]+$/i;
    if (!nameRegex.test(field) || !field) {
      return false;
    }
    return true;
  }

  public postalCode(field: string): boolean {
    const postalCodeRegex: RegExp = /^[a-z0-9-\s]+$/i;
    if (!postalCodeRegex.test(field)) {
      return false;
    }
    return true;
  }

  public password(field: string): boolean {
    const passwordRegex: RegExp = /^[\S]+$/i;
    if (!field || !passwordRegex.test(field) || field.length < 7 || field.length > 15) {
      return false;
    }
    return true;
  }

  public passMatch(field1: string, field2: string): boolean {
    if (!field2) {
      return false;
    } else if (field2 !== field1) {
      return false;
    }
    return true;
  }


}
