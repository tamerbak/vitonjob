import {Component} from "@angular/core";
import {NavController, LoadingController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AdvertService} from "../../providers/advert-service/advert-service";
import {AdvertEditPage} from "../advert-edit/advert-edit";
import {AdvertDetailsPage} from "../advert-details/advert-details";
import {Storage} from "@ionic/storage";

@Component({
    templateUrl: 'advert-list.html',
    selector: 'advert-list'
})

export class AdvertListPage {
    public projectTarget: string;
    public backgroundImage: any;
    public adverts = [];
    public isEmployer : boolean;
    public themeColor : any;
    public currentUserVar: string;
    public currentUser: any;
    //determine the number of elements that should be skipped by the loading adverts query
    public queryOffset: number = 0;
    //determine the number of elemens to be retrieved by the loading adverts query
    public queryLimit: number = 7;

    constructor(public nav: NavController,
                public gc: GlobalConfigs,
                public advertService: AdvertService,
                public loadingCtrl: LoadingController,
                public storage: Storage) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;

        //loading adverts
        let loading = this.loadingCtrl.create({
            content: ` 
			<div>
			<img src='assets/img/loading.gif' />
			</div>
			`,
            spinner: 'hide',
        });
        loading.present();
        this.storage.get(config.currentUserVar).then((res: any) => {
            if (res) {
                this.currentUser = JSON.parse(res);
                if (this.isEmployer) {
                    let entrepriseId = this.currentUser.employer.entreprises[0].id;
                    this.advertService.loadAdvertsByEntreprise(entrepriseId, this.queryOffset, this.queryLimit).then((data: any) => {
                        this.adverts = data;
                        this.queryOffset = this.queryOffset + this.queryLimit;
                        loading.dismiss();
                    })
                } else {
                    this.advertService.loadAdverts(this.queryOffset, this.queryLimit).then((data: any) => {
                        this.adverts = data;
                        this.queryOffset = this.queryOffset + this.queryLimit;
                        loading.dismiss();
                    })
                }
            }
        });
    }

    doInfinite(infiniteScroll) {
        console.log('Begin async operation');

        setTimeout(() => {
            if (this.isEmployer) {
                let entrepriseId = this.currentUser.employer.entreprises[0].id;
                this.advertService.loadAdvertsByEntreprise(entrepriseId, this.queryOffset, this.queryLimit).then((data: any) => {
                    this.adverts = this.adverts.concat(data);
                    this.queryOffset = this.queryOffset + this.queryLimit;
                    console.log('Async operation has ended');
                    infiniteScroll.complete();
                })
            } else {
                this.advertService.loadAdverts(this.queryOffset, this.queryLimit).then((data: any) => {
                    this.adverts = this.adverts.concat(data);
                    this.queryOffset = this.queryOffset + this.queryLimit;
                    console.log('Async operation has ended');
                    infiniteScroll.complete();
                })
            }
        }, 500);
    }

    goToDetailAdvert(item){
        //loading advert
        let loading = this.loadingCtrl.create({
            content: ` 
			<div>
			<img src='assets/img/loading.gif' />
			</div>
			`,
            spinner: 'hide',
        });
        loading.present().then(()=> {
            this.advertService.loadAdvert(item).then((data: any) => {
                this.nav.push(AdvertDetailsPage, {advert: item});
                loading.dismiss();
            })
        });
    }

    goToNewAdvert(){

    }

    gotoEditAdvert(item){
        //loading advert
        let loading = this.loadingCtrl.create({
            content: ` 
			<div>
			<img src='assets/img/loading.gif' />
			</div>
			`,
            spinner: 'hide',
        });
        loading.present().then(()=> {
            this.advertService.loadAdvert(item).then((data: any) => {
                this.nav.push(AdvertEditPage, {advert: item});
                loading.dismiss();
            })
        });
    }
}