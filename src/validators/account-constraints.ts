import {Injectable} from "@angular/core";
import {Utils} from "../utils/utils";
import {DateUtils} from "../utils/date-utils";
import {NumSSConstraints} from "./numss-constraints";
import {GlobalConfigs} from "../configurations/globalConfigs";

@Injectable()
export class AccountConstraints{

  constructor() {
  }

  public static checkName(e, obj) {
    let _name = e.target.value;
    let _isValid: boolean = true;
    let _hint: string = "";

    if (!Utils.isValidName(_name)) {
      _hint = (obj == "lastname" ? "Saisissez un nom valide" : "Saisissez un prénom valide");
      _isValid = false;
    } else {
      _hint = "";
    }
    return {isValid: _isValid, hint: _hint}
  }

  public static checkCompanyName(e) {
    let _name = e.target.value;
    let _isValid: boolean = true;
    let _hint: string = "";

    if (Utils.isEmpty(_name)) {
      _hint = "Veuillez saisir le nom de votre entreprise";
      _isValid = false;
    } else {
      _hint = "";
    }
    return {isValid: _isValid, hint: _hint}
  }

  public static checkSiret(e) {
    let _value = Utils.getRawValueFromMask(e);
    let _isValid: boolean = true;
    let _hint: string = "";

    if (_value.length != 0 && _value.length != 17) {
      _hint = "Saisissez les 14 chiffres du SIRET";
      _isValid = false;
    } else {
      _hint = "";
    }
    return {isValid: _isValid, hint: _hint}
  }

  public static checkApe(e) {
    let _value = Utils.getRawValueFromMask(e);
    let _isValid: boolean = true;
    let _hint: string = "";

    if (_value.length != 5) {
      _hint = "Saisissez les 4 chiffres suivis d'une lettre";
      _isValid = false;
    } else {
      _hint = "";
    }
    return {isValid: _isValid, hint: _hint}
  }

  public static checkBirthDate(e) {
    let _date = e;
    let _isValid: boolean = true;
    let _hint: string = "";

    let _diff = DateUtils.getAge(_date);
    if (_diff < 18) {
      _isValid = false;
      _hint = "* Vous devez avoir plus de 18 ans pour pouvoir valider votre profil";
    } else {
      _hint = "";
    }
    return {isValid: _isValid, hint: _hint}
  }

  public static checkNumss(e, title, birthdate, commune) {
    let _numSS = e.target.value;

    let _isValid: boolean = true;
    let _hint: string = "";

    if (_numSS.length != 0 && _numSS.length != 15) {
      _hint = "Saisissez les 15 chiffres du n° SS";
      _isValid = false;
    }
    else if (_numSS.length == 15) {
      let personalInfoHint = "* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles";
      if (_numSS.length == 15 && !NumSSConstraints.checkGender(_numSS, title)) {
        _hint = personalInfoHint;
        _isValid = false;
      }
      else if (_numSS.length == 15 && !NumSSConstraints.checkBirthYear(_numSS, birthdate)) {
        _hint = personalInfoHint;
        _isValid = false;
      }
      else if (_numSS.length == 15 && !NumSSConstraints.checkBirthMonth(_numSS, birthdate)) {
        _hint = personalInfoHint;
        _isValid = false;
      }
      else if (_numSS.length == 15 && !NumSSConstraints.checkINSEE(_numSS, commune)) {
        _hint = personalInfoHint;
        _isValid = false;
      }
      else if (_numSS.length == 15 && !NumSSConstraints.checkModKey(_numSS)) {
        _hint = personalInfoHint;
        _isValid = false;
      } else {
        _hint = "";
      }
    } else {
      _hint = "";
    }
    return {isValid: _isValid, hint: _hint}
  }

  public static checkOfficialDocument(e){
    var _docId = e.target.value;
    var _docIdLenght = 12;

    let _isValid: boolean = true;
    let _hint: string = "";

    // Check if strict cni mode is activated, if true, the 13th number is required
    if (GlobalConfigs.global['strict-cni']) {
      _docIdLenght = 13;
    }

    if (_docId.length != 0 && _docId.length != 9 && _docId.length != _docIdLenght) {
      _hint = "Saisissez les " + _docIdLenght + " chiffres de votre CNI ou les 9 chiffres et caractères de votre passeport";
      _isValid = false;
    }

    // If strict cni mode is activated, control valid CNI
    if ((GlobalConfigs.global['strict-cni'] == true) && (_docId.length == _docIdLenght)) {
      if (this.IsOfficialCni(
          _docId.substr(0, 12), // The 12 first numbers
          _docId.substr(12, 1) // The 13th number, the key
        ) === false) {
        _hint = "Le numéro de votre carte d'identité est erroné : veuillez le vérifier.";
        _isValid = false;
      }
    }
    return {isValid: _isValid, hint: _hint}
  }

  /**
   * Controls the national identity card number
   *
   * @param number: 1-12 numbers
   * @param key: 13 number
   * @returns {boolean}
   */
  private static IsOfficialCni(number, key) {
    let _factors = [7, 3, 1];
    let _result = 0;
    let _offset = 0;

    for (var char of number) {
      if (char == '<') {
        char = 0;
      }
      else if (RegExp('[a-z]').test(char)) {
        char = char.charCodeAt(0) - 55;
      }
      else if (RegExp('[0-9]').test(char)) {
        char = Number(char);
      }
      else {
        return false;
      }
      _result += char * _factors[_offset % 3];
      _offset++;
    }
    return ((_result % 10) == key);
  }
}