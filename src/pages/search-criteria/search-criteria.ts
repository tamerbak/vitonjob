import {
  NavController,
  ViewController,
  LoadingController,
  PickerController,
  Platform,
  ToastController
} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {SearchResultsPage} from "../search-results/search-results";
import {Component} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {CommunesService} from "../../providers/communes-service/communes-service";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {SearchGuidePage} from "../search-guide/search-guide";
import {DatePicker} from "ionic-native";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
import {Storage} from "@ionic/storage";

declare let require: any;
/**
 * @author abdeslam jakjoud
 * @descirption Modal page exposing search criteria
 * @module Search
 */
@Component({
  templateUrl: 'search-criteria.html'
})
export class SearchCriteriaPage {

  public filters: any = [];
  public projectTarget: string;
  public activeCount: number = 0;
  public themeColor: string;

  public sectors: any = [];
  public sectorList: any = [];
  public jobs: any = [];
  public jobList: any = [];
  public sector: any;
  public idSector: any;
  public job: any;
  public idJob: any;
  public availabilityDate: any;
  public city: any;
  public cities: any = [];
  //public cityList: any = [];
  public isAndroid4: boolean;
  public isSectorFound = true;
  public isJobFound = true;
  public listJobs: any = [];
  public calendarTheme: any;
  public isEmployer:boolean;

  constructor(private viewCtrl: ViewController,
              public globalConfig: GlobalConfigs,
              private searchService: SearchService,
              private cityServices: CommunesService,
              private nav: NavController, platform: Platform,
              public loading: LoadingController,
              public toast: ToastController,
              public picker: PickerController, public db: Storage) {
    this.viewCtrl = viewCtrl;
    this.projectTarget = globalConfig.getProjectTarget();
    this.isEmployer = (this.projectTarget === 'employer');
    let config = Configs.setConfigs(this.projectTarget);
    this.isAndroid4 = (platform.is('android')) && (platform.version().major < 5);
    this.themeColor = config.themeColor;
    this.buildFilters();
    this.db.get("SECTOR_LIST").then((data: any) => {
      this.sectorList = JSON.parse(data);
    });
  }


  /**
   * @descirption depending on the nature of the project this method constructs the required buttons and input for filters
   */
  buildFilters() {
    if (this.projectTarget == 'jobyer') {
      let filter = {
        title: 'Métier',
        field: 'metier',
        activated: false,
        placeHolder: 'Secteur',
        icon: 'pie',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Job',
        field: 'job',
        activated: false,
        placeHolder: 'Job',
        icon: 'briefcase',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Nom',
        field: 'nom',
        activated: false,
        placeHolder: 'Nom / Prénom',
        icon: 'person',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Localisation',
        field: 'lieu',
        activated: false,
        placeHolder: 'Rue, Ville, Code postal, ...',
        icon: 'pin',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Date de disponibilité',
        field: 'date',
        activated: false,
        placeHolder: 'JJ/MM/AAAA',
        icon: 'calendar',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Entreprise',
        field: 'entreprise',
        activated: false,
        placeHolder: 'Entreprise',
        icon: 'people',
        value: ''
      };

      this.filters.push(filter);

    } else {

      let filter = {
        title: 'Métier',
        field: 'metier',
        activated: false,
        placeHolder: 'Secteur',
        icon: 'pie',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Job',
        field: 'job',
        activated: false,
        placeHolder: 'Job',
        icon: 'briefcase',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Nom',
        field: 'nom',
        activated: false,
        placeHolder: 'Nom / Prénom',
        icon: 'person',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Localisation',
        field: 'lieu',
        activated: false,
        placeHolder: 'Rue, Ville, Code postal, ...',
        icon: 'pin',
        value: ''
      };

      this.filters.push(filter);

      filter = {
        title: 'Date de disponibilité',
        field: 'date',
        activated: false,
        placeHolder: 'JJ/MM/AAAA',
        icon: 'calendar',
        value: ''
      };

      this.filters.push(filter);
    }
  }

  /**
   * @description Enables or disables a filter for multi-criteria search
   * @param filtee the required filter
   */
  toogleFilter(filter) {
    filter.activated = !filter.activated;
    if (filter.activated)
      this.activeCount += 10;
    else
      this.activeCount -= 10;
  }

