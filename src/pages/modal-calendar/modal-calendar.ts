import {NavController, ViewController, AlertController, ModalController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalSlotPage} from "../modal-slot/modal-slot";
import {Component} from "@angular/core";

/*
 Generated class for the ModalCalendarPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'modal-calendar.html'
})
export class ModalCalendarPage {

  public slots: Array<{
    'class': "com.vitonjob.callouts.auth.model.CalendarData",
    idCalendar: number,
    type: string,
    date: number,
    dateEnd: number,
    startHour: number,
    endHour: number
  }>;

  public isObsolete = false;
  public obj: string;
  public projectTarget: string;
  public themeColor: string;
  public viewCtrl: any;
  public isEmployer: boolean;
  public calendarTheme: number;

  constructor(public nav: NavController, gc: GlobalConfigs, viewCtrl: ViewController,
              public navParams: NavParams, public alert: AlertController, public modal: ModalController) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.viewCtrl = viewCtrl;
    this.calendarTheme = config.calendarTheme;
    this.obj = this.navParams.get("obj");
    this.slots = this.navParams.get("slots");
    if (!this.slots) {
      this.slots = [];
    }


    this.verifySlotsValidity();
    if (this.isObsolete) {

    }
  }

  /**
   * @Description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss({slots: null, isObsolete: this.isObsolete});
  }

  /**
   * @Description : Validating quality modal
   */
  validateCalendar() {
    this.viewCtrl.dismiss({slots: this.slots, isObsolete: this.isObsolete});
  }

  verifySlotsValidity() {
    //verify if slots are obsolete
    this.isObsolete = false;
    for ( let i = 0; i < this.slots.length; i++) {
      let slotDate = this.slots[i].date;
      let startH = this.convertToFormattedHour(this.slots[i].startHour);
      slotDate = new Date(slotDate).setHours(Number(startH.toString().split(':')[0]), Number(startH.toString().split(':')[1]));
      let dateNow = new Date().getTime();
      if (slotDate < dateNow) {
        this.isObsolete = true;
        return;
      } else {
        this.isObsolete = false;
      }
    }
  }

  /**
   * @Description : Show date picker component
   *
   * @Params : Type of datepicker : date/dateTime/time
   *
   * @ThemeOptions :
   * THEME_TRADITIONAL          : 1, // default
   * THEME_HOLO_DARK            : 2,
   * THEME_HOLO_LIGHT           : 3,
   * THEME_DEVICE_DEFAULT_DARK  : 4, **
   * THEME_DEVICE_DEFAULT_LIGHT : 5, **
   * Theme_Material_Dialog_Alert : 6,
   * Theme_Material_Dialog_Alert : 7,
   * Theme_Material_Light_Dialog_Alert : 8,
   * Theme_DeviceDefault_Dialog_Alert : 9,
   * Theme_DeviceDefault_Light_Dialog_Alert : 10
   */
  showSlotModal() {
    let slotModel = this.modal.create(ModalSlotPage);
    slotModel.onDidDismiss(slotData => {
      //TODO: Control date value before adding them.
      if (slotData) {
        this.slots.push({
          'class': 'com.vitonjob.callouts.auth.model.CalendarData',
          idCalendar: 0,
          type: "",
          date: slotData.date,
          dateEnd: slotData.dateEnd,
          startHour: slotData.startHour,
          endHour: slotData.endHour
        });
      }
    });
    slotModel.present();
  }

  /**
   * @Author : Tamer
   * @Description : Removing a slot from list
   * @param item to be removed
   */
  removeSlot(item) {
    let confirm = this.alert.create({
      title: 'Êtes-vous sûr?',
      message: 'Voulez-vous supprimer ce créneau?',
      buttons: [
        {
          text: 'Non',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            console.log('Agree clicked');
            this.slots.splice(this.slots.indexOf(item), 1);
            this.verifySlotsValidity();
          }
        }
      ]
    });

    confirm.present();
  }

  isDeleteSlotDisabled() {
    return (this.obj != "add" && this.slots && this.slots.length == 1);
  }

  /**
   * @Description Converts a timeStamp to date string :
   * @param date : a timestamp date
   * @param options Date options
   */
  toDateString(date: number, options: any) {
    options = (options) ? options : '';
    //console.log(JSON.stringify(this.slots));
    //console.log('Calendar slot in ms: ' + date);
    //console.log('Calendar slot in date format: ' + new Date(date));
    let d = new Date(date);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  }


  /**
   * @Description Converts a timeStamp to date string
   * @param time : a timestamp date
   */
  toHourString(time: number) {
    let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
    let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
    return hours + ":" + minutes;
  }

  convertToFormattedHour(value) {
    let hours = Math.floor(value / 60);
    let minutes = value % 60;
    if (!hours && !minutes) {
      return '';
    } else {
      return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
    }
  }

  convertHoursToMinutes(hour) {
    if (hour) {
      let hourArray = hour.split(':');
      return hourArray[0] * 60 + parseInt(hourArray[1]);
    }
  }
}
