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

  public static sqlfyWithHours(d: Date) {
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":00+00";
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

  public static simpleDateFormat(d: Date) {
    if (Utils.isEmpty(d)) {
      return '';
    }
    let m = d.getMonth() + 1;
    let da = d.getDate();
    let sd = (da < 10 ? '0' : '') + da + '/' + (m < 10 ? '0' : '') + m + "/" + d.getFullYear();
    return sd
  }

  public static isDateValid(d: Date){
    if(Utils.isEmpty(d) || isNaN(d.getTime())){
      return false;
    }else{
      return true;
    }
  }

  //t = "10:45"
  public static isTimeValid(t: string){
    if(Utils.isEmpty(t) || t.split(":").length != 2){
      return false;
    }else{
      return true;
    }
  }

  public static getFormattedHourFromDate(date: Date) {
    if (Utils.isEmpty(date)) {
      return "--:--";
    }
    let h = date.getHours();
    let m = date.getMinutes();
    return h + ":" + (m < 10 ? ('0' + m) : m);
  }

  public static convertToFormattedDateHour(d: Date){
    if(!this.isDateValid(d)){
      return "";
    }

    let sd = this.simpleDateFormat(d);
    let hm = this.getFormattedHourFromDate(d);
    return sd + " à " + hm;
  }
}
