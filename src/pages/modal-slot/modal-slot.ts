import {NavController, ViewController, ToastController, Platform} from "ionic-angular";
import {DatePicker} from "ionic-native";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global-service/global-service";

/*
 Generated class for the ModalSlotPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'modal-slot.html'
})
export class ModalSlotPage {

  public slot: any;
  public showedSlot: any;
  public projectTarget: string;
  public themeColor: string;
  public isEmployer: boolean;
  public viewCtrl: any;
  public calendarTheme: number;
  public todayDate;
  public maxDate:any;
  public isAndroid4: boolean;

  constructor(public nav: NavController, gc: GlobalConfigs, viewCtrl: ViewController,
              private globalService: GlobalService, platform: Platform, public toast: ToastController) {

    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();
    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.viewCtrl = viewCtrl;
    this.calendarTheme = config.calendarTheme;
    this.todayDate = new Date().toISOString();
    this.maxDate = new Date (new Date().getFullYear()+10, 12, 31).toISOString();
    this.slot = {
      date: new Date(),
      startHour: 0,
      endHour: 0
    };
    let today = new Date();
    let stringDate = today.getDate() + '/' + today.getMonth() + '/' + today.getFullYear();
    this.showedSlot = {
      date: new Date().toISOString(),
      angular4Date: stringDate,
      startHour: null,
      endHour: null
    };
    this.isAndroid4 = (platform.is('android')) && (platform.version().major < 5);
  }

  /**
   * launching dateTimePicker component for slot selection
   */
  launchDateTimePicker(type:string, flag?:string) {

    DatePicker.show({
      date: new Date(),
      mode: type,
      minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour: true,
      doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
    }).then(
      date => {
        console.log("Got date: ", date);

        switch (flag) {
          case 'start' :
            this.slot.startHour = date.getHours() * 60 + date.getMinutes();
            this.showedSlot.startHour = this.toHourString(this.slot.startHour);
            break;
          case 'end' :
            this.slot.endHour = date.getHours() * 60 + date.getMinutes();
            this.showedSlot.endHour = this.toHourString(this.slot.endHour);
            break;
          default :
            this.slot.date = date.getTime();
            this.showedSlot.date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
            this.showedSlot.angular4Date = this.showedSlot.date;
            break;
        }
      },
      err => console.log("Error occurred while getting date:", err)
    );
  }

  /**
   * @Description : Closing the modal page
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }

  isValidateDisabled() {
    if (!this.showedSlot.startHour || !this.showedSlot.endHour || this.showedSlot.endHour < this.showedSlot.startHour)
      return true;
    return false;
  }

  /**
   * @Description : Validating slot modal
   */
  validateModal() {
    //console.log('Validating '+ this.showedSlot.date + ' or ' + this.showedSlot.angular4Date);
    let stringDate: string = (this.isAndroid4) ?
    this.showedSlot.angular4Date.split('/')[1] +
    '-' + this.showedSlot.angular4Date.split('/')[0] +
    '-' + this.showedSlot.angular4Date.split('/')[2] : "";
    let date = (this.isAndroid4) ? new Date(stringDate) : new Date(this.showedSlot.date);
    //console.log ('sending ' + date);
    this.slot = {
      date: date.getTime(),
      startHour: parseInt(this.showedSlot.startHour.split(':')[0]) * 60 +
      parseInt(this.showedSlot.startHour.split(':')[1]),
      endHour: parseInt(this.showedSlot.endHour.split(':')[0]) * 60 +
      parseInt(this.showedSlot.endHour.split(':')[1]),
    };
    if (this.slot.startHour > this.slot.endHour) {
      let toast = this.toast.create({
        message: "L'heure de début devrait être inférieure à l'heure de fin",
        duration: 5000
      });
      toast.present();
      return;
    }


    console.log(JSON.stringify('JSON returned: ' + this.slot));
    this.viewCtrl.dismiss(this.slot);
  }

  /**
   * @Description Converts a timeStamp to date string :
   * @param date : a timestamp date
   * @param options Date options
   */
  toDateString(date: number) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /*isoToDateString(date:Date) {

   //let date = new Date(this.showedSlot.date);
   let options = {
   formatMatcher: 'day, month year'
   };
   return date.toLocaleDateString('fr-FR');
   }*/


  /**
   * @Description Converts a timeStamp to date string
   * @param time : a timestamp date
   */
  toHourString(time: number) {
    let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
    let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
    return hours + ":" + minutes;
  }

  hoursErrorMessage: string = '';


  checkHour(i) {
    this.hoursErrorMessage = '';
    if (this.showedSlot.startHour && this.showedSlot.endHour && this.showedSlot.startHour >= this.showedSlot.endHour) {
      if (i == 0) {
        this.hoursErrorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
        this.showedSlot.startHour = "";
        return;
      } else {
        this.hoursErrorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
        this.showedSlot.endHour = "";
        return;
      }
    }
    //check if chosen hour and date are passed
    if (this.showedSlot.date && new Date(this.showedSlot.date).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)) {
      let h = new Date().getHours();
      let m = new Date().getMinutes();
      let minutesNow = this.convertHoursToMinutes(h + ':' + m);
      if (i == 0 && this.showedSlot.startHour && this.convertHoursToMinutes(this.showedSlot.startHour) <= minutesNow) {
        this.hoursErrorMessage = "* L'heure de début doit être supérieure à l'heure actuelle";
        this.showedSlot.startHour = "";
        return;
      }
      if (i == 1 && this.showedSlot.endHour && this.convertHoursToMinutes(this.showedSlot.endHour) <= minutesNow) {
        this.hoursErrorMessage = "* L'heure de fin doit être supérieure à l'heure actuelle";
        this.showedSlot.endHour = "";
        return;
      }
    }
  }

  convertHoursToMinutes(hour) {
    if (hour) {
      let hourArray = hour.split(':');
      return hourArray[0] * 60 + parseInt(hourArray[1]);
    }
  }
}
