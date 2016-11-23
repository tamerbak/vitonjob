import {NavController, ViewController, Alert, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";

@Component({
    templateUrl: 'build/pages/profile-slots/profile-slots.html',
})
export class ProfileSlotsPage {

    showedSlot: any;
    private projectTarget: string;
    private themeColor: string;
    private viewCtrl: any;
    private nav: any;
    errorMessage: string = '';
    slots = [];
    params: NavParams;

    constructor(public nav: NavController, gc: GlobalConfigs, viewCtrl: ViewController, params: NavParams) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.viewCtrl = viewCtrl;
        this.nav = nav;

        this.showedSlot = {
            startDate: null,
            endDate: null,
            startHour: null,
            endHour: null
        };
        //load saved slots
        if(params.get('savedSlots') && params.get('savedSlots').length > 0){
            for(let i = 0; i < params.get('savedSlots').length; i++) {
                let s = params.get('savedSlots')[i];
                let slot = {
                    startDate: s.date_de_debut,
                    endDate: s.date_de_fin,
                    startHour: s.heure_de_debut,
                    endHour: s.heure_de_fin
                };
                this.slots.push(slot);
            }
        }
    }

    addSlot(){
        if(!this.isSlotValid()){
            return;
        }

        let startDate = new Date(this.showedSlot.startDate);
        let endDate = new Date(this.showedSlot.endDate);
        let slot = {
            startDate: startDate.getTime(),
            endDate: endDate.getTime(),
            startHour: parseInt(this.showedSlot.startHour.split(':')[0]) * 60 +
            parseInt(this.showedSlot.startHour.split(':')[1]),
            endHour: parseInt(this.showedSlot.endHour.split(':')[0]) * 60 +
            parseInt(this.showedSlot.endHour.split(':')[1]),
        };

        this.slots.push(slot);
    }

    removeSlot(item){
        let confirm = Alert.create({
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
                    }
                }
            ]
        });

        this.nav.present(confirm);
    }

    isSlotValid() {
        this.errorMessage = '';

        if (!this.showedSlot.startHour || !this.showedSlot.endHour || !this.showedSlot.startDate || !this.showedSlot.endDate)
        return false;

        let purStartDate = new Date(this.showedSlot.startDate).setHours(0, 0, 0, 0);
        let purEndDate = new Date(this.showedSlot.endDate).setHours(0, 0, 0, 0);
        let purToday = new Date().setHours(0, 0, 0, 0);

        //check if chosen dates are lower than today
        if (purStartDate < purToday || purEndDate < purToday){
            this.errorMessage = "* Les dates de début et de fin de disponibilités doivent être supérieures à la date du jour";
            return false;
        }

        //check if chosen dates are lower than today
        if (purStartDate > purEndDate){
            this.errorMessage = "* La date de début doit être inférieure à la date de fin de disponibilité";
            return false;
        }

        if (purStartDate == purEndDate) {
            if(this.showedSlot.startHour >= this.showedSlot.endHour){
                this.errorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
                return false;
            }
        }

        var h = new Date().getHours();
        var m = new Date().getMinutes();
        var minutesNow = this.convertHoursToMinutes(h + ':' + m);

        if (purStartDate == purToday) {
            if (this.convertHoursToMinutes(this.showedSlot.startHour) <= minutesNow) {
                this.errorMessage = "* L'heure de début doit être supérieure à l'heure actuelle";
                return false;
            }
        }

        if (purEndDate == purToday) {
            if (this.convertHoursToMinutes(this.showedSlot.endHour) <= minutesNow) {
                this.errorMessage = "* L'heure de fin doit être supérieure à l'heure actuelle";
                return false;
            }
        }

        return true;
    }

    /**
     * @Description : Closing the modal page
     */
    closeModal() {
        this.viewCtrl.dismiss({slots: this.slots});
    }

    isValidateDisabled() {
        if (!this.showedSlot.startHour || !this.showedSlot.endHour || !this.showedSlot.startDate || !this.showedSlot.endDate)
        return true;

        return false;
    }

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date
     * @param options Date options
     */
    toDateString(date: number) {
        return new Date(date).toLocaleDateString('fr-FR');
    }

    convertHoursToMinutes(hour) {
        if (hour) {
            var hourArray = hour.split(':');
            return hourArray[0] * 60 + parseInt(hourArray[1]);
        }
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
}