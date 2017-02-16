import {NavController, ViewController, ToastController, Platform ,NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global-service/global-service";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Utils} from "../../utils/utils";
import {CalendarSlot} from "../../dto/calendar-slot";

/*
 Generated class for the ModalSlotPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'modal-slot.html',
    selector: 'modal-slot'
})
export class ModalSlotPage {

    public slot: any;
    public slots: CalendarSlot[];
    public showedSlot: any;
    public projectTarget: string;
    public themeColor: string;
    public isEmployer: boolean;
    public viewCtrl: any;
    public calendarTheme: number;
    public todayDate;
    public maxDate: any;
    public isAndroid4: boolean;
    public monthesList = [];
    public daysList = [];
    public yearValue: number;
    public monthValue: number;
    public currentYear: boolean = true;
    public nextYear: boolean = false;
    public isNextYearChecked: boolean = false;
    public maxStartDate: any;
    public minStartDate: any;
    public maxEndDate: any;
    public minEndDate: any;
    public currentMonth: any;
    public intervalHours:number = 10;
    public params: NavParams;


    constructor(public nav: NavController,
                gc: GlobalConfigs,
                viewCtrl: ViewController,
                params: NavParams,
                private offersService:OffersService,
                private globalService: GlobalService,
                platform: Platform,
                public toast: ToastController) {

        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.viewCtrl = viewCtrl;
        this.calendarTheme = config.calendarTheme;
        this.todayDate = new Date();
        this.yearValue = new Date().getFullYear();
        this.monthValue = new Date().getMonth() + 1;
        this.slots = params.get('slots');
        //let dayValue: number = new Date().getDay();
        //max date should be the day of tomorrow
        this.maxDate = new Date().setDate(new Date().getDate() + 1);
        this.minStartDate = new Date(this.todayDate.setUTCHours(this.todayDate.getUTCHours() + 1)).toISOString();
        this.maxStartDate = new Date(this.maxDate).toISOString();
        this.minEndDate = new Date(this.todayDate.setUTCHours(this.todayDate.getUTCHours(), this.todayDate.getUTCMinutes() + 15)).toISOString();
        this.maxEndDate = new Date(this.todayDate.setDate(this.todayDate.getDate() + 1)).toISOString();
        this.monthesList = [
            {
                value: "01",
                shortName: "Jan",
                fullName: "Janvier",
                disabled: !(this.monthValue <= 1),
                checked: (this.monthValue === 1),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "02",
                shortName: "Fév",
                fullName: "Février",
                disabled: !(this.monthValue <= 2),
                checked: (this.monthValue === 2),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "03",
                shortName: "Mars",
                fullName: "Mars",
                disabled: !(this.monthValue <= 3),
                checked: (this.monthValue === 3),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "04",
                shortName: "Avr",
                fullName: "Avril",
                disabled: !(this.monthValue <= 4),
                checked: (this.monthValue === 4),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "05",
                shortName: "Mai",
                fullName: "Mai",
                disabled: !(this.monthValue <= 5),
                checked: (this.monthValue === 5),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "06",
                shortName: "Juin",
                fullName: "Juin",
                disabled: !(this.monthValue <= 6),
                checked: (this.monthValue === 6),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "07",
                shortName: "Juil",
                fullName: "Juillet",
                disabled: !(this.monthValue <= 7),
                checked: (this.monthValue === 7),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "08",
                shortName: "Août",
                fullName: "Août",
                disabled: !(this.monthValue <= 8),
                checked: (this.monthValue === 8),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "09",
                shortName: "Sep",
                fullName: "Septembre",
                disabled: !(this.monthValue <= 9),
                checked: (this.monthValue === 9),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "10",
                shortName: "Oct",
                fullName: "Octobre",
                disabled: !(this.monthValue <= 10),
                checked: (this.monthValue === 10),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "11",
                shortName: "Nov",
                fullName: "Novembre",
                disabled: !(this.monthValue <= 11),
                checked: (this.monthValue === 11),
                year: this.yearValue,
                color: "light"
            },
            {
                value: "12",
                shortName: "Déc",
                fullName: "Décembre",
                disabled: !(this.monthValue <= 12),
                checked: (this.monthValue === 12),
                year: this.yearValue,
                color: "light"
            }
        ];

        this.currentMonth = this.monthesList.filter(mo => {
            return mo.checked;
        })[0];
        this.daysList = this.getDaysArray();
        /*[
         {value: "01", shortName: "Lun", fullName: "Lundi", checked: (dayValue == 1), color: "lightgrey"},
         {value: "02", shortName: "Mar", fullName: "Mardi", checked: (dayValue == 2), color: "lightgrey"},
         {value: "03", shortName: "Mer", fullName: "Mercredi", checked: (dayValue == 3), color: "lightgrey"},
         {value: "04", shortName: "Jeu", fullName: "Jeudi", checked: (dayValue == 4), color: "lightgrey"},
         {value: "05", shortName: "Ven", fullName: "Vendredi", checked: (dayValue == 5), color: "lightgrey"},
         {value: "06", shortName: "Sam", fullName: "Samedi", checked: (dayValue == 6), color: "lightgrey"},
         {value: "07", shortName: "Dim", fullName: "Dimanche", checked: (dayValue == 7), color: "lightgrey"}
         ];*/
        //initialize slot object
        /*this.slot.date = new Date();
        this.slot.dateEnd = new Date();
        this.slot.startHour = 0;
        this.slot.endHour = 0;*/
        this.slot = {
            date: new Date(),
            dateEnd: new Date(),
            startHour: 0,
            endHour: 0
        };

        let today = new Date();
        let stringDate = today.getDate() + '/' + today.getMonth() + '/' + today.getFullYear();
        this.showedSlot = {
            date: new Date().toISOString(),
            startDate: this.minStartDate,
            endDate: this.minEndDate,
            angular4Date: stringDate,
            startHour: null,
            endHour: null,
            annual: false,
            monthly: false,
            weekly: false
        };
        this.isAndroid4 = (platform.is('android')) && (platform.version().major < 5);
    }

    /***
     * description: action on months button click
     * @param month
     */
    monthClicked(month) {
        if (month.checked)
            return;
        else if (this.monthesList.filter(mo => {
                return mo.checked
            }).length > 0)
            this.monthesList.filter(mo => {
                return mo.checked
            })[0].checked = false;
        month.checked = !month.checked;
        this.currentMonth = month;
        let startYear = month.year;
        let startMonth = Number(this.monthesList.filter(mo => {
                return mo.checked
            })[0].value) - 1;
        this.minStartDate = new Date(this.todayDate.setUTCFullYear(startYear)).toISOString();
        this.minStartDate = new Date(new Date(this.minStartDate).setUTCMonth(startMonth)).toISOString();
        this.minStartDate = new Date(new Date(this.minStartDate).setUTCDate(1)).toISOString();
        this.maxDate = new Date(this.minStartDate).setDate(new Date(this.minStartDate).getDate() + 1);
        this.maxStartDate = new Date(this.maxDate).toISOString();
        this.showedSlot.startDate = this.minStartDate;
        if (this.monthValue === Number(month.value))
            this.daysList = this.getDaysArray();
        else
            this.daysList = this.getDaysArray(this.showedSlot.startDate);

        this.checkHour(0);
    }

    dayClicked(day) {
        if (day.checked)
            return;
        else if (this.daysList.filter(da => {
                return da.checked
            }).length > 0)
            this.daysList.filter(da => {
                return da.checked
            })[0].checked = false;
        day.checked = !day.checked;
        let startYear = this.currentMonth.year;
        let startMonth = this.currentMonth.value - 1;
        let startDay = Number(this.daysList.filter(da => {
            return da.checked
        })[0].value);
        this.minStartDate = new Date(this.todayDate.setUTCFullYear(startYear)).toISOString();
        this.minStartDate = new Date(new Date(this.minStartDate).setUTCMonth(startMonth)).toISOString();
        this.minStartDate = new Date(new Date(this.minStartDate).setUTCDate(startDay)).toISOString();
        this.maxDate = new Date(this.minStartDate).setDate(new Date(this.minStartDate).getDate() + 1);
        this.maxStartDate = new Date(this.maxDate).toISOString();

        this.showedSlot.startDate = this.minStartDate;
        this.checkHour(0);
    }

    yearClicked() {
        let newMonthesList = [
            {
                value: "01",
                shortName: "Jan",
                fullName: "Janvier",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "02",
                shortName: "Fév",
                fullName: "Février",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "03",
                shortName: "Mars",
                fullName: "Mars",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "04",
                shortName: "Avr",
                fullName: "Avril",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "05",
                shortName: "Mai",
                fullName: "Mai",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "06",
                shortName: "Juin",
                fullName: "Juin",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "07",
                shortName: "Juil",
                fullName: "Juillet",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "08",
                shortName: "Août",
                fullName: "Août",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "09",
                shortName: "Sep",
                fullName: "Septembre",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "10",
                shortName: "Oct",
                fullName: "Octobre",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "11",
                shortName: "Nov",
                fullName: "Novembre",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            },
            {
                value: "12",
                shortName: "Déc",
                fullName: "Décembre",
                disabled: false,
                checked: false,
                year: (this.yearValue + 1),
                color: "light"
            }
        ];
        if (this.nextYear) {
            this.isNextYearChecked = true;
            // 2016? 2017
            if (this.currentYear) {
                // 2016 2017
                for (let i = 0; i < this.monthesList.length; i++) {
                    if (Number(this.monthesList[i].value) < this.monthValue) {
                        this.monthesList[i].disabled = true;
                        this.monthesList[i].checked = false;
                    } else {
                        this.monthesList[i].year = this.yearValue;

                    }
                }
                this.monthesList = this.monthesList.concat(newMonthesList);
            } else {
                // - 2017
                this.monthesList = JSON.parse(JSON.stringify(newMonthesList))
            }
        }
        else {
            // 2016? -
            this.isNextYearChecked = false;
            if (this.currentYear) {
                // 2016 -
                this.monthesList = this.monthesList.slice(0, 12);
                for (let i = 0; i < this.monthesList.length; i++)
                    if (Number(this.monthesList[i].value) < this.monthValue) {
                        this.monthesList[i].disabled = true;
                        this.monthesList[i].checked = false;
                    } else {
                        this.monthesList[i].disabled = false;
                        this.monthesList[i].checked = false;
                    }
            } else {
                // - -
                this.currentYear = true;

            }
        }

    }

    getDaysArray(date?) {
        let numDaysInMonth, daysInWeek, daysIndex, index, i, l, daysArray, shortDaysInWeek, dateValue;
        numDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        daysInWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        shortDaysInWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        daysIndex = {'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6};

        daysArray = [];

        if (date) {
            dateValue = new Date(date).getDate();
            index = daysIndex[(new Date(date)).toString().split(' ')[0]];
            l = numDaysInMonth[new Date(date).getUTCMonth()];

            for (i = dateValue; i < l + 1; i++) {

                let element = {
                    value: i,
                    shortName: shortDaysInWeek[index],
                    fullName: daysInWeek[index],
                    checked: (dateValue === i),
                    color: "lightgrey"
                };
                index++;
                daysArray.push(element);
                if (index === 7) index = 0;
            }

            return daysArray;
        } else {
            dateValue = new Date().getDate();
            index = daysIndex[(new Date()).toString().split(' ')[0]];
            l = numDaysInMonth[this.monthValue - 1];

            for (i = dateValue; i < l + 1; i++) {

                let element = {
                    value: i,
                    shortName: shortDaysInWeek[index],
                    fullName: daysInWeek[index],
                    checked: (dateValue === i),
                    color: "lightgrey"
                };
                index++;
                daysArray.push(element);
                if (index === 7) index = 0;
            }

            return daysArray;
        }
    }

    /**
     * @Description : Closing the modal page
     */
    closeModal() {
        this.viewCtrl.dismiss();
    }

    isValidateDisabled() {
        if (Utils.isEmpty(this.showedSlot.startDate) || Utils.isEmpty(this.showedSlot.endDate)) {
            return true;
        }
        return false;
    }

    /**
     * @Description : Validating slot modal
     */
    validateModal() {
        let date = new Date(this.showedSlot.startDate);
        let dateEnd = new Date(this.showedSlot.endDate);
        let sh = this.showedSlot.startDate.split('T')[1];
        let eh = this.showedSlot.endDate.split('T')[1];
        this.slot.date = date.getTime();
        this.slot.dateEnd = dateEnd.getTime();
        this.slot.startHour = parseInt(sh.split(':')[0]) * 60 +
          parseInt(sh.split(':')[1]);
        this.slot.endHour = parseInt(eh.split(':')[0]) * 60 +
            parseInt(eh.split(':')[1]);
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

        if (i === 0) {
            this.minEndDate = new Date(new Date(this.showedSlot.startDate).setUTCHours(new Date(this.showedSlot.startDate).getUTCHours(), new Date(this.showedSlot.startDate).getUTCMinutes() + 15)).toISOString();
            this.maxEndDate = new Date(new Date(this.showedSlot.startDate).setUTCHours(new Date(this.showedSlot.startDate).getUTCHours() + 10)).toISOString();
            this.showedSlot.endDate = this.minEndDate;
            if (this.daysList.filter(da => {
                    return da.checked
                }).length > 0) {
                this.daysList.filter(da => {
                    return da.checked
                })[0].checked = false;
            }
            if (this.daysList.filter(da => {
                    return da.value === new Date(this.showedSlot.startDate).getDate()
                }).length > 0) {
                this.daysList.filter(da => {
                    return da.value === new Date(this.showedSlot.startDate).getDate()
                })[0].checked = true;
            }

            this.showedSlot.startHour = new Date(this.showedSlot.startDate).getUTCHours();
        } else if (i === 1) {
            this.showedSlot.endHour = new Date(this.showedSlot.endHour).getUTCHours();
        }

        //check if dates and hours are coherent
        if (new Date(this.showedSlot.startDate) && new Date(this.showedSlot.endDate) && new Date(this.showedSlot.startDate) >= new Date(this.showedSlot.endDate)) {
            if (i == 0) {
                this.hoursErrorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
                this.showedSlot.startHour = "";
                return;
            } else {
                this.hoursErrorMessage = "* L'heure de fin doit être supérieure à l'heure de début";
                this.showedSlot.endHour = "";
                return;
            }
        }
        
        //check if chosen hour and date are passed
        if (i == 0 && this.showedSlot.startDate && new Date(this.showedSlot.startDate) <= new Date()) {
            this.hoursErrorMessage = "* L'heure de début doit être supérieure à l'heure actuelle";
            this.showedSlot.startDate = "";
            return;
        }
        if (i == 1 && this.showedSlot.endDate && new Date(this.showedSlot.endDate) <= new Date()) {
            this.hoursErrorMessage = "* L'heure de fin doit être supérieure à l'heure actuelle";
            this.showedSlot.endDate = "";
            return;
        }
      if (this.projectTarget == 'employer') {
        //total hours of one day should be lower than 10h
        let isDailyDurationRespected = this.offersService.isDailySlotsDurationRespected(this.slots, this.showedSlot);
        if (!isDailyDurationRespected) {
          this.hoursErrorMessage = "* Le total des heures de travail de chaque journée ne doit pas dépasser les 10 heures";
          this.showedSlot.endDate = "";
          return false;
        }

        // if (!this.offersService.isSlotRespectsBreaktime(this.slots, this.showedSlot)) {
        //   this.hoursErrorMessage = "Veuillez mettre un délai de 11h entre deux créneaux situés sur deux jours calendaires différents";
        //   return false;
        // }
      }
        
    }

    convertHoursToMinutes(hour) {
        if (hour) {
            let hourArray = hour.split(':');
            return hourArray[0] * 60 + parseInt(hourArray[1]);
        }
    }

    /**
     * Periodicity change
     */
    periodicityClicked(type: number) {
        switch (type) {

        }

    }
}
