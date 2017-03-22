import {NavController, NavParams, ActionSheetController, ModalController, LoadingController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {UserService} from "../../providers/user-service/user-service";
import {CivilityPage} from "../civility/civility";
import {JobAddressPage} from "../job-address/job-address";
import {PersonalAddressPage} from "../personal-address/personal-address";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {ModalOffersPage} from "../modal-offers/modal-offers";
import {ContractService} from "../../providers/contract-service/contract-service";
import {Component} from "@angular/core";
import {MedecineService} from "../../providers/medecine-service/medecine-service";
import {ParametersService} from "../../providers/parameters-service/parameters-service";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Utils} from "../../utils/utils";
import {DateUtils} from "../../utils/date-utils";
import {Contract} from "../../dto/contract";
import {GlobalService} from "../../providers/global-service/global-service";
import {FinanceService} from "../../providers/finance-service/finance-service";
import {ContractListPage} from "../contract-list/contract-list";
import {ContractEpiPage} from "./contract-epi/contract-epi";

/**
 * @author daoudi amine
 * @description Generate contract informations and call yousign service
 * @module Contract
 */
@Component({
  templateUrl: 'contract.html'
})
export class ContractPage {

  public numContrat: string = '';
  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;
  public employer: any;
  public jobyer: any;
  public companyName: string;
  public currentUser: any;
  public employerFullName: string;
  public jobyerFirstName: string;
  public jobyerLastName: string;
  public contractTitle: string;
  public contractData: Contract = new Contract();
  public currentOffer: any;
  public workAdress: any;
  public jobyerBirthDate: string;
  public hqAdress: string;
  public rate: number = 0.0;
  public recours: any;
  public justificatifs: any;
  public periodicites: any = [];
  public embaucheAutorise: boolean;
  public rapatriement: boolean;
  public modal: any;
  public actionSheet: any;
  public transportMeans = [];

  //jobyer info
  public isFrench: boolean;
  public isEuropean: boolean;
  public isCIN: boolean;
  public labelTitreIdentite: String;

  //epi
  public savedEpis: any[] = [];

  constructor(public gc: GlobalConfigs,
              public nav: NavController,
              private navParams: NavParams,
              private userService: UserService,
              private contractService: ContractService,
              private medecineService: MedecineService,
              private service: ParametersService,
              private offersService: OffersService,
              private _modal: ModalController,
              private _actionSheet: ActionSheetController,
              private globalService: GlobalService,
              public financeService: FinanceService,
              public loading: LoadingController) {

    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    this.themeColor = config.themeColor;
    this.contractTitle = "Contrat de Mission";
    this.isEmployer = (this.projectTarget == 'employer');
    this.modal = _modal;
    this.actionSheet = _actionSheet;

    this.jobyer = this.navParams.get('jobyer');

    // initialize contract data
    this.initContractData();

    //initialize recruitment data
    this.initRecruitmentData();

    this.transportMeans = [
      "Véhicule",
      "Transport en commun Zone 1 à 2",
      "Transport en commun Zone 1 à 3",
      "Transport en commun Zone 1 à 4",
      "Transport en commun Zone 1 à 5",
      "Transport en commun Zone 2 à 3",
      "Transport en commun Zone 3 à 4",
      "Transport en commun Zone 4 à 5",
      "Transport en commun toutes zones"
    ];
  }

  initContractData(){
    //  check if there is a current offer
    if (this.navParams.get("currentOffer") && !isUndefined(this.navParams.get("currentOffer"))) {
      this.currentOffer = this.navParams.get("currentOffer");

      this.contractData.missionStartDate = this.getStartDate();
      this.contractData.missionEndDate = this.getEndDate();
      this.contractData.termStartDate = this.getEndDate();
      this.contractData.termEndDate = this.getEndDate();

      this.contractData.qualification = this.currentOffer.title;
      this.contractData.baseSalary = +Utils.parseNumber(this.currentOffer.jobData.remuneration).toFixed(2);
      this.contractData.salaryNHours = Utils.parseNumber(this.currentOffer.jobData.remuneration).toFixed(2) + " € B/H";
      this.contractData.sector = this.currentOffer.jobData.sector;
      this.contractData.titre = this.currentOffer.title;

      this.contractData.workTimeHours = this.calculateOfferHours();
      this.initTrialPeriod(this.currentOffer);

      this.offersService.getOfferInfo(this.currentOffer.idOffer).then((data: any) =>{
        this.contractData.contactPhone = data.telephone;
        this.contractData.offerContact = data.contact;
        this.contractData.sector = data.secteur;
      });
    }
  }

