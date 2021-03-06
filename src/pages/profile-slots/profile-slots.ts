import {NavController, ViewController, AlertController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";

@Component({
  templateUrl: 'profile-slots.html',
})
export class ProfileSlotsPage {

  public showedSlot: any;
  public projectTarget: string;
  public themeColor: string;
  public viewCtrl: any;
  public errorMessage: string = '';
  public slots = [];
  public params: NavParams;
  public inversedThemeColor: any;
  public isEmployer: boolean;
  public maxEndDate: any;
  public minStartDate: any;
  public yearsVals=[];
  public minDate:string;
  public maxDate:string;

  constructor(public nav: NavController, gc: GlobalConfigs, viewCtrl: ViewController, params: NavParams, public alert: AlertController) {
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();
    this.isEmployer = (this.projectTarget === 'employer');
    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.inversedThemeColor = config.inversedThemeColor;
    this.viewCtrl = viewCtrl;

    this.showedSlot = {
      startDate: null,
      endDate: null,
      startHour: null,
      endHour: null
    };

    let today = new Date();
    let maxYearsNum = 2 ; 
    this.maxEndDate = (today.getFullYear() + maxYearsNum) + "-12-31";
    this.minStartDate = new Date().toISOString();
    let i=0;
    for(i=0;i<=maxYearsNum;i++){
      this.yearsVals.push(today.getFullYear() +i);
    }

    this.maxDate =""+ (today.getFullYear()+ maxYearsNum )+ "-12"+"-31";
    this.minDate = this.formatDate(today.getFullYear(),today.getMonth()+1,today.getDate());

    //load saved slots
    if (params.get('savedSlots') && params.get('savedSlots').length > 0) {

      for (let i = 0; i < params.get('savedSlots').length; i++) {
        let s = params.get('savedSlots')[i];
        let debut = Date.parse(s.date_de_debut.split(" ")[0]);
        let fin = Date.parse(s.date_de_fin.split(" ")[0]);
        let slot = {
          startDate: debut,
          endDate: fin,
          startHour: s.heure_de_debut,
          endHour: s.heure_de_fin
        };


        this.slots.push(slot);
      }
    }
  }


  formatDate(year,month,day) {
    month = ""+month;
    day = ""+day;
    if (month.length < 2){
      month = '0' + month;
    } 
    if (day.length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }

  addSlot() {
    if (!this.isSlotValid()) {
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
    this.showedSlot = {
      startDate: null,
      endDate: null,
      startHour: null,
      endHour: null
    };
  }


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
          }
        }
      ]
    });

    confirm.present();
  }

  isSlotValid() {
    this.errorMessage = '';

    if (!this.showedSlot.startHour || !this.showedSlot.endHour || !this.showedSlot.startDate || !this.showedSlot.endDate)
      return false;

    let purStartDate = new Date(this.showedSlot.startDate).setHours(0, 0, 0, 0);
    let purEndDate = new Date(this.showedSlot.endDate).setHours(0, 0, 0, 0);
    let purToday = new Date().setHours(0, 0, 0, 0);

    //check if chosen dates are lower than today
    if (purStartDate < purToday || purEndDate < purToday) {
      this.errorMessage = "* Les dates de début et de fin de disponibilités doivent être supérieures à la date du jour";
      return false;
    }

    //check if chosen dates are lower than today
    if (purStartDate > purEndDate) {
      this.errorMessage = "* La date de début doit être inférieure à la date de fin de disponibilité";
      return false;
    }

    if (purStartDate == purEndDate) {
      if (this.showedSlot.startHour >= this.showedSlot.endHour) {
        this.errorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
        return false;
      }
    }

    let h = new Date().getHours();
    let m = new Date().getMinutes();
    let minutesNow = this.convertHoursToMinutes(h + ':' + m);

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
      let hourArray = hour.split(':');
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
