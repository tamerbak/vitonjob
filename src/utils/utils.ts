import {Injectable} from "@angular/core";
import {isUndefined} from "ionic-angular/util/util";


@Injectable()
export class Utils {

  constructor() {
  }

  public static isValidName(name: string): boolean {
    var regEx = /^[A-Za-zÀ-ú.' \-\p{L}\p{Zs}\p{Lu}\p{Ll}']+$/;
    return regEx.test(name);
  }

  public static isValidIBAN(str: string): boolean {
    let CODE_LENGTHS = {
      AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
      CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
      FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
      HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
      LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
      MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
      RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
    };
    let iban = String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
    let code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/);
    let digits;

    // check syntax and length
    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
      return false;
    }
    // rearrange country code and check digits, and convert chars to ints
    digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter:string) {
      return String(letter.charCodeAt(0) - 55);
    });
    // final check
    return Utils.mod97(digits);
  }

  public static isValidBIC(str: string): boolean {
    var regSWIFT = /^([a-zA-Z]){4}([a-zA-Z]){2}([0-9a-zA-Z]){2}([0-9a-zA-Z]{3})?$/;;
    return regSWIFT.test(str);
  }

  private static mod97(string) {
    let checksum = string.slice(0, 2), fragment;
    for (let offset = 2; offset < string.length; offset += 7) {
      fragment = String(checksum) + string.substring(offset, offset + 7);
      checksum = parseInt(fragment, 10) % 97;
    }
    return checksum;
  }

  public static getRawValueFromMask(e){
    let _regex = new RegExp('_', 'g');
    let _rawvalue = e.target.value.replace(_regex, '');

    return (_rawvalue === '' ? '' : _rawvalue).trim();
  }

  public static isEmpty(str) {
    if (str == '' || str == 'null' || !str)
    return true;
    else
    return false;
  }

  public static isNumber(char){
    let re = /^(0|[1-9][0-9]*)$/;
    return re.test(char);
  }

  public static formatSIREN(siren){
    let s1 = siren.substr(0, 3);
    let s2 = siren.substr(3, 3);
    let s3 = siren.substr(6, 3);
    return s1 + " " + s2 + " " + s3 + " ";
  }

  public static preventNull(str){
    if(this.isEmpty(str)){
      return "";
    }else{
      return str;
    }
  }

  public static preventNullProperties(obj){
    for (let key in obj) {
      let o = obj[key];
      if(Utils.isEmpty(o)){
        obj[key] = "";
      }
    }
    return obj;
  }

  public static sqlfyText(txt) {
    if (!txt || txt.length == 0)
      return "";
    return txt.replace(/'/g, "''");
  }

  public static inverseSqlfyText(txt) {
    if (!txt || txt.length == 0)
      return "";
    return txt.replace(/''/g, "'");
  }

  public static checkMail(email : string){
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
  }

  public static checkPhone(phone : string){
    let re = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    return re.test(phone);
  }

  public static cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  public static parseNumber(str) {
    try {
      return parseFloat(str);
    }
    catch (err) {
      return 0.0;
    }
  }

  public static isValidUrl(u){
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(u);
  }

  //arrondi à la décimal suéprieur : 2.12 => 2.2
  public static ceil(value, decimals) {
    return Number(Math.ceil(+(value+'e'+decimals))+'e-'+decimals);
  }

  //arrondi à la décimal inférieur : 2.12 => 2.1, 2.15 =>2.2
  public static round(value, decimals) {
    return Number(Math.round(+(value+'e'+decimals))+'e-'+decimals);
  }

  public static isNumeric(n) {
    let numbers = /^[0-9]+$/;
    if (n.match(numbers)) {
      return true;
    }
    else {
      return false;
    }
  }

  public static isLetter(s) {
    let letters = /^[A-Za-z]+$/;
    if (s.match(letters)) {
      return true;
    }
    else {
      return false;
    }
  }

  public static upperCase(str) {
    if (this.isEmpty(str))
      return '';
    return str.toUpperCase();
  }

}
