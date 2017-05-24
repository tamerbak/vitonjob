import {Utils} from "./utils";
import {isUndefined} from "ionic-angular/util/util";

export class DateUtils {

  constructor() {
  }

  public static getAge(birthDate) {
    var ageDifMs = Date.now() - new Date(birthDate).getTime();
    var ageDate = new Date(ageDifMs);
    var age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age;
  }

  public static sqlfy(d) {
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " 00:00:00+00";
  }

  public static toDateString(date) {
    if(Utils.isEmpty(date)){
      return "";
    }
    let d = new Date(date);
    let str = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
    return str;
  }

  public static toHourString(time: number) {
    let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
    let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
    return hours + ":" + minutes;
  }

  /**
   * @description convert time String to minutes
   * @param timeStr 'hh:mm'
   */
  public static timeStrToMinutes(timeStr: string) {
    if (Utils.isEmpty(timeStr) || timeStr.split(':').length == 0) {
      return 0;
    }
    let timeParts = timeStr.split(':');
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);

    let totalMinutes = minutes + hours * 60;
    return totalMinutes;
  }

  public static dateFormat(d) {
    if (!d || isUndefined(d))
      return '';
    let m = d.getMonth() + 1;
    let da = d.getDate();
    let sd = d.getFullYear() + "-" + (m < 10 ? '0' : '') + m + "-" + (da < 10 ? '0' : '') + da;
    return sd;
  }

  public static convertToFormattedHour(value) {
    let hours = Math.floor(value / 60);
    let minutes = value % 60;
    if (!hours && !minutes) {
      return '';
    } else {
      return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
    }
  }

  public static convertToDate(d:string){
     return new Date(d);
  }

}