  initRecruitmentData(){
    // get the currentEmployer
    this.userService.getCurrentUser(this.projectTarget).then(results => {
      this.currentUser = JSON.parse(results);

      if (this.currentUser) {
        this.employer = this.currentUser.employer;

        //init employer data
        this.companyName = this.employer.entreprises[0].nom;
        this.contractData.companyName = this.companyName;

        this.hqAdress = this.employer.entreprises[0].siegeAdress.fullAdress;
        this.contractData.headOffice = this.hqAdress;

        let civility = this.currentUser.titre;
        this.employerFullName = civility + " " + this.currentUser.nom + " " + this.currentUser.prenom;
        this.contractData.contact = this.employerFullName;

        //init jobyer data
        this.initJobyerData();
      }
    });
  }

  initJobyerData(){
    let bd = new Date(this.jobyer.dateNaissance);
    this.jobyerBirthDate = DateUtils.dateFormat(bd);
    this.contractData.jobyerBirthDate = this.jobyerBirthDate;

    let email = this.jobyer.email;
    let tel = this.jobyer.tel;
    let jobyerId = (Utils.isEmpty(this.jobyer.id) ? this.jobyer.idJobyer : this.jobyer.id);
    let entrepriseId = this.employer.entreprises[0].id;
    let offerId = this.currentOffer.idOffer;
    this.contractService.prepareRecruitement(entrepriseId, email, tel, offerId, jobyerId).then((resp:any)=>{
      let datum = resp.jobyer;

      this.jobyer.id = datum.id;
      this.jobyer.numSS = datum.numss;
      this.jobyer.nationaliteLibelle = Utils.preventNull(datum.nationalite);

      this.jobyer.titreTravail = '';
      //specify if jobyer isFrench or european or a foreigner
      this.isFrench = (datum.pays_index == 33 ? true : false);
      this.isEuropean = (datum.identifiant_nationalite == 42 ? false : true);
      this.isCIN = this.isFrench || this.isEuropean;
      let estResident = datum.est_resident;
      if(this.isEuropean){
        if(this.isCIN){
          this.labelTitreIdentite = "CNI ou Passeport";
          this.jobyer.titreTravail = datum.cni;
        }else{
          this.labelTitreIdentite = "Carte de ressortissant";
          this.jobyer.titreTravail = datum.numero_titre_sejour;
        }
      }else{
        if(estResident){
          this.labelTitreIdentite = "Carte de résident";
        }else{
          this.labelTitreIdentite = "Titre de séjour";
        }
        this.jobyer.titreTravail = datum.numero_titre_sejour;
      }
      this.contractData.numeroTitreTravail = this.labelTitreIdentite + " " + this.jobyer.titreTravail;

      if (!Utils.isEmpty(datum.debut_validite)) {
        let sdate = datum.debut_validite.split(' ')[0];

        let d = new Date(sdate);
        this.jobyer.debutTitreTravail = d;
        this.contractData.debutTitreTravail = DateUtils.dateFormat(this.jobyer.debutTitreTravail);
      }

      if (!Utils.isEmpty(datum.fin_validite)) {
        let sdate = datum.fin_validite.split(' ')[0];
        let d = new Date(sdate);
        this.jobyer.finTitreTravail = d;
        this.contractData.finTitreTravail = DateUtils.dateFormat(this.jobyer.finTitreTravail);
      }

      this.recours = resp.recours;
      this.periodicites = resp.periodicites;

      this.contractData.centreMedecineEntreprise = resp.medecine.libelle;
      this.contractData.adresseCentreMedecineEntreprise = Utils.preventNull(resp.medecine.adresse) + ' ' + Utils.preventNull(resp.medecine.code_postal);

      for (let i = 0; i < resp.rates.length; i++) {
        if (this.currentOffer.jobData.remuneration < resp.rates[i].taux_horaire) {
          this.rate = parseFloat(resp.rates[i].coefficient) * this.currentOffer.jobData.remuneration;
          this.contractData.elementsCotisation = parseFloat(resp.rates[i].coefficient);
          break;
        }
      }

      this.workAdress = resp.adress.adresse_google_maps;
      this.contractData.workAdress = this.workAdress;
      this.contractData.interimAddress = this.workAdress;

      this.contractData.MonthlyAverageDuration = resp.duree_collective;

      console.log(JSON.stringify(this.contractData));
    });
  }

