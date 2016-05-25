import {Page, NavController, ViewController, Modal, NavParams} from 'ionic-angular';
import {FormBuilder, Validators} from "angular2/common";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";

/*
 Generated class for the ModalJobPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/modal-job/modal-job.html',
    providers: [OffersService]
})
export class ModalJobPage {

    public jobData:{
        idJob:string,
        job:number,
        idSector:number,
        sector:string,
        level:string,
        remuneration:number,
        currency:string,
        validated:boolean
    };
    offerService:any;

    constructor(public nav:NavController,
                viewCtrl:ViewController,
                fb:FormBuilder,
                gc:GlobalConfigs,
                os:OffersService, params:NavParams) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        // Modal traitement:
        this.viewCtrl = viewCtrl;
        this.jobForm = fb.group({
            sector: ['', Validators.required],
            job: ['', Validators.required]
        });

        this.offerService = os;
        this.initializeJobForm(params);

        this.alertOptions = {
            title: 'Devise',
            subTitle: 'Sélectionnez votre devise'
        };

        this.currency = "euro";

        //this.level = 'junior';

        //this.jobData.job = this.jobForm.controls['username'];
        //this.jobData.sector = this.jobForm.controls['password'];
    }


    /**
     * @Description : Initializing job form
     */
    initializeJobForm(params:any) {

        let jobData = params.get('jobData');

        if (jobData && !(jobData === '[object Object]')) {
            this.jobData = jobData;
        } else {
            this.jobData = {
                job: "",
                sector: "",
                idSector: 0,
                idJob: 0,
                level: 'junior',
                remuneration: 0,
                currency: 'euro',
                validated: false
            }
        }
    }


    /**
     * @description : Closing the modal page :
     */
    closeModal() {
        //this.jobData.validated = false;
        this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === '') && !(this.jobData.remuneration == 0));
        this.viewCtrl.dismiss(this.jobData);
    }

    /**
     * @Author : TEL
     * @Description: Validating the modal page (All fields are filled)
     */
    validateJob() {
        this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === '') && !(this.jobData.remuneration == 0));
        //this.jobData.level = 'senior';
        this.viewCtrl.dismiss(this.jobData);
    }

    /**
     * @Description : loads jobs list
     */
    showJobList(){
        this.offerService.loadJobs(this.projectTarget).then(data => {

            if (this.jobList && this.jobList.length > 0)
                return;
            //debugger;

            this.offerService.loadJobs(this.projectTarget, this.jobData.idSector).then(data => {
                //debugger;
                this.jobList = data;
                let selectionModel = Modal.create(ModalSelectionPage,
                    {type: 'job', items: this.jobList, selection: this});
                this.nav.present(selectionModel);
            });
        });

    }


    /**
     * @Description : loads sector list
     */
    showSectorList() {
        if (this.sectorList && this.sectorList.length > 0)
            return;
        this.offerService.loadSectors(this.projectTarget).then(data => {
            //debugger;
            this.sectorList = data;
            let selectionModel = Modal.create(ModalSelectionPage,
                {type: 'secteur', items: this.sectorList, selection: this});
            this.nav.present(selectionModel);
        });

    }
}
