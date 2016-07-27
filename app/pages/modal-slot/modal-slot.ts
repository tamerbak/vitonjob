import {NavController, ViewController, Alert, Toast, Platform} from 'ionic-angular';
import {DatePicker} from "ionic-native/dist/index";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global.service";

/*
 Generated class for the ModalSlotPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-slot/modal-slot.html',
	providers: [GlobalService]
})
export class ModalSlotPage {

    private slot:any;
    showedSlot:any;
    private projectTarget:string;
    private themeColor:string;
    private isEmployer:boolean;
    private viewCtrl:any;
    private calendarTheme:string;
    private nav:any;
	todayDate;
    isAndroid4: boolean;

    constructor(public nav:NavController, gc:GlobalConfigs, viewCtrl:ViewController, private globalService: GlobalService, platform:Platform) {

        // Get target to determine configs
        console.log('entering to modal-slots');
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.viewCtrl = viewCtrl;
        this.calendarTheme = config.calendarTheme;
        this.nav = nav;
        this.todayDate = new Date().toISOString();
		this.slot = {
            date: new Date(),
            startHour: 0,
            endHour: 0
        };
        this.showedSlot = {
            date: new Date().toISOString(),
            angular4Date: this.toDateString(new Date().getTime()),
            startHour: null,
            endHour: null
        };
        this.isAndroid4 = (platform.version('android').major < 5);
        console.log('Constructor done..');
    }

    /**
     * launching dateTimePicker component for slot selection
     */
    launchDateTimePicker(type, flag) {

        DatePicker.show({
            date: new Date(),
            mode: type,
            minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour: true,
            allowOldDates: false, doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
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
                        this.showedSlot.date = this.toDateString(this.slot.date, '');
                        this.showedSlot.angular4Date = this.toDateString(this.slot.date, '');
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

    isValidateDisabled(){
        if(!this.showedSlot.startHour || !this.showedSlot.endHour || this.showedSlot.endHour<this.showedSlot.startHour)
            return true;
        return false;
    }

    /**
     * @Description : Validating slot modal
     */
    validateModal() {
        //console.log('Validating '+ this.showedSlot.date + ' or ' + this.showedSlot.angular4Date);
        let stringDate: string = (this.isAndroid4) ?
            stringDate = this.showedSlot.angular4Date.split('/')[1]+
            '-' +this.showedSlot.angular4Date.split('/')[0] +
            '-' + this.showedSlot.angular4Date.split('/')[2] : "";
        let date = (this.isAndroid4)? new Date(stringDate) : new Date(this.showedSlot.date);
        //console.log ('sending ' + date);
        this.slot = {
            date: date.getTime(),
            startHour: parseInt(this.showedSlot.startHour.split(':')[0]) * 60 +
            parseInt(this.showedSlot.startHour.split(':')[1]),
            endHour: parseInt(this.showedSlot.endHour.split(':')[0]) * 60 +
            parseInt(this.showedSlot.endHour.split(':')[1]),
        };
        if(this.slot.startHour>this.slot.endHour){
            let toast = Toast.create({
                message: "L'heure de début devrait être inférieure à l'heure de fin",
                duration: 5000
            });
            return;
        }
        //debugger;

        console.log(JSON.stringify( 'JSON returned: ' + this.slot));
        this.viewCtrl.dismiss(this.slot);
    }

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date
     * @param options Date options
     */
    toDateString(date:number, options:any) {
        return new Date(date).toLocaleDateString('fr-FR', options);
    }

    /*isoToDateString(date:Date) {
        //debugger;
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
    toHourString(time:number) {
        let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
        let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
        return hours + ":" + minutes;
    }
    hoursErrorMessage : string = '';
	 checkHour(i){
         this.hoursErrorMessage = '';
        if(this.showedSlot.startHour && this.showedSlot.endHour && this.showedSlot.startHour >= this.showedSlot.endHour){
			if(i == 0){
                this.hoursErrorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
				//this.globalService.showAlertValidation("VitOnJob", "L'heure de début doit être inférieure à l'heure de fin");
                /*let toast = Toast.create({
                    message: "L'heure de début devrait être inférieure à l'heure de fin",
                    duration: 5000
                });*/
				this.showedSlot.startHour = "";
			}else{
                this.hoursErrorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
				//this.globalService.showAlertValidation("VitOnJob", "L'heure de fin doit être supérieure à l'heure de début");
                /*let toast = Toast.create({
                    message: "L'heure de début devrait être inférieure à l'heure de fin",
                    duration: 5000
                });*/
				this.showedSlot.endHour = "";
			}
		}
    }

    
}