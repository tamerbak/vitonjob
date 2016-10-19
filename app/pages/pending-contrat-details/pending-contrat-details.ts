import {Component} from "@angular/core";
import {NavController, NavParams, Alert, Platform} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {isUndefined} from "ionic-angular/util";
import {ContractPage} from "../contract/contract";
import {CivilityPage} from "../civility/civility";
import {LoginsPage} from "../logins/logins";
import {UserService} from "../../providers/user-service/user-service";
import {GlobalService} from "../../providers/global.service";
import {PendingContractsPage} from "../pending-contracts/pending-contracts";

/*
 Generated class for the PendingContratDetailsPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/pending-contrat-details/pending-contrat-details.html',
    providers: [GlobalService]
})
export class PendingContratDetailsPage {
    isEmployer: boolean = false;
    fullTitle: string = '';
    fullName: string = '';
    matching: string = '';
    telephone: string = '';
    email: string = '';
    projectTarget: any;
    result: any;
    userService: UserService;
    isUserAuthenticated: boolean;
    employer: any;
    delegate: PendingContractsPage;
    deleteFlag: boolean = false;
    isRecruteur: boolean = false;

    constructor(public nav: NavController,
                public params: NavParams,
                public globalConfig: GlobalConfigs,
                userService: UserService,
                private globalService: GlobalService,
                platform: Platform) {
        // Get target to determine configs
        this.projectTarget = globalConfig.getProjectTarget();
        this.isEmployer = this.projectTarget == 'employer';
        this.platform = platform;
        this.result = params.data.searchResult;
        this.delegate = params.data.delegate;
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

        window.location = 'tel:' + this.telephone;
    }

    sendEmail() {

        window.location = 'mailto:' + this.email;
    }

    sendSMS() {
        var number = this.telephone;
        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
            }
        };
        var success = function () {
            console.log('Message sent successfully');
        };
        var error = function (e) {
            console.log('Message Failed:' + e);
        };

        sms.send(number, "", options, success, error);
    }

    skype() {
        var sApp;
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
            this.globalService.showAlertValidation("VitOnJob", "Erreur lors du lancement de Skype. Vérifiez que l'application est bien installée.");
        });
    }

    googleHangout() {
        var sApp = startApp.set({
            "action": "ACTION_VIEW",
            "uri": "gtalk:" + this.telephone
        });
        sApp.check((values) => { /* success */
            console.log("OK");
        }, (error) => { /* fail */
            this.globalService.showAlertValidation("VitOnJob", "Hangout n'est pas installé.");
        });
        sApp.start(() => {
            console.log('starting hangout');
        }, (error) => {
            this.globalService.showAlertValidation("VitOnJob", "Erreur lors du lancement de Hangout.");
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
                let alert = Alert.create({
                    title: 'Informations incomplètes',
                    subTitle: "Veuillez compléter votre profil avant d'établir votre premier contrat",
                    buttons: ['OK']
                });
                alert.onDismiss(()=> {
                    this.nav.push(CivilityPage, {currentUser: this.employer});
                });
                this.nav.present(alert);

            }
        }
        else {
            let alert = Alert.create({
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
            this.nav.present(alert);
        }
    }

    delete() {
        this.deleteFlag = false;
        let alert = Alert.create({
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
        this.nav.present(alert);
        alert.onDismiss(()=> {
            if (this.deleteFlag)
                this.nav.pop();
        });
    }

    close() {
        this.nav.pop();
    }
}
