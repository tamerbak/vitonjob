import { Component } from '@angular/core';
import { NavController, Storage, SqlStorage} from 'ionic-angular';
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {PendingContratDetailsPage} from "../pending-contrat-details/pending-contrat-details";

@Component({
    templateUrl: 'build/pages/pending-contracts/pending-contracts.html',
})
export class PendingContractsPage {
    isEmployer : boolean = false;
    contractList : any = [];
    themeColor:string;
    db : Storage;
    projectTarget : any;

    constructor(private nav: NavController,
                public gc: GlobalConfigs) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.db = new Storage(SqlStorage);
        this.db.get('PENDING_CONTRACTS').then(contrats => {

            if (contrats) {
                this.contractList = JSON.parse(contrats);
            }
        });
    }

    selectContract(item){
        this.nav.push(PendingContratDetailsPage, {searchResult : item});
    }

}
