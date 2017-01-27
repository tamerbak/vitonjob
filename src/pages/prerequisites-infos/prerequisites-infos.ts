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
import {Storage} from "@ionic/storage";
import {EnvironmentService} from "../../providers/environment-service/environment-service";
declare let cordova: any;
declare let window;
declare let require: any;

@Component({
    templateUrl: 'prerequisites-infos.html',
    selector: 'prerequisites-infos'
})
export class PrerequisitesInfosPage {
    public projectTarget: string;
    public isRecruiter = false;
    public currentUserVar: string;
    public currentUser: any;
    public titlePage: string;

    //Jobs
    public jobs: any = [];

    public modal: any;
    public platform: any;
    public themeColor: string;
    public viewCtrl: any;
    public params: NavParams;
    public inversedThemeColor: any;
    public isEmployer: boolean;

    constructor(public environmentService: EnvironmentService,
                public nav: NavController,
                public gc: GlobalConfigs,
                private sqlStorageService: SqlStorageService,
                params: NavParams,
                private zone: NgZone,
                public events: Events,
                _platform: Platform,
                public picker: PickerController,
                private profileService: ProfileService,
                private _modal: ModalController,
                private _toast: ToastController,
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
        this.titlePage = "Les employeurs peuvent parfois vous demander les prérequis suivants";
        //load nationality list
        if (!this.isEmployer && !this.isRecruiter) {
            this.initRequirements();
        }

    }

    initRequirements() {

        let offers = this.currentUser.jobyer.offers;
        console.log(offers);
        for (let i = 0; i < offers.length; i++) {
            let jd = offers[i].jobData;
            console.log(jd);
            let found = false;

            for (let j = 0; j < this.jobs.length; j++) {
                console.log(this.jobs[j].id == jd.idJob);
                if (this.jobs[j].id == jd.idJob) {
                    found = true;
                    break;
                }

                if (found) {
                    continue;
                }
            }

            this.jobs.push({
                id: jd.idJob,
                libelle: jd.job,
                requirements: []
            });

        }
        console.log(this.jobs);
        for (let i = 0; i < this.jobs.length; i++)
            this.profileService.loadRequirementsByJob(this.jobs[i].id).then((data: any) => {
                this.jobs[i].requirements = data;
            });
    }

    isEmpty(str) {
        return Utils.isEmpty(str);
    }


}
