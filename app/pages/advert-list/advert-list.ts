import {Component} from "@angular/core";
import {NavController, Loading} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AdvertService} from "../../providers/advert.service";
import {AdvertEditPage} from "../../pages/advert-edit/advert-edit";

@Component({
    templateUrl: 'build/pages/advert-list/advert-list.html',
    providers: [AdvertService]
})
export class AdvertListPage {

    projectTarget: string;
    backgroundImage: any;
    db: Storage;
    isHunter:boolean = false ;
    adverts = [];
    isEmployer : boolean;
    themeColor : any;

    constructor(public nav: NavController,
                public gc: GlobalConfigs,
                private advertService: AdvertService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        this.isHunter = gc.getHunterMask();

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;

        //loading adverts
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide',
            duration: 10000
        });
        this.nav.present(loading).then(()=> {
            this.advertService.loadAdverts().then((data: any) => {
                this.adverts = data;
                loading.dismiss();
            })
        });
    }

    goToDetailAdvert(item){
        //loading adverts
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide',
            duration: 20000
        });
        this.nav.present(loading).then(()=> {
            this.advertService.loadAdvert(item).then((data: any) => {
                this.nav.push(AdvertEditPage, {advert: item});
                loading.dismiss();
            })
        });
    }
}