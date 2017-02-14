import {Component} from "@angular/core";
import {NavController, Platform} from "ionic-angular";
import {OffersService} from "../../providers/offers-service/offers-service";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {DatePicker} from "ionic-native";
import {PickerController} from "ionic-angular/components/picker/picker";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
import {Storage} from "@ionic/storage";

/*
 Generated class for the AdvancedSearchPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'advanced-search.html',
  selector: 'advanced-search'
})
export class AdvancedSearchPage {
  public slot: any;
  public showedSlot: any;
  public service: any;
  public listSectors: any;
  public listJobs: any;
  public projectTarget: any;
  public idsector: number;
  public sector: string;
  public job: string;
  public idJob: number;
  public dateEvent: any;
  public isAndroid4: boolean;
  public platform: any;
  public pickerCtrl: any;
  public calendarTheme: any;


  constructor(public nav: NavController, _service: OffersService, gc: GlobalConfigs, _platform: Platform, _pickerCtrl: PickerController, public db: Storage) {
    this.service = _service;
    this.projectTarget = gc.getProjectTarget();
    this.platform = _platform;
    this.isAndroid4 = (this.platform.version('android').major < 5);
    this.pickerCtrl = _pickerCtrl;
    _service.loadSectors(this.projectTarget).then(listSectors => {
      if (listSectors) {
        this.listSectors = listSectors;
        this.db.set('listSectors', JSON.stringify(listSectors));
      }
    });
    _service.loadJobs(this.projectTarget, this.idsector).then(listJobs => {
      if (listJobs) {
        this.listSectors = listJobs;
        this.db.set('listJobs', JSON.stringify(listJobs));
      }
    });
    this.slot = {
      date: new Date()

    };
    if (this.isAndroid4) {
      this.showedSlot = {
        date: this.toDateString(new Date().getTime())
      };
    } else {
      this.showedSlot = {
        date: new Date().toISOString()
      };
    }


  }


  setSectorsPicker() {
    //let rating = 0;
    let picker = this.pickerCtrl.create();
    let options: PickerColumnOption[] = new Array<PickerColumnOption>();
    //debugger;
    this.db.get('listSectors').then(listSectors => {
      if (listSectors) {
        listSectors = JSON.parse(listSectors);

        for (let i = 1; i < listSectors.length; i++) {
          options.push({
            value: listSectors[i].id,
            text: listSectors[i].libelle
          })
        }
      }
      let column = {
        selectedIndex: 0,
        options: options
      };

      picker.addColumn(column);
      picker.addButton('Annuler');
      picker.addButton({
        text: 'Valider',
        handler: data => {
          this.sector = data.undefined.text;
          this.idsector = data.undefined.value;
          this.filterJobList();
          this.job = '';
          this.idJob = 0;
        }
      });
      picker.setCssClass('sectorPicker');
      picker.present();
    });
  }

  /**
   * Sectors picker
   */
  setJobsPicker() {
    //let rating = 0;
    let picker = this.pickerCtrl.create();
    let options: PickerColumnOption[] = new Array<PickerColumnOption>();


    this.db.get('listJobs').then(
      list => {
        if (list) {
          list = JSON.parse(list);
          let q: any = this.idsector;

          // if the value is an empty string don't filter the items
          if (!(q === '')) {
            list = list.filter((v) => {
              return (v.idsector == q);
            });
          }

          this.listJobs = list;
          for (let i = 1; i < this.listJobs.length; i++) {
            options.push({
              value: this.listJobs[i].id,
              text: this.listJobs[i].libelle
            })
          }
          let column = {
            selectedIndex: 0,
            options: options
          };

          picker.addColumn(column);
          picker.addButton('Annuler');
          picker.addButton({
            text: 'Valider',
            handler: data => {
              this.job = data.undefined.text;
              this.idJob = data.undefined.value;
            }
          });
          picker.setCssClass('jobPicker');
          picker.present();

        }
      }
    );
  }

  filterSectorList(ev) {
    let q = ev.target.value;

    // if the value is an empty string don't filter the items
    if (q.trim() == '') {
      return;
    }

    this.listSectors = this.listSectors.filter((v) => {
      return (v.label.toLowerCase().indexOf(q.toLowerCase()) > -1);
    })
  }

  filterJobList() {

    this.db.get('listJobs').then(
      list => {
        if (list) {
          list = JSON.parse(list);
          let q: any = this.idsector;

          // if the value is an empty string don't filter the items
          if (!(q === '')) {
            list = list.filter((v) => {
              return (v.idsector == q);
            });
            this.listJobs = list;
          }

        }
      }
    );

  }

  /**
   * launching dateTimePicker component for slot selection
   */
  launchDateTimePicker(type: string, flag?: string) {

    DatePicker.show({
      date: new Date(),
      mode: type,
      minuteInterval: 15,
      androidTheme: this.calendarTheme,
      is24Hour: true,
      doneButtonLabel: 'Ok',
      cancelButtonLabel: 'Annuler',
      locale: 'fr_FR'
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
            this.showedSlot.date = this.toDateString(this.slot.date.getTime());
            this.showedSlot.angular4Date = this.toDateString(this.slot.date.getTime());
            break;
        }
      },
      err => console.log("Error occurred while getting date:", err)
    );
  }

  /**
   * @Description Converts a timeStamp to date string :
   * @param date : a timestamp date
   */
  toDateString(date: number) {
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


}
