import {
  NavController,
  ViewController,
  ModalController,
  NavParams,
  PickerController,
  PopoverController,
  AlertController,
  Platform
} from "ionic-angular";
import {FormBuilder, Validators} from "@angular/forms";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";
import {LoadListService} from "../../providers/load-list-service/load-list-service";
import {Component, NgZone} from "@angular/core";
import {PopoverAutocompletePage} from "../popover-autocomplete/popover-autocomplete";
import {AuthenticationService} from "../../providers/authentication-service/authentication-service";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
import {Storage} from "@ionic/storage";
import {EnvironmentService} from "../../providers/environment-service/environment-service";
import {Utils} from "../../utils/utils";
import {Job} from "../../dto/job";
import {PharmaSoftwares} from "../../dto/pharmaSoftwares";
import {AddressService} from "../../providers/address-service/address-service"
import {MissionAddress} from "../../dto/missionAddress";

declare let require: any;

/*
 Generated class for the ModalJobPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'modal-job.html',
  selector:'modal-job'
})
export class ModalJobPage {

  public jobData: Job = new Job();
  public sectors: any = [];
  public jobs: any = [];
  public listJobs = [];
  public jobList = [];
  public sectorList = [];
  public isSectorFound = true;
  public isJobFound = true;
  public firstInit;

  public projectTarget: string;
  public currentUser: any;
  public isEmployer: boolean;

  public themeColor: string;

  public viewCtrl: ViewController;
  public fb: FormBuilder;
  public gc: GlobalConfigs;
  public os: OffersService;
  public params: NavParams;
  public platform: Platform;
  public config: any;

  public alertOptions = {
    title: '',
    subTitle: ''
  };

  /*
   * Collective conventions management
   */
  public convention: any;
  public niveauxConventions: any = [];
  public selectedNivConvID: number = 0;
  public categoriesConventions: any = [];
  public selectedCatConvID: number = 0;
  public echelonsConventions: any = [];
  public selectedEchConvID: number = 0;
  public coefficientsConventions: any = [];
  public selectedCoefConvID: number = 0;
  public parametersConvention: any = [];
  public selectedParamConvID: number = 0;
  public minHourRate: number = 0;
  public invalidHourRateMessage: string = '';
  public invalidHourRate = false;

  public niveauxConventionsList: any = [];
  public isNiveauxConventionsFound: boolean = true;

  public showPrerequisBtn: boolean = false;
  public isInputDisabled:boolean = true;

  public static CONV_FILTER_NIV = 0;
  public static CONV_FILTER_ECH = 1;
  public static CONV_FILTER_CAT = 2;
  public static CONV_FILTER_COEF = 3;
  public conventionFilters: any = [{
    name: 'NIV',
    labelle: 'Niveau',
    selected: "",
    list: [],
    filteredList: [],
    isFound: true,
  }, {
    name: 'ECH',
    labelle: 'echelon',
    selected: "",
    list: [],
    filteredList: [],
    isFound: true,
  }, {
    name: 'CAT',
    labelle: 'catégorie',
    selected: "",
    list: [],
    filteredList: [],
    isFound: true,
  }, {
    name: 'COEF',
    labelle: 'Coefficient',
    selected: "",
    list: [],
    filteredList: [],
    isFound: true,
  }];

  public categoriesHeure: any = [];
  public majorationsHeure: any = [];
  public indemnites: any = [];
  public dataValidation: boolean = false;

  /*
   * PREREQUIS
   */
  public prerequisOb: any;
  public prerequisObList: any = [];
  public prerequisObligatoires: any = [];


  /*
   * ADRESSE OFFRE
   */
  public searchData: string = '';
  public selectedPlace: any;
  public name: string;
  public streetNumber: string;
  public street: string;
  public zipCode: string;
  public city: string;
  public country: string;
  public jobForm: any;
  public listSectors = [];

  /*
  PHARMACIENS
   */
  public softwares: PharmaSoftwares[] = [];
  public software: PharmaSoftwares;
  public savedSoftwares: PharmaSoftwares[] = [];

  constructor(public nav: NavController,
              viewCtrl: ViewController,
              fb: FormBuilder,
              gc: GlobalConfigs,
              public offerService: OffersService,
              params: NavParams,
              platform: Platform,
              public environmentService:EnvironmentService,
              private zone: NgZone,
              private authService: AuthenticationService,
              public offersService: OffersService,
              public modal: ModalController,
              public picker: PickerController,
              public popover: PopoverController,
              public alert: AlertController,
              public storage: Storage,
              public listService: LoadListService,
              public addressService: AddressService) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    this.config = Configs.setConfigs(this.projectTarget);

    this.jobData = params.get('jobData');
    if(this.jobData){
      this.firstInit = false;
    }else{
      this.jobData = new Job();
      this.firstInit = true;
    }

    this.convention = {
      id: 0,
      code: '',
      libelle: ''
    };

    this.prerequisOb = '';

    let self = this;
    this.environmentService.reload();
    this.storage.get(this.config.currentUserVar).then((value) => {
      if (value) {
        let currentUser = JSON.parse(value);

        self.projectTarget = (currentUser.estRecruteur ? 'employer' : (currentUser.estEmployeur ? 'employer' : 'jobyer'));
        
        if (currentUser.estEmployeur && currentUser.employer.entreprises[0].conventionCollective.id > 0) {
          // Load collective convention
          self.offersService.getConvention(currentUser.employer.entreprises[0].conventionCollective.id).then(c => {
            if (c)
              self.convention = c;
            if (self.convention.id > 0) {
              self.offersService.getConventionNiveaux(self.convention.id).then((data: any) => {
                this.conventionFilters[ModalJobPage.CONV_FILTER_NIV].list = data;
                this.storage.set('CONV_NIV_LIST', JSON.stringify(data));
              });
              self.offersService.getConventionCoefficients(self.convention.id).then((data: any) => {
                this.conventionFilters[ModalJobPage.CONV_FILTER_COEF].list = data;
                this.storage.set('CONV_COEF_LIST', JSON.stringify(data));
              });
              self.offersService.getConventionEchelon(self.convention.id).then((data: any) => {
                this.conventionFilters[ModalJobPage.CONV_FILTER_ECH].list = data;
                this.storage.set('CONV_ECH_LIST', JSON.stringify(data));
              });
              self.offersService.getConventionCategory(self.convention.id).then((data: any) => {
                this.conventionFilters[ModalJobPage.CONV_FILTER_CAT].list = data;
                this.storage.set('CONV_CAT_LIST', JSON.stringify(data));
              });
              self.offersService.getConventionParameters(self.convention.id).then((data: any) => {
                self.parametersConvention = data;
                self.checkHourRate();
              });
              self.offersService.getHoursCategories(self.convention.id).then((data: any) => {
                self.categoriesHeure = data;
              });
              self.offersService.getHoursMajoration(self.convention.id).then((data: any) => {
                self.majorationsHeure = data;
              });
              self.offersService.getIndemnites(self.convention.id).then((data: any) => {
                self.indemnites = data;
              });

            }
          });
        }
      }
    });

    // Set local variables
    this.themeColor = this.config.themeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.platform = platform;

    // Modal traitement:
    this.viewCtrl = viewCtrl;
    this.jobForm = fb.group({
      sector: ['', Validators.required],
      job: ['', Validators.required]
    });

    this.initializeJobForm(params);

    this.alertOptions = {
      title: 'Devise',
      subTitle: 'Sélectionner votre devise'
    };


    this.jobList = [];
    this.sectorList = [];
    this.storage.get("SECTOR_LIST").then((data: any) => {
      this.sectorList = JSON.parse(data);
    });

    if(this.isEmployer){
      this.listService.loadPharmacieSoftwares().then((data: any) => {
        let softwares: PharmaSoftwares[] = data.data;
        if (softwares && softwares.length > 0) {
          this.softwares = softwares;
        } else {
          this.softwares = [];
        }
      })
    }
  }

  /**
   * @Description : Initializing job form
   */
  initializeJobForm(params: any) {
    //case of editing an existing offer
    if(!this.firstInit){
      //initializing mission address
      if (this.jobData.adress && !Utils.isEmpty(this.jobData.adress.fullAdress)) {
        this.searchData = this.jobData.adress.fullAdress.trim();
        this.name = this.jobData.adress.name;
        this.street = this.jobData.adress.street;
        this.streetNumber = this.jobData.adress.streetNumber;
        this.zipCode = this.jobData.adress.cp;
        this.city = this.jobData.adress.ville;
        this.country = this.jobData.adress.pays;
      }
      if(this.isEmployer) {
        //initializing pharma softwares
        if (this.jobData.pharmaSoftwareData)
          this.savedSoftwares = this.jobData.pharmaSoftwareData;
        //initializing prerequis
        if (this.jobData.requirementData)
          this.prerequisObligatoires = this.jobData.requirementData;
      }
      //case of a new offer
    }else{
      this.storage.get(this.config.currentUserVar).then((value) => {
        if (value) {
          let currentUser = JSON.parse(value);
          this.jobData = new Job();
          if(this.projectTarget == "employer") {
            //initilizing contact
            this.jobData.contact = (currentUser.prenom + " " + currentUser.nom).trim();
            //initializing telephone
            this.jobData.telephone = ((Utils.isEmpty(currentUser.tel) == false) ? currentUser.tel.replace('+33', '0') : '');
            //initializing address
            this.searchData = '';
            let siegeAddress = currentUser.employer.entreprises[0].siegeAdress;
            this.searchData = siegeAddress.fullAdress.trim();
            this.name = siegeAddress.name;
            this.streetNumber = siegeAddress.streetNumber;
            this.street = siegeAddress.street;
            this.zipCode = siegeAddress.zipCode;
            this.city = siegeAddress.city;
            this.country = siegeAddress.country;
          } else {
            let personalAdress = currentUser.jobyer.personnalAdress;
            this.searchData = personalAdress.fullAdress.trim();
            this.name = personalAdress.name;
            this.streetNumber = personalAdress.streetNumber;
            this.street = personalAdress.street;
            this.zipCode = personalAdress.zipCode;
            this.city = personalAdress.city;
            this.country = personalAdress.country;
          }
        }
      });
    }
  }

  showResults(place) {
    this.selectedPlace = place;
    let adrObj: any = this.authService.decorticateGeolocAddress(this.selectedPlace);
    this.zone.run(() => {
      this.name = !adrObj.name ? '' : adrObj.name.replace("&#39;", "'");
      this.streetNumber = adrObj.streetNumber.replace("&#39;", "'");
      this.street = adrObj.street.replace("&#39;", "'");
      this.zipCode = adrObj.zipCode;
      this.city = adrObj.city.replace("&#39;", "'");
      this.country = (adrObj.country.replace("&#39;", "'") == "" ? 'France' : adrObj.country.replace("&#39;", "'"));
      this.searchData = this.selectedPlace.name + " " + this.selectedPlace.formatted_address;
    });
  }

  watchPrerequisOb(event) {
    let kw = event.target.value;
    if (kw.length < 3) {
      this.prerequisObList = [];
      return;
    }

    this.offerService.selectPrerequis(kw).then((data: any) => {
      this.prerequisObList = data;
    });
  }

  watchDocsNecessary(event) {
    this.showPrerequisBtn = false;
    let kw = event.target.value;
    if (kw.length < 3) {
      this.prerequisObList = [];
      return;
    }

    this.offerService.selectPrerequis(kw).then((data: any) => {
      this.prerequisObList = data;
    });

    // this.offerService.isPrerequisExist(kw).then((data:any) =>{
    //     if(data && data.length > 0){
    //         this.showPrerequisBtn = true;
    //     }
    // });
  }

  preqOSelected(p) {
    this.showPrerequisBtn = true;
    this.prerequisOb = p;
    this.prerequisObList = [];
  }

  addPrerequis() {
    for (let i = 0; i < this.prerequisObligatoires.length; i++)
      if (this.prerequisObligatoires[i].libelle.toLowerCase() == this.prerequisOb.libelle.toLocaleLowerCase())
        return;
    let p = Utils.cloneObject(this.prerequisOb);
    this.prerequisObligatoires.push(p);

    this.prerequisOb.libelle = '';
  }

  removePrerequis(p, chip:Element) {

    let index = -1;
    for (let i = 0; i < this.prerequisObligatoires.length; i++)
      if (this.prerequisObligatoires[i].libelle == p.libelle) {
        index = i;
        break;
      }
    if (index < 0)
      return;
    this.prerequisObligatoires.splice(index, 1);
    chip.remove();
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }

  /**
   * @Author : TEL
   * @Description: Validating the modal page (All fields are filled)
   */
  validateJob() {
    //Job and sector check
    if (this.jobData.idJob == 0 || this.jobData.idsector == 0) {
      let alert = this.alert.create({
        title: 'Erreur',
        subTitle: "Veuillez choisir un secteur et un job valides",
        buttons: ['OK']
      });
      alert.present();
      return;
    }

    //remuneration check: la remuneration es obligatoire pour les offres employeurs seulement
    if(this.isEmployer) {
      if ((this.jobData.remuneration <= 0) || Utils.isEmpty(this.jobData.remuneration)) {
        let alert = this.alert.create({
          title: 'Erreur',
          subTitle: "Veuillez saisir une rémunération valide",
          buttons: ['OK']
        });
        alert.present();
        return;
      }
    }else{
     if(Utils.isEmpty(this.jobData.remuneration)){
       this.jobData.remuneration = 0;
     }
    }

    if (this.prerequisObligatoires && this.prerequisObligatoires.length > 0) {
      this.jobData.requirementData = this.prerequisObligatoires;
    } else {
      this.jobData.requirementData = [];
    }

    this.jobData.pharmaSoftwareData = this.savedSoftwares;

    if(this.isEmployer) {
      this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === '') && !(this.jobData.remuneration <= 0) && !Utils.isEmpty(this.jobData.remuneration) && !(this.jobData.nbPoste <= 0) && !Utils.isEmpty(this.jobData.nbPoste));
    }else{
      this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === ''));
    }

    //Adresse
    // removeDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ");
    let removeDiacritics = require('diacritics').remove;
    this.jobData.adress = new MissionAddress();
    this.jobData.adress.fullAdress = removeDiacritics(this.searchData.trim());
    this.jobData.adress.name = removeDiacritics(this.name);
    this.jobData.adress.street = removeDiacritics(this.street);
    this.jobData.adress.streetNumber =  removeDiacritics(this.streetNumber);
    this.jobData.adress.cp = removeDiacritics(this.zipCode);
    this.jobData.adress.ville= removeDiacritics(this.city);
    this.jobData.adress.pays = this.country;

    this.viewCtrl.dismiss(this.jobData);
  }

  /**
   * @Description : loads jobs list
   */
  showJobList() {
    let c = this.jobData.idsector;
    this.storage.get("JOB_LIST").then((data: any) => {

      this.jobList = JSON.parse(data);
      this.jobList = this.jobList.filter((v) => {
        return (v.idsector == c);
      });

      let selectionModel = this.modal.create(ModalSelectionPage,
        {type: 'job', items: this.jobList, selection: this});
      selectionModel.present();
    });
  }


  /**
   * @Description : loads sector list
   */
  showSectorList() {
    this.storage.get("SECTOR_LIST").then((data: any) => {
      this.sectorList = JSON.parse(data);
      let selectionModel = this.modal.create(ModalSelectionPage,
        {type: 'secteur', items: this.sectorList, selection: this});
      selectionModel.present();
    });

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
    // removeDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ");
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

  sectorSelected(sector) {
    this.isJobFound = true;

    this.jobData.sector = sector.libelle;
    this.jobData.idsector = sector.id;
    this.jobData.job = '';
    this.jobData.idJob = 0;
    this.sectors = [];

    this.storage.get("JOB_LIST").then((data: any) => {

      this.jobList = JSON.parse(data);
      this.jobList = this.jobList.filter((v) => {
        return (v.idsector == sector.id);
      });

    });
  }

  watchJob(e) {
    let val = e.target.value;
    if (val.length < 3) {
      this.isJobFound = true;
      this.jobs = [];
      return;
    }

    this.jobs = [];
    this.offersService.selectJobs(val).then((data: any) => {
      this.jobs = data;
      if (this.jobs.length == 0) {
        this.isJobFound = false;
      } else {
        this.isJobFound = true;
      }
    })
  }

  /**
   * The job has been selected we will set the offer's job and the conventions data
   * @param job
   */
  jobSelected(job) {
    this.jobData.job = job.libelle;
    this.jobData.idJob = job.id;
    this.jobs = [];

  }

  /**
   * If a collective convention is loaded we need to set the salary to the minimum rate of its parameters
   */
  checkHourRate() {

    if (!this.parametersConvention || this.parametersConvention.length == 0)
      return;

    this.selectedParamConvID = this.parametersConvention[0].id;
    this.minHourRate = this.parametersConvention[0].rate;
    for (let i = 0; i < this.parametersConvention.length; i++) {
      if (this.minHourRate > this.parametersConvention[i].rate) {
        this.selectedParamConvID = this.parametersConvention[i].id;
        this.minHourRate = this.parametersConvention[i].rate;
      }
    }

    this.validateRate(this.jobData.remuneration);
  }

  /**
   *
   * @param rate
   * @returns {boolean}
   */
  validateRate(rate) {
    let r = parseFloat(rate);
    let roundMin = (Math.round(this.minHourRate * 100) / 100);

    if (r >= roundMin) {
      this.invalidHourRateMessage = '0.00';
      this.invalidHourRate = false;
      return true;
    }

    this.invalidHourRateMessage = roundMin + '';
    this.invalidHourRate = true;
    return false;
  }

  /**
   * Display a filtered list of lvl
   * @param e
   */
  // watchConvNiv(e) {
  //     let val = e.target.value;
  //     if (val.length < 2) {
  //         this.isNiveauxConventionsFound = true;
  //         this.niveauxConventions = [];
  //         return;
  //     }
  //
  //     this.niveauxConventions = [];
  //     let removeDiacritics = require('diacritics').remove;
  //     // emoveDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ");
  //     for (let i = 0; i < this.niveauxConventionsList.length; i++) {
  //         let s = this.niveauxConventionsList[i];
  //         if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
  //             this.niveauxConventions.push(s);
  //         }
  //     }
  //
  //     this.isNiveauxConventionsFound = (this.niveauxConventions.length != 0);
  // }

  /**
   * Display a filtered list of lvl
   * @param e
   */
  watchConvFilter(conventionFilter, e) {

    // Check minimum value's length
    let val = e.target.value;
    if (val.length < 2) {
      conventionFilter.isFound = true;
      conventionFilter.filteredList = [];
      return;
    }

    // Set filtered list to display
    conventionFilter.filteredList = [];
    let removeDiacritics = require('diacritics').remove;
    // removeDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ");
    for (let i = 0; i < conventionFilter.list.length; i++) {
      let s = conventionFilter.list[i];
      if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
        conventionFilter.filteredList.push(s);
      }
    }

    // Display error message if no value matches
    conventionFilter.isFound = (conventionFilter.filteredList.length != 0);
  }

  /**
   * Convention level picker
   */
  setConvNivPicker(conventionFilter) {

    if (this.platform.is('android') && this.platform.version().major >= 5) {
      let picker = this.picker.create();
      let options: PickerColumnOption[] = new Array<PickerColumnOption>();

      this.storage.get('CONV_' + conventionFilter.name + '_LIST').then(listForPicker => {
        if (listForPicker) {
          listForPicker = JSON.parse(listForPicker);
          for (let i = 0; i < listForPicker.length; i++) {
            options.push({
              value: listForPicker[i],
              text: listForPicker[i].libelle
            })
          }
          console.log(options);
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
            this.updateHourRateThreshold(conventionFilter, data.undefined.value);
            conventionFilter.isFound = true;
          }
        });
        picker.setCssClass('sectorPicker');
        picker.present();

      });
    } else {
      /* Android versions 4.x.x */
      this.showConvList(conventionFilter, conventionFilter.labelle);
    }

  }

  /**
   * Modal page to slect convention filter's list
   * @Description : loads sector list
   */
  showConvList(conventionFilter, type) {
    this.storage.get('CONV_' + conventionFilter.name + '_LIST').then((data: any) => {
      let selectionModel = this.modal.create(
        ModalSelectionPage, {
          type: type,
          items: JSON.parse(data),
          selection: this
        }
      );
      selectionModel.present();
    });

  }

  updateHourRateThreshold(conventionFilter: any, obj: any) {
    //debugger;
    // Hide error message and close list
    conventionFilter.isFound = true;
    conventionFilter.filteredList = [];

    conventionFilter.selected = obj.libelle;

    if (!this.parametersConvention || this.parametersConvention.length == 0){
      conventionFilter.selected = '';
      return;
    }
    

    //  Ensure to take the maximum threshold before checking other options
    for (let i = 0; i < this.parametersConvention.length; i++) {
      if (this.minHourRate <= this.parametersConvention[i].rate) {
        this.selectedParamConvID = this.parametersConvention[i].id;
        this.minHourRate = this.parametersConvention[i].rate;
      }
    }

    //  Now let's seek the suitable parameters
    for (let i = 0; i < this.parametersConvention.length; i++) {

      if (conventionFilter.name == 'CAT' && obj.id > 0 && this.parametersConvention[i].idcat != obj.id)
        continue;
      if (conventionFilter.name == 'COEF' && obj.id > 0 && this.parametersConvention[i].idcoeff != obj.id)
        continue;
      if (conventionFilter.name == 'ECH' && obj.id > 0 && this.parametersConvention[i].idechelon != obj.id)
        continue;
      if (conventionFilter.name == 'NIV' && obj.id > 0 && this.parametersConvention[i].idniv != obj.id)
        continue;

      if (this.minHourRate > this.parametersConvention[i].rate) {
        this.selectedParamConvID = this.parametersConvention[i].id;
        this.minHourRate = this.parametersConvention[i].rate;
      }
    }

    this.validateRate(this.jobData.remuneration);
  }

  convParametersVisible() {
    if (!this.parametersConvention || this.parametersConvention.length == 0
      || !this.jobData.remuneration || this.jobData.remuneration == 0)
      return false;
    return true;
  }

  /**
   * Sectors picker
   */
  setSectorsPicker() {

    // if (this.platform.is('android') && this.platform.version().major >= 5) {
    //   let picker = this.picker.create();
    //   let options: PickerColumnOption[] = new Array<PickerColumnOption>();

    //   this.storage.get('SECTOR_LIST').then(listSectors => {
    //     if (listSectors) {
    //       listSectors = JSON.parse(listSectors);
    //       for (let i = 0; i < listSectors.length; i++) {
    //         options.push({
    //           value: listSectors[i].id,
    //           text: listSectors[i].libelle
    //         })
    //       }
    //     }
    //     let column = {
    //       selectedIndex: 0,
    //       options: options
    //     };

    //     picker.addColumn(column);
    //     picker.addButton('Annuler');
    //     picker.addButton({
    //       text: 'Valider',
    //       handler: data => {
    //         this.isSectorFound = true;
    //         this.isJobFound = true;
    //         this.jobData.sector = data.undefined.text;
    //         this.jobData.idsector = data.undefined.value;
    //         this.filterJobList();
    //         this.jobData.job = '';
    //         this.jobData.idJob = 0;
    //       }
    //     });
    //     picker.setCssClass('sectorPicker');
    //     picker.present();

    //   });
    // } else {
      /* Android versions 4.x.x */
      this.showSectorList();
    //}

  }

  filterJobList() {

    this.storage.get('JOB_LIST').then(
      list => {
        if (list) {
          list = JSON.parse(list);
          let q = this.jobData.idsector;

          // if the value is an empty string don't filter the items
          if (!(q.toString() === '')) {
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

  /**
   * Sectors picker
   */
  setJobsPicker() {

    // let picker = this.picker.create();
    // let options: PickerColumnOption[] = new Array<PickerColumnOption>();
    // if (this.platform.is('android') && this.platform.version().major >= 5) {
    //   this.storage.get('JOB_LIST').then(
    //     list => {
    //       if (list) {
    //         list = JSON.parse(list);
    //         let q = this.jobData.idsector;

    //         // if the value is an empty string don't filter the items
    //         if (!(q.toString() === '')) {
    //           list = list.filter((v) => {
    //             return (v.idsector == q);
    //           });
    //         }

    //         this.listJobs = list;
    //         this.jobList = list;
    //         for (let i = 0; i < this.listJobs.length; i++) {
    //           options.push({
    //             value: this.listJobs[i].id,
    //             text: this.listJobs[i].libelle
    //           })
    //         }
    //         let column = {
    //           selectedIndex: 0,
    //           options: options
    //         };

    //         picker.addColumn(column);
    //         picker.addButton('Annuler');
    //         picker.addButton({
    //           text: 'Valider',
    //           handler: data => {
    //             this.isJobFound = true;
    //             this.jobData.job = data.undefined.text;
    //             this.jobData.idJob = data.undefined.value;
    //             /*this.enterpriseCard.offer.job = data.undefined.text;
    //              this.enterpriseCard.offer.idJob = data.undefined.value;*/
    //           }
    //         });
    //         picker.setCssClass('jobPicker');
    //         picker.present();

    //       }
    //     }
    //   );

    // } else {
      /* Android versions 4.x.x */
      this.showJobList();
    //}


  }

  presentPopover(ev, type) {

    let popover = this.popover.create(PopoverAutocompletePage, {
      list: (type === 'secteur') ? this.listSectors : this.listJobs,
      type: type,
      idsector: this.jobData.idsector
    });
    popover.present({
      ev: ev
    });

    popover.onDidDismiss((data: any) => {
      if (data) {

        if (type === 'secteur') {
          this.jobData.sector = data.libelle;
          this.jobData.idsector = data.id;
          this.filterJobList();
          this.jobData.job = '';
          this.jobData.idJob = 0;
        } else if (type === 'job') {
          this.jobData.job = data.libelle;
          this.jobData.idJob = data.id ? data.id : 0;
        }
      }
    });
  }


  //<editor-fold desc="Software management">
  addSoftware(soft) {
    for(let i = 0; i < this.savedSoftwares.length; i++){
      if(this.savedSoftwares[i].id == soft.id){
        this.savedSoftwares.splice(i, 1);
        break;
      }
    }
    this.savedSoftwares.push(soft);
  }

  removeSoftware(item) {

    let confirm = this.alert.create({
      title: 'Êtes-vous sûr?',
      message: 'Voulez-vous vraiment supprimer ce logiciel?',
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
            this.savedSoftwares.splice(this.savedSoftwares.indexOf(item), 1);
          }
        }
      ]
    });
    confirm.present();
  }
  //</editor-fold>
}
