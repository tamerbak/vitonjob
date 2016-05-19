import {Page, NavController, ViewController, Modal} from 'ionic-angular';
import {FormBuilder, Validators} from "angular2/common";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";

/*
 Generated class for the ModalJobPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/modal-job/modal-job.html',
})
export class ModalJobPage {

    public job: string;
    public sector: string;

    constructor(public nav:NavController,
                viewCtrl:ViewController,
                fb:FormBuilder,
                gc: GlobalConfigs) {

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
        // Modal traitement:
        this.viewCtrl = viewCtrl;
        this.jobForm = fb.group({
            sector: ['', Validators.required],
            job: ['', Validators.required]
        });

        this.job = this.jobForm.controls['username'];
        this.sector = this.jobForm.controls['password'];
    }

    /**
     * @description : Closing the modal page : 
     */
    closeModal() {
        this.viewCtrl.dismiss();
    }

    submitForm() {

        if (this.jobForm.valid)
            this.viewCtrl.dismiss();
        debugger;
    }

    /**
     * @Description : loads jobs list 
     */
    showJobList() {
        this.jobList = [{libelle : "aaaa"}, {libelle : "bbbbb"}, {libelle : "ccccc"}];
        let selectionModel = Modal.create(ModalSelectionPage, 
            {type : 'job', items: this.jobList, selection : this});
        this.nav.present(selectionModel);
    }
}
