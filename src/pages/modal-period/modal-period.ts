import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

@Component({
    selector: 'page-modal-period',
    templateUrl: 'modal-period.html'
})
export class ModalPeriodPage {

    public period: {startDate: string, endDate: string};
    public projectTarget: string;
    public themeColor: string;
    public errorMessage: string;
    public limit: {startDate: {min: string, max: string}, endDate: {min: string, max: string}};

    constructor(public navCtrl: NavController, public navParams: NavParams, gc: GlobalConfigs) {

        let today:Date = new Date();
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.errorMessage = "";
        this.period = {startDate: today.toISOString(), endDate: today.toISOString()};
        let minDate:string = today.toISOString();
        let maxDate:string = new Date(today.setUTCFullYear(today.getFullYear()+2)).toISOString();
        this.limit = {startDate: {min: minDate, max: maxDate}, endDate: {min: minDate, max: maxDate}};
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ModalPeriodPage');
    }

    checkDate(i:number) {
            this.errorMessage = '';

            /*if (i === 0) {
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
            }*/

            //check if dates and hours are coherent
            if (new Date(this.period.startDate) && new Date(this.period.endDate) && new Date(this.period.startDate) >= new Date(this.period.endDate)) {
                if (i == 0) {
                    this.errorMessage = "* La date de début doit être inférieure à la date de fin";
                    return;
                } else {
                    this.errorMessage = "* La date de fin doit être supérieure à la date de début";
                    return;
                }
            }

            //check if chosen hour and date are passed
            if (i == 0 && this.period.startDate && new Date(this.period.startDate) <= new Date()) {
                this.errorMessage = "* La date de début doit être supérieure à la date actuelle";
                this.period.startDate = "";
                return;
            }
            if (i == 1 && this.period.endDate && new Date(this.period.endDate) <= new Date()) {
                this.errorMessage = "* La date de fin doit être supérieure à la date actuelle";
                this.period.endDate = "";
                return;
            }

    }
}
