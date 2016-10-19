import {Component} from "@angular/core";
import {NavController, Storage, SqlStorage} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ContractService} from "../../providers/contract-service/contract-service";

/*
 Generated class for the ContractualisationPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/contractualisation/contractualisation.html',
    providers: [GlobalConfigs, ContractService]
})
export class ContractualisationPage {

    projectTarget: string;
    isEmployer: boolean;
    themeColor: string;
    backgroundImage: any;
    contractualisations: any;
    contractList: any;
    storage: any;
    currentUser: any;
    contractService: ContractService;

    constructor(private nav: NavController, gc: GlobalConfigs, cs: ContractService) {
        this.projectTarget = gc.getProjectTarget();
        this.isEmployer = this.projectTarget === 'employer';
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        this.storage = new Storage(SqlStorage);
        this.contractService = cs;

    }


    onPageWillEnter() {
        console.log('••• On Init');
        this.contractList = [];
        var missionNow = [];
        var missionFutur = [];
        var missionPast = [];
        this.contractualisations = [];
        var missionsObjNow = {header: 'Missions en cours', list: missionNow, loaded: false};
        var missionsObjFutur = {header: 'Missions en attente', list: missionFutur, loaded: false};
        var missionsObjPast = {header: 'Missions terminées', list: missionPast, loaded: false};
        this.contractualisations.push(missionsObjNow);
        this.contractualisations.push(missionsObjFutur);
        this.contractualisations.push(missionsObjPast);

        //get contracts
        this.storage.get(this.currentUserVar).then((value) => {
            if (value) {
                this.currentUser = JSON.parse(value);
                var id;
                if (this.isEmployer) {
                    id = this.currentUser.employer.entreprises[0].id;
                } else {
                    id = this.currentUser.jobyer.id;
                }
                this.contractService.getContracts(id, this.projectTarget).then(data => {
                    if (data.data) {

                        this.contractList = data.data;
                        for (let i = 0; i < this.contractList.length; i++) {
                            let item = this.contractList[i];
                            if (item.date_de_debut) {
                                /*if ((this.dayDifference(item.date_de_debut) == 0) || (this.dayDifference(item.date_de_debut) < 0 && this.dayDifference(item.date_de_fin) >= 0))*/
                                if (item.signature_jobyer.toUpperCase() == 'OUI' && item.accompli.toUpperCase() == 'NON')
                                // Mission en cours
                                    missionNow.push(item);
                                /*else if (this.dayDifference(item.date_de_debut) > 0)*/
                                if (item.signature_jobyer.toUpperCase() == 'NON')
                                // Mission in futur
                                    missionFutur.push(item);
                                //else
                                if (item.accompli.toUpperCase() == 'OUI')
                                // Mission in past
                                    missionPast.push(item);
                            }
                        }

                        missionNow = missionNow.sort((a, b) => {
                            return this.contractService.dayDifference(b.date_de_debut, a.date_de_debut)
                        });

                        missionFutur = missionFutur.sort((a, b) => {
                            return this.contractService.dayDifference(a.date_de_debut, b.date_de_debut)
                        });

                        missionPast = missionPast.sort((a, b) => {
                            return this.contractService.dayDifference(b.date_de_debut, a.date_de_debut)
                        });
                    }
                    this.contractualisations[0].list = missionNow;
                    this.contractualisations[0].loaded = true;
                    this.contractualisations[1].list = missionFutur;
                    this.contractualisations[1].loaded = true;
                    this.contractualisations[2].list = missionPast;
                    this.contractualisations[2].loaded = true;
                });
            }
        });
    }

}
