import {Component, NgZone} from "@angular/core";
import {
    NavController,
    NavParams,
    Events,
    ModalController,
    PickerController,
    Platform,
    ToastController
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SqlStorageService} from "../../providers/sql-storage-service/sql-storage-service";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {Utils} from "../../utils/utils";
import {LoadingController} from "ionic-angular/components/loading/loading";
import {AlertController} from "ionic-angular/components/alert/alert";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {Storage} from "@ionic/storage";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
import {EnvironmentService} from "../../providers/environment-service/environment-service";
declare var cordova: any;
declare var window;
declare let require: any;


@Component({
    templateUrl: 'interesting-jobs.html',
    selector: 'interesting-jobs'
})
export class InterestingJobsPage {
    public projectTarget: string;
    public isRecruiter = false;
    public currentUserVar: string;
    public currentUser: any;
    public titlePage: string;

    //Jobs
    public interestingJobs: any[];
    public jobs: any = [];
    public listJobs = [];
    public jobList = [];
    public selectedJob: any;
    public selectedJobId: any;
    public selectedJobLevel: any = 1;
    public isJobFound = true;

    public modal: any;
    public platform: any;
    public themeColor: string;
    public viewCtrl: any;
    public params: NavParams;
    public inversedThemeColor: any;
    public isEmployer: boolean;


    constructor(public environmentService:EnvironmentService,
                public nav: NavController,
                public gc: GlobalConfigs,
                private sqlStorageService: SqlStorageService,
                params: NavParams,
                private zone: NgZone,
                public events: Events,
                _platform: Platform,
                public picker: PickerController,
                private profileService: ProfileService,
                private _loading: LoadingController,
                private _modal: ModalController,
                private _toast: ToastController,
                private _alert: AlertController,
                public storage: Storage) {
        // Set global configs
        // Get target to determine configs

        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set local variables and messages
        this.themeColor = config.themeColor;
        this.currentUserVar = config.currentUserVar;
        this.isEmployer = (this.projectTarget == 'employer');
        //this.tabs=tabs;
        this.params = params;
        this.currentUser = this.params.data.currentUser;
        this.isRecruiter = this.currentUser.estRecruteur;
        this.titlePage = "Jobs qui m'intéressent";
        //load nationality list
        if (!this.isEmployer && !this.isRecruiter) {
            this.initinterestingJobs();
            this.storage.get('JOB_LIST').then(
                list => {
                    if (list) {
                        list = JSON.parse(list);

                        //this.listJobs = list;
                        this.jobList = list;


                    }
                });

        }

    }

    initinterestingJobs() {
        this.profileService.loadProfileJobs(this.currentUser.jobyer.id).then((data: any) => {
            this.interestingJobs = data;
        });
    }

    removeJob(j) {
        let index = -1;
        for (let i = 0; i < this.interestingJobs.length; i++) {
            if (this.interestingJobs[i].id == j.id) {
                index = i;
                break;
            }
        }

        if (index < 0)
            return;

        this.interestingJobs.splice(index, 1);
        this.profileService.removeJob(j, this.currentUser.jobyer.id).then((data: any) => {
            this.environmentService.reload();
        });
    }


    watchJob(e) {
        let val = e.target.value;
        if (val.length < 3) {
            this.isJobFound = true;
            this.jobs = [];
            return;
        }

        this.jobs = [];
        let removeDiacritics = require('diacritics').remove;
        for (let i = 0; i < this.jobList.length; i++) {
            let s = this.jobList[i];
            if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
                this.jobs.push(s);
            }
        }
        if (this.jobs.length == 0) {
            this.isJobFound = false;
        } else {
            this.isJobFound = true;
        }
    }

    jobSelected(job) {
        this.selectedJob = job.libelle;
        this.selectedJobId = job.id;
        this.jobs = [];

    }

    addJob() {
        if (!this.selectedJobId || Utils.isEmpty(this.selectedJobId) || !this.selectedJobLevel || Utils.isEmpty(this.selectedJobLevel)) {
            return;
        }
        for (let i = 0; i < this.interestingJobs.length; i++) {
            if (this.interestingJobs[i].libelle == this.selectedJob) {
                return;
            }
        }
        let j = {
            id: this.selectedJobId,
            libelle: this.selectedJob,
            niveau: this.selectedJobLevel
        };
        this.interestingJobs.push(j);
        this.profileService.attachJob(j, this.currentUser.jobyer.id).then((data: any) => {
            this.selectedJob = '';
            this.selectedJobId = null;
            this.environmentService.reload();
        });
    }

    /**
     * Sectors picker
     */
    setJobsPicker() {

        let picker = this.picker.create();
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();
        if (this.platform.is('android') && this.platform.version().major >= 5) {
            this.storage.get('JOB_LIST').then(
                list => {
                    if (list) {
                        list = JSON.parse(list);

                        this.listJobs = list;
                        this.jobList = list;
                        for (let i = 0; i < this.listJobs.length; i++) {
                            options.push({
                                value: this.listJobs[i].id,
                                text: this.listJobs[i].libelle
                            })
                        }
                        let column = {
                            selectedIndex: 0,
                            options: options
                        };

                        picker.addColumn(column);
                        picker.addButton('Annuler');
                        picker.addButton({
                            text: 'Valider',
                            handler: data => {
                                this.isJobFound = true;
                                this.selectedJob = data.undefined.text;
                                this.selectedJobId = data.undefined.value;
                                /*this.enterpriseCard.offer.job = data.undefined.text;
                                 this.enterpriseCard.offer.idJob = data.undefined.value;*/
                            }
                        });
                        picker.setCssClass('jobPicker');
                        picker.present();

                    }
                }
            );

        } else {
            /* Android versions 4.x.x */
            this.showJobList();
        }
    }

    showJobList() {
        this.storage.get("JOB_LIST").then((data: any) => {

            this.jobList = JSON.parse(data);

            let selectionModel = this.modal.create(ModalSelectionPage,
                {type: 'job', items: this.jobList, selection: this});
            selectionModel.present();
        });
    }

    ////////////////////////


    isEmpty(str) {
        return Utils.isEmpty(str);
    }


}
