import {Component, NgZone} from "@angular/core";
import {NavController, NavParams, Events, ModalController,PickerController, Platform, ToastController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SqlStorageService} from "../../providers/sql-storage-service/sql-storage-service";
import {PersonalAddressPage} from "../personal-address/personal-address";
import {GlobalService} from "../../providers/global-service/global-service";
import {Camera, DatePicker} from "ionic-native";
import {CommunesService} from "../../providers/communes-service/communes-service";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {HomePage} from "../home/home";
import {AttachementsService} from "../../providers/attachements-service/attachements-service";
import {MedecineService} from "../../providers/medecine-service/medecine-service";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {Utils} from "../../utils/utils";
import {AccountConstraints} from "../../validators/account-constraints";
import {ModalCorporamaSearchPage} from "../modal-corporama-search/modal-corporama-search";
import {LoadingController} from "ionic-angular/components/loading/loading";
import {AlertController} from "ionic-angular/components/alert/alert";
import {LoadListService} from "../../providers/load-list-service/load-list-service";
import {AuthenticationService} from "../../providers/authentication-service/authentication-service";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {Storage} from "@ionic/storage";
import {FileUtils} from "../../utils/fileUtils";
import {ModalUpdatePassword} from "../modal-update-password/modal-update-password";
import {ConventionService} from "../../providers/convention-service/convention-service";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
declare var cordova: any;
declare var window;
declare let require: any;

/**
 * @author Amal ROCHD
 * @description update civility information
 * @module Authentication
 */
@Component({
  templateUrl: 'civility.html',
  selector:'civility'
})
export class CivilityPage {
  public projectTarget: string;
  public title: string;
  public lastname: string;
  public firstname: string;
  public birthdate;
  public birthplace: string;
  public cni: string;
  public numSS: string;
  public nationality = 91;
  public nationalities = [];
  public currentUser;
  public companyname: string;
  public siret: string;
  public ape: string;
  public scanUri: string;
  public scanTitle: string;
  public titlePage: string;
  public isAPEValid = true;
  public isSIRETValid = true;
  public fromPage: string;
  public codesPostaux: any = [];
  public birthcp: any;
  public selectedCP: number = 0;
  public communes: any = [];
  public selectedCommune: any;
  public communesService: CommunesService;
  public numSSMessage: string = '';
  public checkSS: boolean = false;
  public uploadVerb = "Charger ";
  public isRecruiter = false;
  public medecineTravail: any;
  public medecineId: number;
  public medecines: any = [];
  public currentUserVar: string;
  public isValideLastName: boolean = true;
  public isValideFirstName: boolean = true;
  public titlestyle: any;
  public nationalitiesstyle: any;
  public calendarTheme: number;
  public isAndroid4: boolean;
  public platform: any;
  public isBirthdateValid = true;
  public isFrench: boolean = true;
  public isEU: boolean = true;
  public idnationality: number = 40;
  public tsejProvideDate: any;
  public tsejFromDate: any;
  public tsejToDate: any;
  public prefecture: any;
  public prefectures: any = [];
  public maxtsejProvideDate: any;
  public mintsejProvideDate: any;
  public maxtsejFromDate: any;
  public mintsejFromDate: any;
  public maxtsejToDate: any;
  public mintsejToDate: any;
  //nb work and study hours
  public nbWorkVitOnJob: number = 0;
  public nbWorkHours: number = 0;
  public isNbStudyHoursBig: string = "false";

  /*
   Gestion des conventions collectives
   */
  public convention: any;
  public conventionId: any;
  public conventions: any = [];
  public convObject: any;
  public collective_heure_hebdo: number;

  //birth country and department
  public pays: any = [];
  public index: string = "33";
  public isEuropean: number;
  public indexForForeigner: string;
  public birthdep: string;
  public departments: any = [];
  public selectedBirthDep: any;
  //nationality and docs
  public idNationaliteLabel: string;
  public isResident: any;
  public isCIN: any;
  public numStay: string;
  //flags for field validation
  public isValidCni: boolean;

  //returned company from corporama search
  public company: any;

  // Forgotten properties declarations
  public themeColor: string;
  public isEmployer: boolean;
  public params: any;
  public loadListService: any;
  public regionId: any;
  public loading: any;
  public cniHint: any;
  public modal: any;
  public slot: any;
  public showedSlot: any;
  public alert: any;
  public tsMessage:string="";

  //CV
  public uploadCVVerb = "Charger ";
  public cvUri: string;
  public toast: any;

  //Jobs
  public interestingJobs : any[];
  public jobs: any = [];
  public listJobs = [];
  public jobList = [];
  public selectedJob:any;
  public selectedJobId:any;
  public selectedJobLevel:any = 1;
  public isJobFound = true;

