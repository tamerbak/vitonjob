import {NavController, LoadingController, AlertController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Component} from "@angular/core";
import {PaylineServices} from "../../providers/payline-services/payline-services";
import {MissionListPage} from "../mission-list/mission-list";
import {Storage} from "@ionic/storage";
import {SlimPayService} from "../../providers/slimpay-service/slimpay-service";
import {InAppBrowser} from "ionic-native";

@Component({
    templateUrl: 'wallet-create.html'
})
export class WalletCreatePage {

    public projectTarget: string;
    public isEmployer: boolean;
    public mangoPayTitle: string;
    public themeColor: string;

    public cardNumber: string;
    public cardExpirationDate: number;
    public cardCvv: string;
    public cardType: string = "CB";

    public service: PaylineServices;


    public existingWallet: boolean = false;
    public walletMsg: string = '';
    public currentUserVar: string;
    public modePaiement : string = 'payline';
    public slimpayURL : string = '';
    public retrySlimpay : boolean =  false;
    public slimpayError : string = '';

    constructor(public nav: NavController,
                gc: GlobalConfigs,
                service: PaylineServices,
                private slimpayService : SlimPayService,
                public alert: AlertController,
                public loading: LoadingController,
                public storage: Storage) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        this.service = service;

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.mangoPayTitle = "Prise d'empreinte";
        this.themeColor = config.themeColor;
        this.currentUserVar = config.currentUserVar;
        this.nav = nav;
        this.storage.get(this.currentUserVar).then((data: any) => {
            let user = JSON.parse(data);
            this.service.checkWallet(user).then((walletId: any) => {
                if (walletId && walletId != 'null' && walletId.length > 0) {
                    this.existingWallet = true;
                    let cnum = walletId.substring(walletId.length - 4);
                    this.walletMsg = "Si vous désirez utiliser la même carte bancaire que vous avez renseigné au préalable (XXXXXXXXXXXX" + cnum + ") vous pouvez passer cette étape.";
                }
            });
        });

    }

    selectedPayline(){
        this.modePaiement = 'payline';
    }
    selectedSlimpay(){
        this.modePaiement = 'slimpay';
        if(this.slimpayURL == '')
            this.prepareSEPA();
    }

    openWallet() {
        let card = {
            cardNumber: this.cardNumber,
            cardType: this.cardType,
            expireDate: this.cardExpirationDate,
            cvx: this.cardCvv
        };
        let loading = this.loading.create({content:"Merci de patienter..."});

        loading.present();
        this.storage.get(this.currentUserVar).then((data: any) => {
            let user = JSON.parse(data);
            this.service.empreinteCarte(card, user).then((data: any) => {
                loading.dismiss();

                if (data.code == '02500') {
                    this.nav.setRoot(MissionListPage);
                } else {
                    let alert = this.alert.create({
                        title: "Erreur lors de validation de la carte",
                        subTitle: "le numéro de carte bancaire doit comporter 16 chiffres et doit être valide",
                        buttons: ['OK']
                    });
                    alert.present();
                }

            });
        });
    }

    gotomissions() {
        this.nav.setRoot(MissionListPage);
    }

    prepareSEPA(){
        this.storage.get(this.currentUserVar).then((data: any) => {
            let user = JSON.parse(data);
            let idEntreprise = user.employer.entreprises[0].id;
            this.slimpayService.signSEPA(idEntreprise).then((data:any)=>{
                this.slimpayURL = data.url;
                let browser = new InAppBrowser(data.url, '_blank');
                browser.on('exit').subscribe(()=>{
                    this.slimpayService.checkSEPARequestState(idEntreprise).then((data:any)=>{
                        let state = data.etat;
                        this.slimpayError = '';
                        if(state == 'Attente'){
                            this.slimpayError = "Prière de terminer la procédure de mandat avant de fermer la fenêtre Slimpay.";
                            this.retrySlimpay = true;
                        } else if(state == "Succès"){
                            this.nav.setRoot(MissionListPage);
                        } else {
                            this.slimpayError = "Votre demande a été rejetée. Nous vous proposons de payer par carte bancaire. ";
                            this.retrySlimpay = true;
                        }
                    });
                }, (err)=>{
                    console.log(err);
                    this.retrySlimpay = true;
                });
            });
        });
    }
}
