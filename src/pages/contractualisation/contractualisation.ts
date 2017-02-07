import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ContractService} from "../../providers/contract-service/contract-service";
import {Storage} from "@ionic/storage";

/*
 Generated class for the ContractualisationPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'contractualisation.html'
})
export class ContractualisationPage {

  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;
  public backgroundImage: any;
  public contractualisations: any;
  public contractList: any;
  public currentUser: any;
  public contractService: ContractService;
  public currentUserVar: any;

  constructor(private nav: NavController, gc: GlobalConfigs, cs: ContractService, public storage: Storage) {
    this.projectTarget = gc.getProjectTarget();
    this.isEmployer = this.projectTarget === 'employer';
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
    this.backgroundImage = config.backgroundImage;
    this.contractService = cs;

  }


  ionViewWillEnter() {
    console.log('••• On Init');
    this.contractList = [];
    let missionNow = [];
    let missionFutur = [];
    let missionPast = [];
    this.contractualisations = [];
    let missionsObjNow = {header: 'Missions en cours', list: missionNow, loaded: false};
    let missionsObjFutur = {header: 'Missions en attente', list: missionFutur, loaded: false};
    let missionsObjPast = {header: 'Missions terminées', list: missionPast, loaded: false};
    this.contractualisations.push(missionsObjNow);
    this.contractualisations.push(missionsObjFutur);
    this.contractualisations.push(missionsObjPast);

    //get contracts
    this.storage.get(this.currentUserVar).then((value) => {
      if (value) {
        this.currentUser = JSON.parse(value);
        let id;
        if (this.isEmployer) {
          id = this.currentUser.employer.entreprises[0].id;
        } else {
          id = this.currentUser.jobyer.id;
        }
        this.contractService.getContracts(id, this.projectTarget).then((data: {data: any}) => {
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