  initTrialPeriod(offer){
    let calendar = offer.calendarData;
    let minDay = new Date(calendar[0].date);
    let maxDay = new Date(calendar[0].date);

    for (let i = 1; i < calendar.length; i++) {
      let date = new Date(calendar[i].date);
      if (minDay.getTime() > date.getTime())
        minDay = date;
      if (maxDay.getTime() < date.getTime())
        maxDay = date;
    }

    let trial = 2;
    let timeDiff = Math.abs(maxDay.getTime() - minDay.getTime());
    let contractLength = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (contractLength <= 1)
      trial = 1;
    else if (contractLength < 30)
      trial = 2;
    else if (contractLength < 60)
      trial = 3;
    else
      trial = 5;
    this.contractData.trialPeriod = trial;
  }


  recoursSelected(evt) {

    let selectedRecoursLib = evt;
    let id = 40;
    for (let i = 0; i < this.recours.length; i++)
      if (this.recours[i].libelle == selectedRecoursLib) {
        id = this.recours[i].id;
        break;
      }

    this.justificatifs = [];
    this.contractService.loadJustificationsList(id).then((data: any) => {
      this.justificatifs = data;
    });
  }

  formatNumContrat(num) {
    let snum = num + "";
    let zeros = 10 - snum.length;
    if (zeros < 0)
      return snum;

    for (let i = 0; i < zeros; i++)
      snum = "0" + snum;

    return snum;
  }

  getStartDate() {

    let d = new Date();
    let m = d.getMonth() + 1;
    let da = d.getDate();
    let sd = d.getFullYear() + "-" + (m < 10 ? '0' : '') + m + "-" + (da < 10 ? '0' : '') + da;

    if (!this.currentOffer || isUndefined(this.currentOffer))
      return sd;
    if (!this.currentOffer.calendarData || this.currentOffer.calendarData.length == 0)
      return sd;
    let minDate = this.currentOffer.calendarData[0].date;
    for (let i = 1; i < this.currentOffer.calendarData.length; i++)
      if (this.currentOffer.calendarData[i].date < minDate)
        minDate = this.currentOffer.calendarData[i].date;
    d = new Date(minDate);
    m = d.getMonth() + 1;
    da = d.getDate();
    sd = d.getFullYear() + "-" + (m < 10 ? '0' : '') + m + "-" + (da < 10 ? '0' : '') + da;
    return sd;
  }

  getEndDate() {
    let d = new Date();
    let m = d.getMonth() + 1;
    let da = d.getDate();
    let sd = d.getFullYear() + "-" + (m < 10 ? '0' : '') + m + "-" + (da < 10 ? '0' : '') + da;
    if (!this.currentOffer || isUndefined(this.currentOffer))
      return sd;
    if (!this.currentOffer.calendarData || this.currentOffer.calendarData.length == 0)
      return sd;
    let maxDate = this.currentOffer.calendarData[0].date;

    for (let i = 1; i < this.currentOffer.calendarData.length; i++)
      if (this.currentOffer.calendarData[i].date > maxDate)
        maxDate = this.currentOffer.calendarData[i].date;
    d = new Date(maxDate);
    m = d.getMonth() + 1;
    da = d.getDate();
    sd = d.getFullYear() + "-" + (m < 10 ? '0' : '') + m + "-" + (da < 10 ? '0' : '') + da;
    return sd;
  }

  selectOffer() {

    let m = this.modal.create(ModalOffersPage);
    m.onDidDismiss((data: any) => {
      this.currentOffer = data;
      console.log(JSON.stringify(data));

      this.service.getRates().then((data: Array <any>) => {

        for (let i = 0; i < data.length; i++) {
          if (this.currentOffer.jobData.remuneration < data[i].taux_horaire) {
            this.rate = parseFloat(data[i].coefficient) * this.currentOffer.jobData.remuneration;
            this.contractData.elementsCotisation = parseFloat(data[i].coefficient);
            break;
          }
        }


      });
    //  this.initContract();
    });
    m.present();
  }

  calculateOfferHours(): any {
    if (!this.currentOffer || isUndefined(this.currentOffer))
      return 0;
    let h = 0;
    for (let i = 0; i < this.currentOffer.calendarData.length; i++) {
      let calendarEntry = this.currentOffer.calendarData[i];
      h = h + Math.abs(calendarEntry.endHour - calendarEntry.startHour) / 60;
    }
    return h.toFixed(0);
  }

