import {Component} from "@angular/core";
import {NavController, Storage, SqlStorage, Loading} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {isUndefined} from "ionic-angular/util";
import {GlobalService} from "../../providers/global.service";
import {AdvertService} from "../../providers/advert.service";
import {AdvertEditPage} from "../../pages/advert-edit/advert-edit";

@Component({
    templateUrl: 'build/pages/advert-list/advert-list.html',
    providers: [GlobalService, AdvertService]
})
export class AdvertListPage {

    projectTarget: string;
    backgroundImage: any;
    db: Storage;
    isHunter:boolean = false ;
    adverts = [];

    constructor(public nav: NavController,
                public gc: GlobalConfigs,
                private globalService: GlobalService,
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
        this.db = new Storage(SqlStorage);

        //loading adverts
        this.advertService.loadAdverts().then(data => {
            this.adverts = data;
        })
    }

    goToDetailAdvert(item){
        //this.advertService.loadAdvert(item).then((data: any) => {
            this.nav.push(AdvertEditPage, {advert: item});
        //})
    }
}