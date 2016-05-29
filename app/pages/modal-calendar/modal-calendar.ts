import {Page, NavController, ViewController, Alert} from 'ionic-angular';
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

    slots:Array<{
        'class' : "com.vitonjob.callouts.auth.model.CalendarData",
        idCalendar : number,
        type : string,
        date:number,
        startHour:number,
        endHour:number
    }>;

    dateOptions: DatePickerOptions;
    timeOptions: DatePickerOptions;

    constructor(public nav:NavController, gc:GlobalConfigs, viewCtrl:ViewController) {
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
        this.nav = nav;

        this.slots = [{
            'class' : "com.vitonjob.callouts.auth.model.CalendarData",
            idCalendar : 0,
            date: Date.now(),
            startHour: 630,
            endHour: 1260,
            type : "regular"
        }];
        this.dateOptions = {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric"//, hour: "2-digit", minute: "2-digit"
        };

        this.timeOptions = {
            hour: "2-digit", minute: "2-digit"
        };
    }

    /**
     * @Description : Closing the modal page :
     */
    closeModal() {
        this.viewCtrl.dismiss(this.slots);
    }

    /**
     * @Description : Validating quality modal
     */
    validateCalendar() {
        this.viewCtrl.dismiss(this.slots);
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
    showDatePicker(type:string) {

        let firstPartDate: any;

        DatePicker.show({
            date: new Date(),
            mode: type,
            minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour:true
        }).then(
            date => {
                console.log("Got date: ", date);
                firstPartDate = {
                    date: date.getMilliseconds(),
                    startHour: date.getHours() * 60 + date.getMinutes(),//date.toLocaleString('fr-FR', this.timeOptions),
                    endHour: 0};
                DatePicker.show({
                    date: new Date(),
                    mode: 'time',
                    minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour:true
                }).then(
                    (date) => {
                        console.log("Got date: ", date);
                        //TODO: Control date value before adding theme.
                        this.slots.push({
                            'class' : 'com.vitonjob.callouts.auth.model.CalendarData',
                            date: firstPartDate.date.getMilliseconds(),
                            startHour: firstPartDate.startHour,
                            endHour: date.getHours() * 60 + date.getMinutes()})
                    },
                    err => console.log("Error occurred while getting date:", err)
                );
            },
            err => console.log("Error occurred while getting date:", err)
        );
    }

    /**
     * @Author : Tamer
     * @Description : Removing a slot from list
     * @param item to be removed
     */
    removeSlot(item){
        //debugger;

        let confirm = Alert.create({
            title: 'Etes vous sûr?',
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
                        this.slots.splice(this.slots.indexOf(item),1);
                    }
                }
            ]
        });
        this.nav.present(confirm);
    }

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date
     * @param options Date options
     */
    toDateString(date:number, options: any) {
        return new Date(date).toLocaleDateString('fr-FR', options);
    }


    /**
     * @Description Converts a timeStamp to date string
     * @param time : a timestamp date
     */
    toHourString(time:number) {
        let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
        let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
        return hours + ":" + minutes;
    }


}