  /*goToYousignPage() {
    this.contractService.getNumContract().then((data: Array<any>) => {

      if (data && data.length > 0) {
        this.contractData.num = this.numContrat;
        this.contractData.numero = this.numContrat;
        this.contractData.adresseInterim = this.workAdress;
        this.contractData.workAdress = this.workAdress;
        this.contractData.interimAddress = this.workAdress;
      }
      this.nav.push(YousignPage, { //ContractualisationPage
        jobyer: this.jobyer,
        contractData: this.contractData,
        currentOffer: this.currentOffer
      });
    });
  }*/

  gotoContractListPage(){
    let isValid = !this.mandatoryDataMissing();
    if(!isValid){
      return;
    }
    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    //get next num contract
    this.contractService.getNumContract().then((data: any) => {
      if (data && data.length > 0) {
        this.numContrat = this.formatNumContrat(data[0].numct);
        this.contractData.numero = this.numContrat;
        this.contractData.num = this.numContrat;
        this.contractData.adresseInterim= this.workAdress;
        this.contractData.workAdress = this.workAdress;
        this.contractData.interimAddress = this.workAdress;
        if(this.savedEpis && this.savedEpis.length > 0){
          this.contractData.equipements = "<ul><li>" + this.savedEpis.join('</li><li>') + "</li></ul>";
        }else{
          this.contractData.equipements = "Aucun équipement de sécurité";
        }
      }else{
        this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
        loading.dismiss();
        return;
      }

      //save contrct data
      this.contractService.saveContract(
        this.contractData,
        this.jobyer.id,
        this.employer.entreprises[0].id,
        this.projectTarget,
        this.currentUser.id,
        this.currentOffer.idOffer).then((data: any) => {
          if (data && data.status == "success" && data.data && data.data.length > 0) {
            //contract data saved
            this.contractData.id = data.data[0].pk_user_contrat;
            //make the offer state to "en contrat"
            this.offersService.updateOfferState(this.currentOffer.idOffer, "en contrat").then((data: any) => {
              if (data && data.status == "success") {
                //place offer in archive if nb contract of the selected offer is equal to its nb poste
                this.checkOfferState(this.currentOffer);
                //generate hour mission based on the offer slots
                this.contractService.generateMission(this.contractData.id, this.currentOffer);
                //update recrutement groupé state
                //this.recruitmentSrvice.updateRecrutementGroupeState(this.jobyer.rgId);
                //generate docusign envelop
                this.saveDocusignInfo().then(() => {
                  loading.dismiss();
                  //go to contract list page
                  this.nav.push(ContractListPage);
                })
              }else {
                this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
                return;
              }
            })
          } else {
            this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
            loading.dismiss();
            return;
          }
        },
        (err) => {
          this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
          loading.dismiss();
          return;
        })
    });
  }

  checkOfferState(offer){
    this.contractService.getContractsByOffer(offer.idOffer).then((data: any) => {
      if(data && data.data && data.data.length != 0 && data.data.length >= offer.nbPoste){
        this.offersService.updateOfferState(offer.idOffer, "en archive");
      }
    })
  }

  saveDocusignInfo() {
    return new Promise(resolve => {
      this.financeService.loadQuote(
        this.currentOffer.idOffer,
        this.contractData.baseSalary
      ).then((data: any) => {
        if(!data || Utils.isEmpty(data.quoteId) || data.quoteId == 0){
          this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
          return;
        }

        this.financeService.loadPrevQuote(this.currentOffer.idOffer).then((results : any)=>{
          if(!results || !results.lignes || results.lignes.length == 0){
            this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
            return;
          }

          //get jobyer address
          this.contractService.getJobyerAdress(this.jobyer.id).then((address: string) => {
            this.jobyer.address = address;

            this.contractService.callYousign(
              this.currentUser,
              this.employer,
              this.jobyer,
              this.contractData,
              this.projectTarget,
              this.currentOffer,
              data.quoteId
            ).then((data: any) => {
              if (!data || data == null || Utils.isEmpty(data.Employeur) || Utils.isEmpty(data.Jobyer) || Utils.isEmpty(data.Employeur.idContrat) || Utils.isEmpty(data.Jobyer.idContrat) || !Utils.isValidUrl(data.Employeur.url) || !Utils.isValidUrl(data.Jobyer.url)) {
                this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
                return;
              }
              this.setDocusignData(data);

              //update contract in Database with docusign data
              this.contractService.updateContract(this.contractData, this.projectTarget).then((data: any) => {
                  if (!data || data.status != "success") {
                    this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
                    return;
                  }
                  resolve();
                },
                (err) => {
                  this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
                  return;
                })
            });
          }).catch(function (err) {
            this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
            return;
          });
        });
      });
    });
  }

