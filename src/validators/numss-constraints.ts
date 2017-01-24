export class NumSSConstraints {

  constructor() {
  }

  public static checkGender(num: string, title: string) {
    let indicator = num.charAt(0);
    if ((indicator === '1' && title === 'M.') || (indicator === '2' && title !== 'M.')) {

      return true;
    } else {

      return false;
    }
  }

  public static checkBirthYear(num: string, date: any) {
    if (date == null) {
      return false
    }
    let indicator = num.charAt(1) + num.charAt(2);

    var birthYear = "" + date.getFullYear()
    birthYear = birthYear.substring(2);

    if (indicator == birthYear)
      return true;
    else
      return false;
  }

  public static checkBirthMonth(num: string, date: any) {
    if (!date) {
      return false
    }
    let indicator = num.charAt(3) + num.charAt(4);

    let birthMonth = 1 + date.getMonth() + ""

    if (birthMonth.length == 1)
      birthMonth = "0" + birthMonth;

    if (indicator == birthMonth)
      return true;
    else
      return false;
  }

  public static checkINSEE(num: string, communeObj: any) {
    let indicator = num.substring(5, 10);

    if (communeObj.id != '0') {
      if (indicator != communeObj.code_insee)
        return false;
      else
        return true;
    }

    if (indicator.charAt(0) != '9')
      return false;
    else
      return true;
  }

  public static checkModKey(num: string) {
    try {
      let indicator = num.substr(0, 13);
      let key = num.substr(13);
      let number = parseInt(indicator);
      let nkey = parseInt(key);
      let modulo = number % 97;
      if (nkey == 97 - modulo)
        return true;
      else
        return false;
    }
    catch (err) {
      return false;
    }
  }
}