  /**
   * @description send criteria search to web service and load results view
   */
  validateSearch() {

    //  check first if there are any criteria with value
    /*var voidQuery = true;
     for (var i = 0; i < this.filters.length; i++) {
     let f = this.filters[i];
     console.log(f);
     if (f.activated && f.value != '') {
     voidQuery = false;
     break;
     }
     }

     if (voidQuery) {
     //  Nothing to do here
     console.log('No search criteria given');
     this.viewCtrl.dismiss();
     return;
     }*/

    ///availability date must be greater than today
    if (new Date(new Date(this.availabilityDate).setHours(0, 0, 0)).getTime() <= new Date(new Date().setHours(0, 0, 0)).getTime()) {
      this.presentToast("Veuillez saisir une date supérieure à la date du jour", 1);
      return;
    }
    // Construct the search query in the correct format then summon search service
    // TEL05082016 : fixes #628
    let ignoreSector: boolean = false;
    if (isUndefined(this.sector) || (this.job && this.job.length > 0))
      ignoreSector = true;
    if (isUndefined(this.job))
      this.job = '';
    if (isUndefined(this.city))
      this.city = '';

    let date = '';
    if (this.availabilityDate) {
      date = this.availabilityDate.split('-')[2] + '/' + this.availabilityDate.split('-')[1] + '/' + this.availabilityDate.split('-')[0];
    }

    let searchFields = {
      class: 'com.vitonjob.callouts.recherche.SearchQuery',
      job: this.job,
      metier: (ignoreSector) ? '' : this.sector,
      lieu: this.city,
      nom: this.filters[2].value,
      entreprise: this.projectTarget == 'jobyer' ? this.filters[5].value : '',
      date: date,
      table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
      idOffre: '0'
    };
    console.log(JSON.stringify(searchFields));

      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data: any) => {
      console.log(data);
      this.searchService.persistLastSearch(data);
      loading.dismiss();
      this.nav.push(SearchResultsPage);
    });


  }

  /**
   * @description Cancel search and dismiss the modal page
   */
  close() {
    this.nav.pop();
  }

  calculateHeight() {
    let style = {
      'margin-top': 'calc(100% - ' + this.activeCount + '%);'
    };
    return style;
  }


  watchSector(e) {
    let val = e.target.value;
    if (val.length < 3) {
      this.isSectorFound = true;
      this.sectors = [];
      return;
    }

    this.sectors = [];
    let removeDiacritics = require('diacritics').remove;
    for (let i = 0; i < this.sectorList.length; i++) {
      let s = this.sectorList[i];
      if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
        this.sectors.push(s);
      }
    }
    if (this.sectors.length == 0) {
      this.isSectorFound = false;
    } else {
      this.isSectorFound = true;
    }
  }

  watchJob(e) {
    let val = e.target.value;
    if (val.length < 3) {
      this.isJobFound = true;
      this.jobs = [];
      return;
    }

    this.jobs = [];
    let removeDiacritics = require('diacritics').remove;
    for (let i = 0; i < this.jobList.length; i++) {
      let s = this.jobList[i];
      if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
        this.jobs.push(s);
      }
    }
    if (this.jobs.length == 0) {
      this.isJobFound = false;
    } else {
      this.isJobFound = true;
    }
  }

  jobSelected(job) {
    this.job = job.libelle;
    this.idJob = job.id;
    this.jobs = [];

  }

  setSectorsPicker() {
    let picker = this.picker.create();
    let options: PickerColumnOption[] = new Array<PickerColumnOption>();

    this.db.get('SECTOR_LIST').then(listSectors => {
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
          this.isSectorFound = true;
          this.isJobFound = true;
          this.sector = data.undefined.text;
          this.idSector = data.undefined.value;
          this.filterJobList();
          this.job = '';
          this.idJob = 0;
        }
      });
      picker.setCssClass('sectorPicker');
      picker.present();

    });
  }

  filterJobList() {

    this.db.get('JOB_LIST').then(
      list => {
        if (list) {
          list = JSON.parse(list);
          let q = this.idSector;

          // if the value is an empty string don't filter the items
          if (!(q === '')) {
            list = list.filter((v) => {
              return (v.idsector == q);
            });
            this.listJobs = list;
            this.jobList = list;
          }

        }
      }
    );

  }

  setJobsPicker() {
    let picker = this.picker.create();
    let options: PickerColumnOption[] = new Array<PickerColumnOption>();


    this.db.get('JOB_LIST').then(
      list => {
        if (list) {
          list = JSON.parse(list);
          let q = this.idSector;

          // if the value is an empty string don't filter the items
          if (!(q === '')) {
            list = list.filter((v) => {
              return (v.idsector == q);
            });
          }

          this.listJobs = list;
          this.jobList = list;
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
              this.isJobFound = true;
              this.job = data.undefined.text;
              this.idJob = data.undefined.value;
              /*this.enterpriseCard.offer.job = data.undefined.text;
               this.enterpriseCard.offer.idJob = data.undefined.value;*/
            }
          });
          picker.setCssClass('jobPicker');
          picker.present();

        }
      }
    );


  }

  sectorSelected(sector) {
    this.isJobFound = true;
    this.sector = sector.libelle;
    this.idSector = sector.id;
    this.job = '';
    this.sectors = [];

    this.db.get("JOB_LIST").then((data: any) => {

      this.jobList = JSON.parse(data);
      this.jobList = this.jobList.filter((v) => {
        return (v.idsector == sector.id);
      });

    });
  }

  watchCity(e) {
    let val = e.target.value;
    if (val.length < 3) {
      this.cities = [];
      return;
    }

    this.cities = [];
    this.cityServices.autocompleteCity(val).then((data: any) => {
      if (data)
        this.cities = data;
    });
  }

  citySelected(job) {
    this.city = job.nom;
    this.cities = [];
  }

  setCitiesPicker() {
    let picker = this.picker.create();
    let options: PickerColumnOption[] = new Array<PickerColumnOption>();

    this.db.get('CITIES_LIST').then(listCities => {
      if (listCities) {
        listCities = JSON.parse(listCities);
        for (let i = 1; i < listCities.length; i++) {
          options.push({
            value: listCities[i].id,
            text: listCities[i].nom
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
          this.city = data.undefined.text;
        }
      });
      picker.setCssClass('sectorPicker');
      picker.present();

    });
  }

  showGuideModal() {

    this.nav.push(SearchGuidePage);
  }

  /**
   * launching dateTimePicker component for slot selection
   */
  launchDateTimePicker(type) {

    DatePicker.show({
      date: new Date(),
      mode: type,
      minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour: true,
      doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
    }).then(
      date => {
        console.log("Got date: ", date);
        this.availabilityDate = this.toDateString(date.getTime());
        //this.showedSlot.angular4Date = this.toDateString(this.slot.date.getTime(), '');
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

  presentToast(message: string, duration: number) {
    let toast = this.toast.create({
      message: message,
      duration: duration * 1000
    });
    toast.present();
  }
}
