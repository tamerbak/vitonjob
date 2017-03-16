import {Component} from "@angular/core";
import {ViewController, ModalController
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {GlobalService} from "../../providers/global-service/global-service";
import {Utils} from "../../utils/utils";
import {ModalCorporamaSearchPage} from "../modal-corporama-search/modal-corporama-search";
import {LoadingController} from "ionic-angular/components/loading/loading";
import {LoadListService} from "../../providers/load-list-service/load-list-service";
import {Storage} from "@ionic/storage";
import {Entreprise} from "../../dto/entreprise";
import {EntrepriseService} from "../../providers/entreprise-service/entreprise-service";

@Component({
    templateUrl: 'modal-entreprise.html',
    selector: 'modal-entreprise'
})
export class ModalEntreprisePage {
    public projectTarget: string;
    public currentUserVar: string;
    public currentUser: any;
    public themeColor: string;
    public isEmployer: boolean;

    public loading: any;

    public entreprise: Entreprise = new Entreprise();

    public isAPEValid = true;

    /*
     Gestion des conventions collectives
     */
    public conventions: any = [];

    constructor(public gc: GlobalConfigs,
                public loadListService: LoadListService,
                private globalService: GlobalService,
                private _loading: LoadingController,
                public storage: Storage,
                public entrepriseService: EntrepriseService,
                public viewCtrl: ViewController,
                public modal: ModalController) {
        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.loading = _loading;
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set local variables and messages
        this.themeColor = config.themeColor;
        this.currentUserVar = config.currentUserVar;
        this.isEmployer = (this.projectTarget == 'employer');

        this.initConvention();
    }

    initConvention(){
        //charger la liste des conventions
        this.loadListService.loadConventions().then((response: any) => {
            this.conventions = response;
        });

        //initialiser l'id convention de l'entreprise
        /*this.storage.get(this.currentUserVar).then((value) => {
            if (!Utils.isEmpty(value)) {
                this.currentUser = JSON.parse(value);
                if (this.currentUser.employer.enterprises && this.currentUser.employer.enterprises.length > 0) {
                    if (this.currentUser.employer.entreprises[0].conventionCollective && this.currentUser.employer.entreprises[0].conventionCollective.id > 0) {
                        this.entreprise.conventionCollective = this.currentUser.employer.entreprises[0].conventionCollective.id;
                    }
                }
            }
        });*/


    }

    openCoporamaModal() {
        let modal = this.modal.create(ModalCorporamaSearchPage);
        modal.present();
        modal.onDidDismiss((data: any) => {
            if (!data) {
                return;
            }
            this.entreprise.nom = data.name;
            this.entreprise.naf = data.naf;

            //vérifier si cette socité existe déjà
            this.IsCompanyExist();
        });
    }

    IsCompanyExist() {
        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present(loading);

        this.entrepriseService.countEntreprisesByRaisonSocial(this.entreprise.nom).then((data: {data: Array<any>}) => {
            loading.dismiss();
            if (data && data.data && data.data[0].count != 0) {
                this.globalService.showAlertValidation("Vit-On-Job", "L'entreprise " + this.entreprise.nom + " existe déjà. Veuillez saisir une autre raison sociale.");
                this.entreprise = new Entreprise();
            } else {
                return;
            }
        });
    }

    /**
     * @description watch and validate the ape or naf field
     */
    watchAPE(e) {
        let s = e.target.value;
        //check if ape valid
        if (Utils.isNumeric(s.substring(0, 4)) && Utils.isLetter(s.substring(4, 5)) && s.length == 5) {
            e.target.value = s.toUpperCase();
            this.isAPEValid = true;
        } else {
            this.isAPEValid = false;
        }
    }

    convSelected(c) {
        this.entreprise.conventionCollective = c;
    }

    saveEntreprise(){
        let isNotValid = this.isValidateDisabled();
        if(isNotValid){
            return;
        }

        this.viewCtrl.dismiss(this.entreprise);
    }

    closeModal(){
        this.viewCtrl.dismiss();
    }

    /**
     * @description function called to decide if the validate button should be disabled or not
     */
    isValidateDisabled() {
        return (Utils.isEmpty(this.entreprise.nom) ||
          Utils.isEmpty(this.entreprise.naf) || !this.isAPEValid ||
          !this.entreprise.conventionCollective || this.entreprise.conventionCollective.id == 0 || Utils.isEmpty(this.entreprise.conventionCollective.id+""));
    }

    isEmpty(str) {
        return Utils.isEmpty(str);
    }
}
