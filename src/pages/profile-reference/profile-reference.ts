import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {Utils} from "../../utils/utils";
import {AccountReferencesService} from "../../providers/account-references-service/account-references-service";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";


@Component({
    selector: 'page-profile-reference',
    templateUrl: 'profile-reference.html'
})
export class ProfileReferencePage {
    public viewCtrl: any;
    public reference : any;
    public currentUser : any;
    public themeColor: string;
    public inversedThemeColor: string;
    public projectTarget: string;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public referenceService : AccountReferencesService,
                viewCtrl: ViewController, gc:GlobalConfigs) {
        this.viewCtrl = viewCtrl;
        this.currentUser = navParams.get('currentUser');
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.reference = {
            class : 'com.vitonjob.references.dto.AccountReference',
            idAccount : this.currentUser.id,
            fullName : '',
            phone : '',
            email : ''
        };
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ProfileReferencePage');
    }

    isValidateDisabled(){
        if(Utils.isEmpty(this.reference.fullName) ||
            (Utils.isEmpty(this.reference.phone) &&
            Utils.isEmpty(this.reference.email)))
            return true;

        return false;
    }

    closeModal(){
        this.viewCtrl.dismiss({reference: null});
    }

    saveReference(){
        this.referenceService.addReference(this.reference).then((data:any)=>{

            this.viewCtrl.dismiss({reference: data});
        });
    }
}
