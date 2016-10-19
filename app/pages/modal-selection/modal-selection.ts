import {NavController, NavParams, ViewController, Toast} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";

/*
 Generated class for the ModalSelectionPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-selection/modal-selection.html',
})
export class ModalSelectionPage {

    list: any = [];

    constructor(public nav: NavController,
                gc: GlobalConfigs,
                params: NavParams,
                viewCtrl: ViewController) {


        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.isJobValidated = false;
        this.isOfferValidated = false;
        this.isEmployer = (this.projectTarget === 'employer');

        this.viewCtrl = viewCtrl;
        this.params = params;
        this.initializeItems(params.get('items'));
        this.searchQuery = "";
        this.searchPlaceholder = 'Recherchez votre ' + params.get('type');
        this.cancelButtonText = 'Annuler';

    }

    /**
     * @Description : initializing items' list
     */
    initializeItems(items: any) {
        this.list = items;
    }

    /**
     * @Description : Closing modal page
     */
    closeModal() {
        this.viewCtrl.dismiss();
    }

    /**
     * @Description : Validating selection page with one value selected..
     */
    validateModal(item) {
        var isQualityExist = false;
        var isLangExist = false;
        switch (this.params.get('type')) {
            case 'secteur' :
                this.params.get('selection').jobData.class = 'com.vitonjob.callouts.auth.model.JobData';
                this.params.get('selection').jobData.sector = item.libelle;
                this.params.get('selection').jobData.idSector = item.id;
                if (!(this.params.get('selection').jobData.job === ''))
                    this.params.get('selection').jobData.job = '';
                break;
            case 'job' :
                this.params.get('selection').jobData.class = 'com.vitonjob.callouts.auth.model.JobData';
                this.params.get('selection').jobData.job = item.libelle;
                this.params.get('selection').jobData.idJob = item.id;
                if (!this.params.get('selection').jobData.sector ||
                    this.params.get('selection').jobData.sector === '') {
                    this.params.get('selection').jobData.sector = item.libellesector;
                    this.params.get('selection').jobData.idSector = item.idsector;
                }
                break;

            case 'qualité' :
                if (this.params.get('selection').qualities.filter((v) => {
                        return (v.libelle.toLowerCase().indexOf(item.libelle.toLowerCase()) > -1)
                    }).length == 0) {
                    item.class = 'com.vitonjob.callouts.auth.model.QualityData';
                    this.params.get('selection').qualities.push(item);
                } else {
                    isQualityExist = true;
                }
                break;
            case 'langue' :
                if (this.params.get('selection').languages.filter((v) => {
                        return (v.libelle.toLowerCase().indexOf(item.libelle.toLowerCase()) > -1)
                    }).length == 0) {
                    item.class = 'com.vitonjob.callouts.auth.model.LanguageData';
                    this.params.get('selection').languages.push(item);
                } else {
                    isLangExist = true;
                }
                break;
        }


        this.viewCtrl.dismiss().then(() => {
            if (isQualityExist) {
                let toast = Toast.create({
                    message: "Vous avez déjà choisi cette qualité! Merci d'en sélectionner une autre.",
                    duration: 3000
                });

                toast.onDismiss(() => {
                    console.log('Dismissed toast');
                });

                this.nav.present(toast);
            }
            if (isLangExist) {
                let toast = Toast.create({
                    message: "Vous avez déjà choisi cette langue! Merci d'en sélectionner une autre.",
                    duration: 3000
                });

                toast.onDismiss(() => {
                    console.log('Dismissed toast');
                });

                this.nav.present(toast);
            }
        });
    }

    /**
     * @Description : searching typed text in selection items
     * @param ev : search value
     */
    getItems(ev) {
        // Reset items back to all of the items
        this.initializeItems(this.params.get('items'));

        // set q to the value of the searchbar
        var q = ev.target.value;

        // if the value is an empty string don't filter the items
        if (q.trim() == '') {
            return;
        }

        this.list = this.list.filter((v) => {
            return (v.libelle.toLowerCase().indexOf(q.toLowerCase()) > -1);
        })
    }
}