  /**
   * @description While constructing the view, we load the list of nationalities, and get the currentUser passed as parameter from the connection page, and initiate the form with the already logged user
   */
  constructor(public nav: NavController,
              private authService: AuthenticationService,
              public gc: GlobalConfigs,
              private _loadListService: LoadListService,
              private sqlStorageService: SqlStorageService,
              params: NavParams,
              private globalService: GlobalService,
              private zone: NgZone,
              public events: Events,
              private attachementService: AttachementsService,
              private medecineService: MedecineService,
              communesService: CommunesService,
              _platform: Platform,
              public picker: PickerController,
              private profileService: ProfileService,
              private _loading: LoadingController,
              private _modal: ModalController,
              private _toast: ToastController,
              private _alert: AlertController,
              public storage: Storage,
              private conventionService: ConventionService) {
    // Set global configs
    // Get target to determine configs

    this.projectTarget = gc.getProjectTarget();
    this.platform = _platform;
    this.loadListService = _loadListService;
    this.loading = _loading;
    this.modal = _modal;
    this.alert = _alert;
    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.themeColor = config.themeColor;
    this.currentUserVar = config.currentUserVar;
    this.isEmployer = (this.projectTarget == 'employer');
    this.calendarTheme = config.calendarTheme;
    this.isAndroid4 = (this.platform.version('android').major < 5);
    //this.tabs=tabs;
    this.params = params;
    this.currentUser = this.params.data.currentUser;
    this.isRecruiter = this.currentUser.estRecruteur;
    this.fromPage = this.params.data.fromPage;
    this.toast = _toast;
    this.titlePage = this.isEmployer ? "Fiche de l'entreprise" : "Profil";
    //load nationality list
    if (!this.isEmployer && !this.isRecruiter) {
      this.initinterestingJobs();
      this.storage.get('JOB_LIST').then(
        list => {
          if (list) {
            list = JSON.parse(list);

            //this.listJobs = list;
            this.jobList = list;
            

          }
        });
      this.loadListService.loadNationalities(this.projectTarget).then((data: {data: any}) => {
        this.nationalities = data.data;
        //initialize nationality with (9 = francais)
        this.scanTitle = " de votre CNI";
        this.nationalitiesstyle = {'font-size': '1.4rem'};
      });
    } else {
      this.scanTitle = " de votre extrait k-bis";
      this.loadListService.loadConventions().then((response: any) => {
        this.conventions = response;
      });
    }

    this.communesService = communesService;
    this.selectedCommune = {
      id: 0,
      nom: '',
      code_insee: ''
    };
    this.communesService.loadPrefectures().then((data: any) => {
      this.prefectures = data;
    });
    let today = new Date();
    let m = (today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : "" + (today.getMonth() + 1);
    let d = (today.getDate()) < 10 ? "0" + (today.getDate()) : "" + (today.getDate());
    this.maxtsejProvideDate = today.getFullYear() + "-" + m + "-" + d;
    this.mintsejProvideDate = (today.getFullYear() - 70) + "-01-01";

    this.conventionService.loadConventionData(this.currentUser.employer.id).then((data: any)=>{
      if (data.length > 0) {
        this.collective_heure_hebdo = Number(data[0].duree_collective_travail_hebdo);
      } else {
        this.collective_heure_hebdo = 35;
      }
    });

    if (this.currentUser.employer.enterprises && this.currentUser.employer.enterprises.length > 0) {
      if (this.currentUser.employer.entreprises[0].conventionCollective &&
        this.currentUser.employer.entreprises[0].conventionCollective.id > 0) {
        this.conventionId = this.currentUser.employer.entreprises[0].conventionCollective.id;
      }
    }

    this.maxtsejFromDate = today.getFullYear() + "-" + m + "-" + d;
    this.mintsejFromDate = (today.getFullYear() - 70) + "-01-01";

    this.mintsejToDate = today.getFullYear() + "-" + m + "-" + d;
    this.maxtsejToDate = (today.getFullYear() + 70) + "-12-31";

    //load data for birth country
    this.loadListService.loadCountries(this.projectTarget).then((data: {data: any}) => {
      this.pays = data.data;
    });

  }

  initinterestingJobs(){
    this.profileService.loadProfileJobs(this.currentUser.jobyer.id).then((data:any)=>{
      this.interestingJobs = data;
    });
  }

  removeJob(j){
    let index = -1;
    for(let i = 0 ; i < this.interestingJobs.length ; i++){
      if(this.interestingJobs[i].id == j.id){
        index = i;
        break;
      }
    }

    if(index<0)
      return;

    this.interestingJobs.splice(index,1);
    this.profileService.removeJob(j, this.currentUser.jobyer.id).then((data: any)=> {
      
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
    this.selectedJob = job.libelle;
    this.selectedJobId = job.id;
    this.jobs = [];

  }

  addJob(){
    if(!this.selectedJobId || Utils.isEmpty(this.selectedJobId) ||
      !this.selectedJobLevel || Utils.isEmpty(this.selectedJobLevel)){
      return;
    }
    for(let i = 0 ; i < this.interestingJobs.length ; i++){
      if(this.interestingJobs[i].libelle == this.selectedJob){
        return;
      }
    }
    let j = {
      id : this.selectedJobId,
      libelle : this.selectedJob,
      niveau : this.selectedJobLevel
    };
    this.interestingJobs.push(j);
    this.profileService.attachJob(j, this.currentUser.jobyer.id).then((data: any)=> {
      this.selectedJob = '';
      this.selectedJobId = null;
    });
  }

  /**
   * Sectors picker
   */
  setJobsPicker() {

    let picker = this.picker.create();
    let options: PickerColumnOption[] = new Array<PickerColumnOption>();
    if (this.platform.is('android') && this.platform.version().major >= 5) {
      this.storage.get('JOB_LIST').then(
        list => {
          if (list) {
            list = JSON.parse(list);

            this.listJobs = list;
            this.jobList = list;
            for (let i = 0; i < this.listJobs.length; i++) {
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
                this.selectedJob = data.undefined.text;
                this.selectedJobId = data.undefined.value;
                /*this.enterpriseCard.offer.job = data.undefined.text;
                 this.enterpriseCard.offer.idJob = data.undefined.value;*/
              }
            });
            picker.setCssClass('jobPicker');
            picker.present();

          }
        }
      );

    } else {
      /* Android versions 4.x.x */
      this.showJobList();
    }
  }

  showJobList() {
    this.storage.get("JOB_LIST").then((data: any) => {

      this.jobList = JSON.parse(data);

      let selectionModel = this.modal.create(ModalSelectionPage,
        {type: 'job', items: this.jobList, selection: this});
      selectionModel.present();
    });
  }

  ////////////////////////

  watchConvention(e) {
    this.conventionId = 0;
    let val = e.target.value;
    if (val.length < 4) {
      this.conventions = [];
      return;
    }

    this.loadListService.loadConventions().then((data: any) => {
      this.conventions = data;
    });
  }

  watchBirthCP(e) {
    this.selectedCP = 0;
    let val = e.target.value;
    if (val.length < 4) {
      this.codesPostaux = [];
      return;
    }

    this.codesPostaux = [];

    this.communesService.getCodesPostaux(val).then((data: any) => {
      this.codesPostaux = data;
    });
  }

  watchBirthPlace(e) {
    this.selectedCommune = {
      id: 0,
      nom: '',
      code_insee: ''
    };
    let val = e.target.value;
    if (val.length == 0) {
      this.communes = [];
      return;
    }
    this.communes = [];

    this.communesService.getCommunesByTerm(val, this.selectedBirthDep).then((data: any) => {
      this.communes = data;
    });
  }

  watchBirthCountry() {
    this.isFrench = (this.index === "33");
    this.indexForForeigner = "99" + " " + this.index;
    this.selectedBirthDep = null;
    this.departments = [];
    this.selectedCommune = null;
    this.communes = [];
    this.birthplace = null;
    this.isCIN = (this.isEuropean === 0);
  }

  watchBirthDep(e) {
    this.selectedBirthDep = {
      id: 0,
      nom: '',
      numero: ''
    };
    let val = e.target.value;
    if (val.length == 0) {
      this.departments = [];
      return;
    }
    this.departments = [];

    this.communesService.getDepartmentsByTerm(val).then((data: any) => {
      this.departments = data;
    });
  }

  departmentSelected(dep) {
    this.birthdep = dep.numero;
    this.selectedBirthDep = dep;
    this.departments = [];

    this.communes = [];
    this.birthplace = '';
    this.selectedCommune = {
      id: 0,
      nom: '',
      code_insee: ''
    };
  }

  convSelected(c) {
    this.convObject = c;
    this.conventionId = c.id;
    this.convention = c.code + " - " + c.libelle;
    this.conventions = [];
  }

  cpSelected(c) {
    this.selectedCP = c.id;
    this.birthcp = c.code;
    this.codesPostaux = [];

    //  Init communes list
    this.communes = [];
    this.birthplace = '';
    this.selectedCommune = {
      id: 0,
      nom: '',
      code_insee: ''
    };
  }

  communeSelected(commune) {
    this.birthplace = commune.nom;
    this.selectedCommune = commune;
    this.communes = [];
    if(!this.isEmployer){
      this.showNSSError();
    }
  }

  ionViewDidEnter() {
    //in case of user has already signed up
    this.initCivilityForm();
  }

  titleChange() {
    if (this.title) {
      this.titlestyle = {
        'font-size': '1.4rem'
      }
      if(!this.isEmployer) {
        this.showNSSError();
      }
    }
    else {
      this.titlestyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
    }
  }

  /**
   * @description initiate the civility form with the data of the logged user
   */
  initCivilityForm() {
    this.storage.get(this.currentUserVar).then((value) => {
      if (value && value != "null") {
        this.currentUser = JSON.parse(value);
        this.title = this.currentUser.titre;
        if (this.title) this.titlestyle = {'font-size': '1.4rem'};
        else this.titlestyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
        this.lastname = this.currentUser.nom;
        this.firstname = this.currentUser.prenom;
        if (!this.isRecruiter && this.isEmployer && this.currentUser.employer.entreprises.length != 0) {
          this.companyname = this.currentUser.employer.entreprises[0].nom;
          this.siret = this.currentUser.employer.entreprises[0].siret;
          this.ape = this.currentUser.employer.entreprises[0].naf;
          this.medecineService.getMedecine(this.currentUser.employer.entreprises[0].id).then((data: {id: any, libelle: string}) => {
            if (data && data != null) {
              this.medecineId = data.id;
              this.medecineTravail = data.libelle;
            }

          });
          if (this.currentUser.employer.entreprises[0].conventionCollective &&
            this.currentUser.employer.entreprises[0].conventionCollective.id > 0) {
            this.convention = this.currentUser.employer.entreprises[0].conventionCollective.code + " - " +
              this.currentUser.employer.entreprises[0].conventionCollective.libelle;
            this.conventionId = this.currentUser.employer.entreprises[0].conventionCollective.id;
          }
        } else {
          if (!this.isRecruiter) {
            this.uploadCVVerb = (Utils.isEmpty(this.currentUser.jobyer.cv) ? "Charger" : "Recharger");
            this.cvUri = this.currentUser.jobyer.cv;
            this.profileService.loadAdditionalUserInformations(this.currentUser.jobyer.id).then((data: any) => {
              data = data.data[0];
              if (!Utils.isEmpty(data.fk_user_pays)) {
                this.index = this.profileService.getCountryById(data.fk_user_pays, this.pays).indicatif_telephonique;
                this.indexForForeigner = "99" + " " + this.index;
              }
              this.regionId = data.fk_user_identifiants_nationalite;
              this.isEuropean = this.regionId == "42" ? 1 : 0;
              if (this.isEuropean == 0) {
                this.idNationaliteLabel = "EU, EEE";
              }
              if (this.isEuropean == 1) {
                this.idNationaliteLabel = "Autre";
              }
              this.isResident = (data.est_resident == 'Oui' ? "1" : "0");
              this.isCIN = !Utils.isEmpty(data.numero_titre_sejour) ? "0" : "1";
              this.numStay = !Utils.isEmpty(data.numero_titre_sejour) ? data.numero_titre_sejour : "";
              if (this.index === "33") {
                this.isFrench = true;
                this.communesService.getDepartmentById(data.fk_user_departement).then((deps: Array<any>) => {
                  if (deps && deps.length > 0) {
                    this.selectedBirthDep = deps[0];
                    this.birthdep = deps[0].numero
                  }
                });
              } else {
                this.isFrench = false;
              }
              this.birthplace = (this.isFrench ? this.currentUser.jobyer.lieuNaissance : null);
              if (this.birthplace && this.birthplace != 'null' && !this.isRecruiter) {

                this.communesService.getCommune(this.birthplace).then((data: Array<any>) => {
                  if (data && data.length > 0) {
                    this.selectedCommune = data[0];
                    if (this.selectedCommune.fk_user_code_postal && this.selectedCommune.fk_user_code_postal != "null") {
                      this.selectedCP = parseInt(this.selectedCommune.fk_user_code_postal);
                      this.birthcp = this.selectedCommune.code;
                    } else {
                      this.selectedCP = 0;
                      this.birthcp = '';
                    }
                  }
                  this.checkSS = true;
                });
              } else
                this.checkSS = true;
              this.prefecture = data.instance_delivrance;
            });


            if (this.currentUser.jobyer.dateNaissance) {
              if (this.platform.version('android').major < 5) {
                this.birthdate = new Date(this.currentUser.jobyer.dateNaissance).toLocaleDateString('fr-FR', null);
              } else {
                this.birthdate = new Date(this.currentUser.jobyer.dateNaissance).toISOString();
              }
            } else {
              this.birthdate = "";
            }
            //this.birthdate = this.currentUser.jobyer.dateNaissance ?  : "";

            this.cni = this.currentUser.jobyer.cni;
            this.numSS = this.currentUser.jobyer.numSS;
            this.nationality = this.currentUser.jobyer.natId == 0 ? 91 : parseInt(this.currentUser.jobyer.natId);
            if (this.nationality) this.nationalitiesstyle = {'font-size': '1.4rem'};
            else this.nationalitiesstyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
          }

          let jobyer = this.currentUser.jobyer;
          if (jobyer.auTS && jobyer.auTS != 'null') {
            let d = new Date(jobyer.auTS);
            let month = (d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : "" + (d.getMonth() + 1);
            let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
            this.tsejToDate = d.getFullYear() + "-" + month + "-" + day;
          }
          if (jobyer.duTS && jobyer.duTS != 'null') {
            let d = new Date(jobyer.duTS);
            let month = (d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : "" + (d.getMonth() + 1);
            let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
            this.tsejFromDate = d.getFullYear() + "-" + month + "-" + day;
          }
          if (jobyer.delivranceTS && jobyer.delivranceTS != 'null') {
            let d = new Date(jobyer.delivranceTS);
            let month = (d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : "" + (d.getMonth() + 1);
            let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
            this.tsejProvideDate = d.getFullYear() + "-" + month + "-" + day;
          }

          if (jobyer.identifiantNationalite && jobyer.identifiantNationalite > 0) {
            this.idnationality = jobyer.identifiantNationalite;
            if (jobyer.identifiantNationalite > 40) {
              this.isFrench = false;
            }
            if (jobyer.identifiantNationalite > 41) {
              this.isEU = false;
            }

          }

          //cv && nb work and study hours
          this.nbWorkHours = this.currentUser.jobyer.nbWorkHours;
          this.nbWorkVitOnJob = this.currentUser.jobyer.nbVitOnJobHours/60;
          this.isNbStudyHoursBig = "" + this.currentUser.jobyer.nbStudyHoursBig + "";
        }
        if (!this.isRecruiter) {
          if (this.currentUser.scanUploaded) {
            this.uploadVerb = "Recharger "
          } else {
            this.uploadVerb = "Charger "
          }
        }
      }
    });
  }

  checkGender() {
    let indicator = this.numSS.charAt(0);
    if ((indicator == '1' && this.title == 'M.') || (indicator == '2' && this.title != 'M.'))
      return true;
    else
      return false;
  }

  checkBirthYear() {
    let indicator = this.numSS.charAt(1) + this.numSS.charAt(2);
    //
    let birthYear = (this.platform.version('android').major < 5 ) ? this.birthdate.split('/')[2] : this.birthdate.split('-')[0];
    birthYear = birthYear.substr(2);
    if (indicator == birthYear)
      return true;
    else
      return false;
  }

  checkBirthMonth() {
    let indicator = this.numSS.charAt(3) + this.numSS.charAt(4);
    //
    let birthMonth = (this.platform.version('android').major < 5 ) ? this.birthdate.split('/')[1] : this.birthdate.split('-')[1];
    if (birthMonth.length == 1)
      birthMonth = "0" + birthMonth;
    if (indicator == birthMonth)
      return true;
    else
      return false;
  }

  checkINSEE() {
    let indicator = this.numSS.substr(5, 5);
    if (this.selectedCommune && this.selectedCommune.id != '0') {
      if (indicator != this.selectedCommune.code_insee)
        return false;
      else
        return true;
    }
    if (indicator.charAt(0) != '9')
      return false;
    else
      return true;
  }

  checkModKey() {
    try {
      let indicator = this.numSS.substr(0, 13);
      let key = this.numSS.substr(13);
      let number = parseInt(indicator);
      let nkey = parseInt(key);
      let modulo = number % 97;
      if (nkey == 97 - modulo)
        return true;
      else
        return false;
    }
    catch (err) {
      return false;
    }
  }

  showResetPasswordModal() {
    let m = this.modal.create(ModalUpdatePassword, {enableBackdropDismiss: false, showBackdrop: false});
    m.present();
  }

  /**
   * @description update civility information for employer and jobyer
   */
  updateCivility() {
    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present(loading);
    if (this.isRecruiter) {
      this.authService.updateRecruiterCivility(this.title, this.lastname, this.firstname, this.currentUser.id).then((data: {status: string, error: string}) => {
        if (!data || data.status == "failure") {
          console.log(data.error);
          loading.dismiss();
          this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
          return;
        } else {
          // data saved
          console.log("response update civility : " + data.status);
          this.currentUser.titre = this.title;
          this.currentUser.nom = this.lastname;
          this.currentUser.prenom = this.firstname;
          this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
          this.events.publish('user:civility', this.currentUser);
          loading.dismiss();
          console.log(this.currentUser,"***",this.fromPage);
          if (this.fromPage == "profil") {
            this.nav.pop();
          }
          if(this.currentUser.changePassword == true){
              this.showResetPasswordModal();
          }
        }
      });
      return;
    }
    if (this.isEmployer) {
      //get the role id
       let employerId = this.currentUser.employer.id;
      //get entreprise id of the current employer
       let entrepriseId = this.currentUser.employer.entreprises[0].id;
      // update employer
      this.authService.updateEmployerCivility(this.title, this.lastname, this.firstname, this.companyname,
        this.siret, this.ape, employerId, entrepriseId, this.projectTarget, this.medecineId, this.conventionId, this.collective_heure_hebdo)
        .then((data: {status: string, error: string}) => {
          if (!data || data.status == "failure") {
            console.log(data.error);
            loading.dismiss();
            this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
            return;
          } else {
            // data saved
            console.log("response update civility : " + data.status);
            this.currentUser.titre = this.title;
            this.currentUser.nom = this.lastname;
            this.currentUser.prenom = this.firstname;
            this.currentUser.employer.entreprises[0].nom = this.companyname;
            this.currentUser.employer.entreprises[0].siret = this.siret;
            this.currentUser.employer.entreprises[0].naf = this.ape;
            this.currentUser.employer.entreprises[0].conventionCollective = this.convObject;
            // Convention
            let code = '';
            let libelle = '';
            if (this.conventionId && this.conventionId > 0) {
              for (let i = 0; i < this.conventions.length; i++)
                if (this.conventions[i].id == this.conventionId) {
                  code = this.conventions[i].code;
                  libelle = this.conventions[i].libelle;
                  break;
                }
            }

            this.currentUser.employer.entreprises[0].conventionCollective = {
              id: this.conventionId,
              code: code,
              libelle: libelle
            };
            //upload scan
            this.updateScan(employerId);
            // PUT IN SESSION
            this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
            this.events.publish('user:civility', this.currentUser);
            loading.dismiss();
            if (this.fromPage == "profil" && !this.company) {
              this.nav.pop();
            } else {
              //redirecting to personal address tab
              //this.tabs.select(1);
              let jobyer = this.params.data.jobyer;
              let searchIndex = this.params.data.searchIndex;
              let obj = this.params.data.obj;
              let offer = this.params.data.currentOffer;
              this.nav.push(PersonalAddressPage, {
                jobyer: jobyer,
                obj: obj,
                searchIndex: searchIndex,
                currentOffer: offer,
                company: this.company,
                fromPage: this.fromPage
              });
            }
          }
        });
    } else {
      if (!this.isRecruiter) {
        //get the role id
         let jobyerId = this.currentUser.jobyer.id;
        // update jobyer
        let birthCountryId;
        if (this.index)
          birthCountryId = this.profileService.getCountryByIndex(this.index, this.pays).id;
        let isResident = (this.isResident == 0 ? 'Non' : 'Oui');
        let regionId;
        if (!this.regionId) {
          if (this.isEuropean == 1) {
            //etranger
            regionId = 42;
          } else {
            regionId = 41;
          }
        } else {
          regionId = this.regionId;
        }
        let birthdepId = !Utils.isEmpty(this.selectedBirthDep) ? this.selectedBirthDep.id : null;
        this.cni = this.isCIN == 0 ? "" : this.cni;
        this.numStay = this.isCIN == 0 ? this.numStay : "";
        let studyHoursBigValue = (this.isNbStudyHoursBig == "true"? "OUI" : "NON");

        this.authService.updateJobyerCivility(this.title, this.lastname, this.firstname, this.numSS, this.cni,
          this.nationality, jobyerId, this.birthdate, this.birthplace, this.prefecture, this.tsejProvideDate,
          this.tsejFromDate, this.tsejToDate, birthdepId, this.numStay, birthCountryId, regionId, isResident, this.nbWorkHours, studyHoursBigValue, this.cvUri)
          .then((data: {status: string, error: string}) => {
            if (!data || data.status == "failure") {
              console.log(data.error);
              loading.dismiss();
              this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
              return;
            } else {
              // data saved
              console.log("response update civility : " + data.status);
              this.currentUser.titre = this.title;
              this.currentUser.nom = this.lastname;
              this.currentUser.prenom = this.firstname;
              this.currentUser.jobyer.cni = this.cni;
              this.currentUser.jobyer.numSS = this.numSS;
              this.currentUser.jobyer.natId = this.nationality;
              this.currentUser.jobyer.cv = this.cvUri;


              if (this.idnationality > 0)
                this.currentUser.jobyer.identifiantNationalite = this.idnationality;
              if (this.prefecture > 0)
                this.currentUser.jobyer.idPrefecture = this.prefecture;
              if (this.tsejFromDate)
                this.currentUser.jobyer.duTS = (new Date(this.tsejFromDate)).getTime();
              if (this.tsejToDate)
                this.currentUser.jobyer.auTS = (new Date(this.tsejToDate)).getTime();
              if (this.tsejProvideDate)
                this.currentUser.jobyer.delivranceTS = (new Date(this.tsejProvideDate)).getTime();


              //this.currentUser.jobyer.natLibelle = this.nationality;
              //
              if (this.platform.version('android').major < 5) {
                let birth = new Date(this.birthdate.split('/')[1] + '-' +
                  this.birthdate.split('/')[0] + '-' +
                  this.birthdate.split('/')[2]);
                this.currentUser.jobyer.dateNaissance = birth.toISOString();

              } else {
                this.currentUser.jobyer.dateNaissance = this.birthdate;
              }
              this.currentUser.jobyer.lieuNaissance = this.birthplace;
              this.currentUser.jobyer.nbWorkHours = this.nbWorkHours;
              this.currentUser.jobyer.nbVitOnJobHours = this.nbWorkVitOnJob * 60;
              this.currentUser.jobyer.nbStudyHoursBig = (this.isNbStudyHoursBig == "true" ? true : false);

              //upload scan
              this.updateScan(jobyerId);
              // PUT IN SESSION
              this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
              this.events.publish('user:civility', this.currentUser);
              loading.dismiss();
              if (this.fromPage == "profil") {
                this.nav.pop();
              } else {
                //redirecting to personal address tab
                this.nav.push(PersonalAddressPage);
              }
            }
          });
      }
    }
  }

  /**
   * @description upload scan and attach ot to the current user
   */
  updateScan(userId) {
    if (this.scanUri) {
      this.currentUser.scanUploaded = true;
      this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
      this.authService.uploadScan(this.scanUri, userId, 'scan', 'upload')
        .then((data: {status: string}) => {
          if (!data || data.status == "failure") {
            console.log("Scan upload failed !");
            //this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde du scan");
            this.currentUser.scanUploaded = false;
            this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
          }
          else {
            console.log("Scan uploaded !");
          }

        });
      this.storage.get(this.currentUserVar).then(usr => {
        if (usr) {
          let user = JSON.parse(usr);
          this.attachementService.uploadFile(user, 'scan ' + this.scanTitle, this.scanUri);
        }
      });

    }
  }

  /**
   * @description function called to decide if the validate button should be disabled or not
   */
  isUpdateDisabled() {
    if (this.isRecruiter) {
      return (!this.title || !this.firstname || !this.lastname);
    }
    if (this.isEmployer) {
      return (!this.title || !this.firstname || !this.lastname || !this.companyname || (this.siret && this.siret.length < 17) || (this.ape && (this.ape.length < 5 || !this.isAPEValid)) || !this.isValideFirstName || !this.isValideLastName);
    } else {
      if (!this.title || !this.firstname || !this.lastname || (!this.isValidCni && this.cni) || (this.numSS && this.numSS.length != 15 && this.numSS.length != 0) || !this.isValideFirstName || !this.isValideLastName) {
        return true;
      }
      if (this.numSS && (!this.checkGender() || !this.checkBirthYear() || !this.checkBirthMonth() || !this.checkINSEE() || !this.checkModKey())) {
        return true;
      }
      return false;
    }
  }

  /**
   * @description watch and validate the "num de sécurité social" field
   */
  watchNumSS(e) {
    if (this.isEmployer)
      return;
    let s = e.target.value;
    if (s.length > 15) {
      s = s.substring(0, 15);
      e.target.value = s;
      this.numSS = e.target.value;
      return;
    }
    if (s.indexOf('.') != -1) {
      s = s.replace('.', '');
      e.target.value = s;
      this.numSS = e.target.value;
      return;
    }
    if (e.keyCode < 48 || e.keyCode > 57) {
      e.preventDefault();
      return;
    }
    if (!this.numSS) {
      return;
    }
  }

  /**
   * @description watch and validate the cni field
   */
  watchCNI(e) {
    let s = e.target.value;
    if (s.length > 12) {
      s = s.substring(0, 12);
      e.target.value = s;
      this.cni = e.target.value;
      return;
    }
    if (s.indexOf('.') != -1) {
      s = s.replace('.', '');
      e.target.value = s;
      this.cni = e.target.value;
      return;
    }
    /*if (e.keyCode < 48 || e.keyCode > 57) {
     e.preventDefault();
     return;
     }*/
  }

  /**
   * @description watch and validate the siret field
   */
  watchSIRET(e) {
    let s = e.target.value;
    if (s.length != 17) {
      this.isSIRETValid = false;
    }
    if (e.keyCode == 8) {
      e.preventDefault();
      return;
    }
    for (let i = 0; i < s.length; i++) {
      if (i == 3 || i == 7 || i == 11) {
        if (s[i] != ' ') {
          s = s.replace(s[i], ' ');
        }
        continue;
      }
      if (!this.isNumeric(s[i])) {
        s = s.replace(s[i], '');
      }
    }
    if (s.length == 3) {
      s = s + " ";
    }
    if (s.length == 7) {
      s = s + " ";
    }
    if (s.length == 11) {
      s = s + " ";
    }
    e.target.value = s;

    if (s.length == 17) {
      this.isSIRETValid = true;
    }
  }

  /**
   * @description watch and validate the ape or naf field
   */
  watchAPE(e) {
    // let s = this.ape;
    let s = e.target.value;
    //this is not woring on android, because of the predective text
    /*s = s.substring(0, 5);
     for( let i = 0; i < s.length; i++){
     if(i < 4 && !this.isNumeric(s[i])){
     s = s.replace(s[i], '');
     continue;
     }
     if(i == 4 && !this.isLetter(s[i])){
     s = s.replace(s[i], '');
     continue;
     }
     }*/
    //check if ape valid
    if (this.isNumeric(s.substring(0, 4)) && this.isLetter(s.substring(4, 5)) && s.length == 5) {
      e.target.value = this.changeToUppercase(s);
      this.isAPEValid = true;
    } else {
      this.isAPEValid = false;
    }

  }

  watchLastName(e) {
    let name = e.target.value;
    this.isValideLastName = CivilityPage.isValidName(name);
  }

  watchFirstName(e) {
    let name = e.target.value;
    this.isValideFirstName = CivilityPage.isValidName(name);
  }

  static isValidName(name: string) {
    let regEx = /^[A-Za-zÀ-ú.' \-\p{L}\p{Zs}\p{Lu}\p{Ll}']+$/;
    return !(name.match(regEx) == null);
  }

  isNumeric(n) {
    let numbers = /^[0-9]+$/;
    if (n.match(numbers)) {
      return true;
    }
    else {
      return false;
    }
  }

  isLetter(s) {
    let letters = /^[A-Za-z]+$/;
    if (s.match(letters)) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * @description change the ape data to uppercase
   */
  changeToUppercase(s) {
    return s.toUpperCase();
  }

  /**
   * @description show error msg for cni field
   */
  showCNIError() {
    if (!Utils.isEmpty(this.cni) && !this.isValidCni) {
      return true;
    }
  }

  /**
   * Watches National identity card / passport number
   * @param e
   */
  watchOfficialDocument(e) {
    let officialDocChecked = AccountConstraints.checkOfficialDocument(e);
    this.isValidCni = officialDocChecked.isValid;
    this.cniHint = officialDocChecked.hint;
  }


  /**
   * @description show error msg for num ss field
   */
  showNSSError() {
    this.numSSMessage = '';
    if (this.isEmployer || !this.checkSS || (this.numSS && this.numSS.length == 0)) {
      this.numSSMessage = '';

      return false;
    }

    if (!this.numSS || this.numSS.length != 15) {
      this.numSSMessage = '* Saisissez les 15 chiffres du n° SS';
      return true;
    }

    let correct = this.checkGender();
    if (!correct) {
      this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
      return true;
    }
    correct = this.checkBirthYear();
    if (!correct) {
      this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
      return true;
    }
    correct = this.checkBirthMonth();
    if (!correct) {
      this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
      return true;
    }
    correct = this.checkINSEE();
    if (!correct) {
      this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
      return true;
    }
    correct = this.checkModKey();
    if (!correct) {
      this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
      return true;
    }
    return false;
  }

  /**
   * @description read the file to upload and convert it to base64
   */
  onChangeUpload(e) {
     let file = e.target.files[0];
     let myReader = new FileReader();
    this.zone.run(() => {
      myReader.onloadend = (e) => {
        this.scanUri = myReader.result;
      }
      myReader.readAsDataURL(file);
    });
  }

  onChangeCVUpload(e) {
    let file = e.target.files[0];
    let myReader = new FileReader();
    this.zone.run(() => {
      myReader.onloadend = (e) => {
        this.cvUri = myReader.result;
      }
      myReader.readAsDataURL(file);
    });
  }

  /**
   * @description trigged when the user take a picture of the scan, the image taken is base64
   */
  takePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
      this.zone.run(() => {
        // imageData is a base64 encoded string
        this.scanUri = "data:image/jpeg;base64," + imageData;
      });
    }, (err) => {
      console.log(err);
    });
  }

  /**
   * @description change the title of the scan buttton according to the selected nationality
   */
  onChangeNationality(e) {
    this.profileService.getIdentifiantNationalityByNationality(e).then((data: any) => {
      this.isEuropean = data.data[0].pk_user_identifiants_nationalite == "42" ? 1 : 0;
      this.regionId = data.data[0].pk_user_identifiants_nationalite;
      if (this.isEuropean == 0) {
        this.idNationaliteLabel = "EU, EEE";
        this.scanTitle = " de votre CNI ou Passeport";
      }
      if (this.isEuropean == 1) {
        this.idNationaliteLabel = "Autre";
        this.scanTitle = " de votre titre de séjour";
      }
    });

    if (this.nationality) {
      this.nationalitiesstyle = {
        'font-size': '1.4rem'
      }
    } else {
      this.nationalitiesstyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
    }
  }

  /**
   * Changed the id nationality
   * @param e event
   */
  onChangeIDNationality(e) {
    if (this.idnationality > 41)
      this.isEU = false;
  }

  /**
   * @description remove data to scanUri
   */
  onDelete(e) {
    this.scanUri = null;
     let fileinput = document.getElementById('fileinput');
    (<HTMLInputElement>fileinput).value = "";
  }

  /**
   * @description show modal
   */
  showModal() {
    let modal = this.modal.create(ModalGalleryPage, {scanUri: this.scanUri});
    modal.present();
  }

  watchMedecineTravail(e) {

    let val = e.target.value;
    if (val.length < 3) {
      this.medecines = [];
      return;
    }
    console.log(val);
    this.medecines = [];
    this.medecineService.autocomplete(val).then((data: any) => {
      this.medecines = data;
      console.log(JSON.stringify(this.medecines));
    });
  }

  medecineSelected(c) {
    this.medecineId = c.id;
    this.medecineTravail = c.libelle;
    this.medecines = [];
  }

  /**
   * launching dateTimePicker component for slot selection
   */
  launchDateTimePicker(type:string, flag?:string) {

    DatePicker.show({
      date: new Date(),
      mode: type,
      minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour: true,
      doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
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
            this.showedSlot.date = this.toDateString(this.slot.date.getTime(), '');
            this.showedSlot.angular4Date = this.toDateString(this.slot.date.getTime(), '');
            break;
        }
      },
      err => console.log("Error occurred while getting date:", err)
    );
  }

  IsCompanyExist(e, field) {
    //verify if company exists
    if (field == "companyname") {
      this.profileService.countEntreprisesByRaisonSocial(this.companyname).then((data: {data: Array<any>}) => {
        if (data.data[0].count != 0 && this.companyname != this.currentUser.employer.entreprises[0].nom) {
          if (!this.isEmpty(this.currentUser.employer.entreprises[0].nom)) {
            this.globalService.showAlertValidation("Vit-On-Job", "L'entreprise " + this.companyname + " existe déjà. Veuillez saisir une autre raison sociale.");
            this.companyname = this.currentUser.employer.entreprises[0].nom;
          } else {
            this.displayCompanyAlert('companyname');
          }
        } else {
          return;
        }
      })
    } else {
      this.profileService.countEntreprisesBySIRET(this.siret).then((data: {data: Array<any>}) => {
        if (data.data[0].count != 0 && this.siret != this.currentUser.employer.entreprises[0].siret) {
          if (!this.isEmpty(this.currentUser.employer.entreprises[0].nom)) {
            this.globalService.showAlertValidation("Vit-On-Job", "Le SIRET " + this.siret + " existe déjà. Veuillez en saisir un autre.");
            this.siret = this.currentUser.employer.entreprises[0].siret;
          } else {
            this.displayCompanyAlert('siret');
          }
        } else {
          return;
        }
      })
    }
  }

  displayCompanyAlert(field) {
    let confirm = this.alert.create({
      title: "Vit-On-Job",
      message: (field == "siret" ? ("Le SIRET " + this.siret) : ("La raison sociale " + this.companyname)) + " existe déjà. Si vous continuez, ce compte sera bloqué, \n sinon veuillez en saisir " + (field == "siret" ? "un " : "une ") + "autre. \n Voulez vous continuez?",
      buttons: [
        {
          text: 'Non',
          handler: () => {
            (field == "siret" ? (this.siret = this.currentUser.employer.entreprises[0].siret) : (this.companyname = this.currentUser.employer.entreprises[0].nom));
            console.log('No clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            console.log('Yes clicked');
            confirm.dismiss().then(() => {
              this.displayCompanyLastAlert(field);
            })
          }
        }
      ]
    });
    confirm.present();
  }

  displayCompanyLastAlert(field) {
    let confirm = this.alert.create({
      title: "Vit-On-Job",
      message: "Votre compte sera bloqué. \n Voulez vous vraiment continuez?",
      buttons: [
        {
          text: 'Non',
          handler: () => {
            (field == "siret" ? (this.siret = this.currentUser.employer.entreprises[0].siret) : (this.companyname = this.currentUser.employer.entreprises[0].nom));
            console.log('No clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            console.log('Yes clicked');
            confirm.dismiss().then(() => {
              this.profileService.deleteEmployerAccount(this.currentUser.id, this.currentUser.employer.id).then((data: any) => {
                this.storage.set(this.currentUserVar, null);
                this.storage.set("RECRUITER_LIST", null);
                this.events.publish('user:logout');
                this.nav.setRoot(HomePage);
              });
            })
          }
        }
      ]
    });
    confirm.present();
  }

  watchBirthdate(e) {
    this.isBirthdateValid = true;
     let ageDifMs = Date.now() - new Date(this.birthdate).getTime();
     let ageDate = new Date(ageDifMs); // miliseconds from epoch
     let diff = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (diff < 18) {
      this.isBirthdateValid = false;
    }
    if(!this.isEmployer){
      this.showNSSError();
    }
  }

  watchTsejProvideDate(e) {

    let provDate = new Date(this.tsejProvideDate);
    let d = provDate.getDate() < 10 ? "0" + provDate.getDate() : "" + provDate.getDate();
    let m = (provDate.getMonth() + 1) < 10 ? "0" + (provDate.getMonth() + 1) : "" + (provDate.getMonth() + 1);
    this.mintsejFromDate = provDate.getFullYear() + "-" + m + "-" + d;
    let minD = new Date(this.mintsejFromDate);
    this.maxtsejFromDate = (provDate.getFullYear()) + "-12-31";
    let maxD = new Date(this.maxtsejFromDate);
    let fromDate = new Date(this.tsejFromDate);
    if (fromDate) {
      if (fromDate.getFullYear() < minD.getFullYear() || fromDate.getFullYear() > maxD.getFullYear()) {
        this.tsejFromDate = null;
      }
    }

    this.mintsejToDate = this.mintsejFromDate;
    this.maxtsejToDate = (provDate.getFullYear() + 73) + "-12-31";

    this.tsejFromDate = this.tsejProvideDate;
  }

  watchTsejFromDate(e) {
    let fromDate = new Date(this.tsejFromDate);
    let d = fromDate.getDate() < 10 ? "0" + fromDate.getDate() : "" + fromDate.getDate();
    let m = (fromDate.getMonth() + 1) < 10 ? "0" + (fromDate.getMonth() + 1) : "" + (fromDate.getMonth() + 1);

    this.mintsejToDate = (fromDate.getFullYear()) + "-" + m + "-" + d;
    this.maxtsejToDate = (fromDate.getFullYear() + 73) + "-12-31";

    this.tsejToDate = this.tsejFromDate;
  }

  openCoporamaModal() {
    let modal = this.modal.create(ModalCorporamaSearchPage);
    modal.present();
    modal.onDidDismiss((data: any) => {
      if (!data) {
        return;
      }
      this.company = data;
      this.title = (this.company.title == "M" ? "M." : this.company.title);
      this.lastname = this.company.lastname;
      this.firstname = this.company.firstname;
      this.companyname = this.company.name;
      this.siret = Utils.formatSIREN(this.company.siren);
      this.ape = this.company.naf;
      //check fields validity
      this.IsCompanyExist(this.companyname, 'companyname');
      this.isSIRETValid = false; //because the field is filled with SIREN

    })
  }

  downloadCV(){
    let content = this.cvUri.split(',')[1];
    let cvBase64SecondPart = this.cvUri.split('/')[1];
    let contentType = cvBase64SecondPart.split(';')[0];
    let folderpath = cordova.file.externalRootDirectory;

    // Convert the base64 string in a Blob
    var DataBlob = FileUtils.b64toBlob(content, contentType);
    console.log("Starting to write the file");
    window.resolveLocalFileSystemURL(folderpath, (dir) => {
      console.log("Access to the directory granted succesfully");
      dir.getFile("Cv-Vit-On-Job." + contentType, {create: true}, (file) => {
        console.log("File created succesfully.");
        file.createWriter((fileWriter) => {
          console.log("Writing content to file");
          fileWriter.write(DataBlob);
          this.presentToast("Document sauvegardé dans le stockage local de votre appareil.", 3);
        }, () => {
          this.presentToast("Une erreur est survenue lors du téléchargement. Veuillez réessayer.", 3);
        });
      });
    });
  }

  deleteCV(){
    this.cvUri = "";
  }

  /**
   * @Description Converts a timeStamp to date string :
   * @param date : a timestamp date
   * @param options Date options
   */
  toDateString(date: number, options: any) {
    let d = new Date(date);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  }

  isEmpty(str) {
    return Utils.isEmpty(str);
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

  presentToast(message: string, duration?: number, position?: string) {
    if (!duration)
      duration = 3;
    let toast = this.toast.create({
      message: message,
      position: position,
      dismissOnPageChange: true,
      showCloseButton: true,
      closeButtonText: "Ok",
      duration: duration * 1000
    });
    toast.present();
  }
}
