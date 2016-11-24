import {Injectable} from "@angular/core";


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

  public static decimalAdjust(type, value, exp) {
    // Si la valeur de exp n'est pas définie ou vaut zéro...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si la valeur n'est pas un nombre
    // ou si exp n'est pas un entier...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Décalage
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Décalage inversé
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }
}