  setDocusignData(data){
    let partner = GlobalConfigs.global['electronic-signature'];

    let dataValue = null;
    let partnerData = null;
    this.contractData.partnerEmployerLink = null;

    if (partner === 'yousign') {
      dataValue = data[0]['value'];
      partnerData = JSON.parse(dataValue);
      //get the link yousign of the contract for the employer
      this.contractData.partnerEmployerLink = partnerData.iFrameURLs[1].iFrameURL;
    } else if (partner === 'docusign') {
      dataValue = data;
      partnerData = dataValue;
      //get the link docusign of the contract for the employer
      this.contractData.partnerEmployerLink = partnerData.Employeur.url;
    }

    // get the partner link of the contract and the phoneNumber of the jobyer
    this.contractData.partnerJobyerLink = null;
    if (partner === 'yousign') {
      this.contractData.partnerJobyerLink = partnerData.iFrameURLs[0].iFrameURL;
      this.contractData.demandeJobyer = partnerData.idDemands[0].idDemand;
      this.contractData.demandeEmployer = partnerData.idDemands[1].idDemand;

    } else if (partner === 'docusign') {
      this.contractData.partnerJobyerLink = partnerData.Jobyer.url;
      this.contractData.demandeJobyer = partnerData.Jobyer.idContrat;
      this.contractData.demandeEmployer = partnerData.Employeur.idContrat;
      this.contractData.enveloppeEmployeur = partnerData.Employeur.folderURL;
      this.contractData.enveloppeJobyer = partnerData.Jobyer.folderURL;
    }
  }

  openEpiModal(){
    let savedEpis = Utils.cloneObject(this.savedEpis);
    let modal = this.modal.create(ContractEpiPage, {savedEpis: savedEpis});
    modal.present();
    modal.onDidDismiss((data: any[]) => {
      if(Utils.isEmpty(data) || data.length == 0){
        return;
      }else{
        this.savedEpis = data;
      }
    });
  }

  /**
   * @author daoudi amine
   * @description show the menu to edit employer's informations
   */
  showMenuToEditContract() {
    let actionSheet = this.actionSheet.create({
      title: 'Editer le contrat',
      buttons: [
        {
          text: 'Civilité',
          icon: 'md-person',
          handler: () => {
            this.nav.push(CivilityPage);
          }
        }, {
          text: 'Siège social',
          icon: 'md-locate',
          handler: () => {
            this.nav.push(JobAddressPage);
          }
        }, {
          text: 'Adresse de travail',
          icon: 'md-locate',
          handler: () => {
            this.nav.push(PersonalAddressPage);
          }
        }, {
          text: 'Annuler',
          role: 'cancel',
          icon: 'md-close',
          handler: () => {

          }
        }
      ]
    });

    actionSheet.present();
  };

  mandatoryDataMissing() {
    if (!this.contractData.motif || this.contractData.motif.length == 0
      || typeof this.contractData.motif === 'object')
      return true;

    if (!this.contractData.justification || this.contractData.justification.length == 0
      || typeof this.contractData.justification === 'object')
      return true;


    if (!this.contractData.qualification || this.contractData.qualification.length == 0)
      return true;

    if (!this.contractData.characteristics || this.contractData.characteristics.length == 0)
      return true;

    if (!this.workAdress || this.workAdress.length == 0)
      return true;

    /*if (!this.contractData.workTimeHours || this.contractData.workTimeHours.length == 0)
      return true;*/

    /*if (!this.contractData.usualWorkTimeHours || this.contractData.usualWorkTimeHours.length == 0)
      return true;*/

    if (!this.contractData.baseSalary || this.contractData.baseSalary == 0)
      return true;

    if (!this.contractData.salaryNHours || this.contractData.salaryNHours.length == 0)
      return true;

    if (!this.contractData.periodicite || this.contractData.periodicite.length == 0)
      return true;

    if (this.contractData.trialPeriod < 0)
      return true;

    if (!this.companyName || this.companyName.length == 0)
      return true;

    if(this.contractData.isScheduleFixed == 'true' && (Utils.isEmpty(this.contractData.workStartHour) || Utils.isEmpty(this.contractData.workEndHour))){
      return true;
    }

    //return !this.embaucheAutorise || !this.rapatriement;
  }
}
