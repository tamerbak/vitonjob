import {NavController, NavParams, AlertController, Platform} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {ContractPage} from "../contract/contract";
import {CivilityPage} from "../civility/civility";
import {LoginsPage} from "../logins/logins";
import {UserService} from "../../providers/user-service/user-service";
import {GlobalService} from "../../providers/global-service/global-service";
import {PendingContractsPage} from "../pending-contracts/pending-contracts";
import {Component} from "@angular/core";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Configs} from "../../configurations/configs";

declare let sms;
declare let startApp;

/*
 Generated class for the PendingContratDetailsPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'pending-contrat-details.html'
})
export class PendingContratDetailsPage {
  public isEmployer: boolean = false;
  public fullTitle: string = '';
  public fullName: string = '';
  public matching: string = '';
  public telephone: string = '';
  public email: string = '';
  public projectTarget: any;
  public result: any;
  public userService: UserService;
  public isUserAuthenticated: boolean;
  public employer: any;
  public delegate: PendingContractsPage;
  public deleteFlag: boolean = false;
  public isRecruteur: boolean = false;
  public languages: any = [];
  public qualities: any = [];
  public videoPresent: boolean = false;
  public videoLink: string;
  public starsText: string = '';
  public avatar:string;
  public themeColor:string;

  constructor(public nav: NavController,
              public params: NavParams,
              public globalConfig: GlobalConfigs,
              userService: UserService,
              private globalService: GlobalService,
              public platform: Platform, public alert: AlertController,
              public offersService:OffersService) {
    // Get target to determine configs
    this.projectTarget = globalConfig.getProjectTarget();
    this.isEmployer = this.projectTarget == 'employer';
    this.result = params.data.searchResult;
    this.delegate = params.data.delegate;
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
    let configInversed = (this.projectTarget === 'employer') ? Configs.setConfigs('jobyer') : Configs.setConfigs('employer');
    this.avatar = (this.result.avatar) ? this.result.avatar : configInversed.avatars[0].url;
    if (this.result.titreOffre)
      this.fullTitle = this.result.titreOffre;
    if (this.result.titreoffre)
      this.fullTitle = this.fullTitle + this.result.titreoffre;

    if (!this.isEmployer)
      this.fullName = this.result.entreprise;
    else
      this.fullName = this.result.titre + ' ' + this.result.prenom + ' ' + this.result.nom;
    this.email = this.result.email;
    this.telephone = this.result.tel;
    this.matching = this.result.matching + "%";

    //get the currentEmployer
    this.userService = userService;
    this.userService.getCurrentUser(this.projectTarget).then(results => {

      if (results && !isUndefined(results)) {

        let currentEmployer = JSON.parse(results);
        if (currentEmployer) {
          this.employer = currentEmployer;
          if (this.employer.estRecruteur)
            this.isRecruteur = this.employer.estRecruteur;
        }
        console.log(currentEmployer);
      }

    });

    let table = this.isEmployer ? 'user_offre_jobyer' : 'user_offre_entreprise';
    let idOffers = [];
    idOffers.push(this.result.idOffre);
    this.languages = [];
    this.qualities = [];
    this.offersService.getOffersLanguages(idOffers, table).then((data: any) => {
      if (data)
        this.languages = data;
    });
    this.offersService.getOffersQualities(idOffers, table).then((data: any) => {
      if (data)
        this.qualities = data;
    });
    this.offersService.getOfferVideo(this.result.idOffre, table).then((data: any) => {
      this.videoPresent = false;
      if (data && data != null && data.video && data.video != "null") {
        this.videoPresent = true;
        this.videoLink = data.video;
      }

    });

    /*this.notationService.loadSearchNotation(resultType, id).then(score => {

      this.rating = score;
      this.starsText = this.writeStars(this.rating);
    });*/

    //get the connexion object and define if the there is a user connected
    userService.getConnexionObject().then(results => {
      if (results && !isUndefined(results)) {
        let connexion = JSON.parse(results);
        if (connexion && connexion.etat) {
          this.isUserAuthenticated = true;
        } else {
          this.isUserAuthenticated = false;
        }
        console.log(connexion);
      }
    });

    console.log(JSON.stringify(this.result));
  }

  call() {

    window.location.href = 'tel:' + this.telephone;
  }

  sendEmail() {

    window.location.href = 'mailto:' + this.email;
  }

  sendSMS() {
    let number = this.telephone;
    let options = {
      replaceLineBreaks: false, // true to replace \n by a new line, false by default
      android: {
        intent: 'INTENT'  // send SMS with the native android SMS messaging
      }
    };
    let success = function () {
      console.log('Message sent successfully');
    };
    let error = function (e) {
      console.log('Message Failed:' + e);
    };

    sms.send(number, "", options, success, error);
  }

  skype() {
    let sApp;
    if (this.platform.is('ios')) {
      sApp = startApp.set("skype://" + this.telephone);
    } else {
      sApp = startApp.set({
        "action": "ACTION_VIEW",
        "uri": "skype:" + this.telephone
      });
    }
    sApp.start(() => {
      console.log('starting skype');
    }, (error) => {
      this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors du lancement de Skype. Vérifiez que l'application est bien installée.");
    });
  }

  googleHangout() {
    let sApp = startApp.set({
      "action": "ACTION_VIEW",
      "uri": "gtalk:" + this.telephone
    });
    sApp.check((values) => { /* success */
      console.log("OK");
    }, (error) => { /* fail */
      this.globalService.showAlertValidation("Vit-On-Job", "Hangout n'est pas installé.");
    });
    sApp.start(() => {
      console.log('starting hangout');
    }, (error) => {
      this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors du lancement de Hangout.");
    });
  }

  contract() {

    if (this.isUserAuthenticated) {

      let currentEmployer = this.employer.employer;
      console.log(currentEmployer);

      //verification of employer informations
      let redirectToCivility = (currentEmployer && currentEmployer.entreprises[0]) ?
      (currentEmployer.titre == "") ||
      (currentEmployer.prenom == "") ||
      (currentEmployer.nom == "") ||
      (currentEmployer.entreprises[0].name == "") ||
      (currentEmployer.entreprises[0].siret == "") ||
      (currentEmployer.entreprises[0].naf == "") ||
      (currentEmployer.entreprises[0].siegeAdress.id == 0) ||
      (currentEmployer.entreprises[0].workAdress.id == 0) : true;

      let isDataValid = !redirectToCivility;

      if (isDataValid) {
        //navigate to contract page

        let o = this.params.get('currentOffer');
        if (o && !isUndefined(o)) {
          this.nav.push(ContractPage, {jobyer: this.result, currentOffer: o});
        } else {
          this.nav.push(ContractPage, {jobyer: this.result});
        }


      } else {
        //redirect employer to fill the missing informations
        let alert = this.alert.create({
          title: 'Informations incomplètes',
          subTitle: "Veuillez compléter votre profil avant d'établir votre premier contrat",
          buttons: ['OK']
        });
        alert.onDidDismiss(() => {
          this.nav.push(CivilityPage, {currentUser: this.employer});
        });
        alert.present();

      }
    }
    else {
      let alert = this.alert.create({
        title: 'Attention',
        message: 'Pour contacter ce jobyer, vous devez être connectés.',
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
          },
          {
            text: 'Connexion',
            handler: () => {
              this.nav.push(LoginsPage);
            }
          }
        ]
      });
      alert.present();
    }
  }

  delete() {
    this.deleteFlag = false;
    let alert = this.alert.create({
      title: 'Attention',
      message: 'Êtes-vous sûr de vouloir écarter ce candidat ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.delegate.removeContract(this.result);
            this.deleteFlag = true;
          }
        }
      ]
    });
    alert.present();
    alert.onDidDismiss(() => {
      if (this.deleteFlag)
        this.nav.pop();
    });
  }

  close() {
    this.nav.pop();
  }
}
