import {Page, NavController, ViewController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {DatePicker} from "ionic-native/dist/index";
import {DatePickerOptions} from "ionic-native/dist/plugins/datepicker";

/*
  Generated class for the ModalCalendarPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/modal-calendar/modal-calendar.html',
})
export class ModalCalendarPage {
  constructor(public nav: NavController, gc: GlobalConfigs, viewCtrl: ViewController) {
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
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }

  /**
   * @Description : Validating quality modal
   */
  validateCalendar () {
    this.viewCtrl.dismiss();
  }

  /**
   * @Description : Show date picker component
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
  showDatePicker(type: string) {
    DatePicker.show({
      date: new Date(),
      mode: type,
      minuteInterval: 15, androidTheme: this.calendarTheme //THEME_HOLO_DARK
    }).then(
        date => console.log("Got date: ", date),
        err => console.log("Error occurred while getting date:", err)
    );
  }
}
