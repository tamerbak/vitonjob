import {NavController, LoadingController, AlertController, Storage, SqlStorage} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Component} from "@angular/core";
import {PaylineServices} from "../../providers/payline-services/payline-services";
import {MissionListPage} from "../mission-list/mission-list";

@Component({
    templateUrl: 'build/pages/wallet-create/wallet-create.html',
    providers: [PaylineServices]
})
export class WalletCreatePage {

    projectTarget: string;
    isEmployer: boolean;
    mangoPayTitle: string;
    themeColor: string;

    cardNumber: string;
    cardExpirationDate: number;
    cardCvv: string;
    cardType: string = "CB";

    service: PaylineServices;
    storage: Storage;

    existingWallet: boolean = false;
    walletMsg: string = '';
    currentUserVar: string;

    constructor(public nav: NavController,
                gc: GlobalConfigs,
                service: PaylineServices,
                public alert:AlertController,
                public loading:LoadingController) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        this.service = service;
        this.storage = new Storage(SqlStorage);
        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.mangoPayTitle = "Prise d'empreinte";
        this.themeColor = config.themeColor;
        this.currentUserVar = config.currentUserVar;
        this.nav = nav;
        this.storage.get(this.currentUserVar).then((data:any) => {
            let user = JSON.parse(data);
            this.service.checkWallet(user).then((walletId:any) => {
                if (walletId && walletId != 'null' && walletId.length > 0) {
                    this.existingWallet = true;
                    let cnum = walletId.substring(walletId.length - 4);
                    this.walletMsg = "Si vous désirez utiliser la même carte bancaire que vous avez renseigné au préalable (XXXXXXXXXXXX" + cnum + ") vous pouvez passer cette étape.";
                }
            });
        });

    }

    openWallet() {
        let card = {
            cardNumber: this.cardNumber,
            cardType: this.cardType,
            expireDate: this.cardExpirationDate,
            cvx: this.cardCvv
        };
        let loading = this.loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide'
        });

        loading.present();
        this.storage.get(this.currentUserVar).then((data:any) => {
            let user = JSON.parse(data);
            this.service.empreinteCarte(card, user).then((data:any) => {
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
}
