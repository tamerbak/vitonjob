import {Component} from "@angular/core";
import {NavController, NavParams, ModalController, LoadingController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {AdvertService} from "../../providers/advert-service/advert-service";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {Utils} from "../../utils/utils";
import {ModalProfileJobyerPage} from "../modal-profile-jobyer/modal-profile-jobyer";

@Component({
    templateUrl: 'advert-jobyer-list.html',
    selector: 'advert-jobyer-list'
})

export class AdvertJobyerListPage {
    public projectTarget: string;
    public isEmployer: boolean;
    public themeColor: string;
    public jobyerList: any[] = [];
    public backgroundImage: string;
    public advert: any;

    constructor(public gc: GlobalConfigs,
                public navParams: NavParams,
                public nav: NavController,
                public advertService: AdvertService,
                public profileService: ProfileService,
                public loadingCtrl: LoadingController,
                public modal:ModalController) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        this.isEmployer = (this.projectTarget == 'employer');

        this.advert = navParams.get('advert');
        let loading = this.loadingCtrl.create({
            content: ` 
			<div>
			<img src='assets/img/loading.gif' />
			</div>
			`,
            spinner: 'hide',
        });
        loading.present();
        this.advertService.getInterestedJobyers(this.advert.id).then((data: any) => {
            if (data && data.status == "success" && data.data) {
                this.jobyerList = data.data
            }
            loading.dismiss();
        })
    }

    preventNull(str) {
        return Utils.preventNull(str);
    }

    showJobyerProfileModal(jobyer){
        let loading = this.loadingCtrl.create({
            content: ` 
			<div>
			<img src='assets/img/loading.gif' />
			</div>
			`,
            spinner: 'hide',
        });
        loading.present();
        this.profileService.getJobyerInfo(jobyer.jobyerid).then((data: any) => {
            loading.dismiss();
            if(data && data._body.length != 0 && data.status == "200"){
                let j = JSON.parse(data._body);
                let modal = this.modal.create(ModalProfileJobyerPage, {jobyer: j});
                modal.present();
            }
        })
    }
}
