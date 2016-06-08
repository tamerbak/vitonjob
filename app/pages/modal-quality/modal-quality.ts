import { NavController, Modal, ViewController, NavParams, Alert} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Component} from "@angular/core";

/*
 Generated class for the ModalQualityPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-quality/modal-quality.html',
    providers: [OffersService]
})
export class ModalQualityPage {

    qualities:Array<{
        'class': "com.vitonjob.callouts.auth.model.LanguageData",
        idQuality:number,
        libelle:string
    }>;

    constructor(public nav:NavController,
                gc:GlobalConfigs,
                viewCtrl:ViewController,
                params:NavParams,
                os: OffersService) {
        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.viewCtrl = viewCtrl;
        this.params = params;
        this.offerService = os;

        this.initializeQualityList(params);
    }

    /**
     * @Description : Initializing qualities list
     */
    initializeQualityList(params:NavParams) {
        let qualities = params.get('qualities');
        if (qualities && qualities.length > 0)
            this.qualities = qualities;
        else
            this.qualities = [];
    }

    /**
     * @Description : loads quality list
     */
    showQualityList() {

        /*if (this.qualityList && this.qualityList.length > 0)
            return;*/
        this.offerService.loadQualities(this.projectTarget).then(data => {
            this.qualityList = data;
            let selectionModel = Modal.create(ModalSelectionPage,
                {type: 'qualité', items: this.qualityList, selection: this});
            this.nav.present(selectionModel);
        });
    }

    /**
     * @description : Closing the modal page :
     */
    closeModal() {
        this.viewCtrl.dismiss(this.qualities);
    }

    /**
     * @Description : Validating quality modal
     */
    validateQuality() {

        this.viewCtrl.dismiss(this.qualities);
    }

    /**
     * @Description : removing slected quality 
     */
    removeQuality(item) {

        let confirm = Alert.create({
            title: 'Etes vous sûr?',
            message: 'Voulez-vous supprimer cette qualité?',
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
                        this.qualities.splice(this.qualities.indexOf(item),1);
                    }
                }
            ]
        });
        this.nav.present(confirm);
    }
}
