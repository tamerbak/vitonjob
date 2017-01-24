import {Component} from "@angular/core";
import {NavController,} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ContractService} from "../../providers/contract-service/contract-service";
import {MissionDetailsPage} from "../mission-details/mission-details";
//import {MissionPointingPage} from "../mission-pointing/mission-pointing";
import {Storage} from "@ionic/storage";

/*
 Generated class for the MissionListPage page.
 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'mission-list.html',
  selector: 'mission-list'
})
export class MissionListPage {
  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;

  public employer: any;
  public jobyer: any;
  public contractList: any;
  public missionListTitle: string;
  public currentUserVar: string;
  public inversedThemeColor: string;
  public backgroundImage: any;
  public missionList: any;
  public currentUser: any;
  public backGroundColor:string;

  constructor(public gc: GlobalConfigs,
              public nav: NavController,
              private contractService: ContractService, public storage:Storage) {
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set store variables and messages
    this.themeColor = config.themeColor;
    this.inversedThemeColor = config.inversedThemeColor;
    this.currentUserVar = config.currentUserVar;
    this.backgroundImage = config.backgroundImage;
    this.missionListTitle = "Suivi des missions";
    this.isEmployer = (this.projectTarget == 'employer');
    this.backGroundColor = config.backGroundColor;

  }

  ionViewWillEnter() {
    console.log('••• On Init');
    this.contractList = [];
    let missionNow = [];
    let missionFutur = [];
    let missionPast = [];
    this.missionList = [];
    let missionsObjNow = {header: 'Missions en cours', list: missionNow, loaded: false};
    let missionsObjFutur = {header: 'Missions en attente', list: missionFutur, loaded: false};
    let missionsObjPast = {header: 'Missions terminées', list: missionPast, loaded: false};
    this.missionList.push(missionsObjNow);
    this.missionList.push(missionsObjFutur);
    this.missionList.push(missionsObjPast);

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
          this.missionList[0].list = missionNow;
          this.missionList[0].loaded = true;
          this.missionList[1].list = missionFutur;
          this.missionList[1].loaded = true;
          this.missionList[2].list = missionPast;
          this.missionList[2].loaded = true;
        });
      }
    });
  }

  toStringDate(date: any) {
    if (date)
      date = new Date(date);
    else
      date = new Date();
    return date.getDate() + '/' + (parseInt(date.getMonth()) + 1) + '/' + date.getFullYear();
  }

  goToMissionDetailsPage(contract) {
    this.nav.push(MissionDetailsPage, {contract: contract});
  }

  /*goToMissionPointingPage(contract) {
    this.nav.push(MissionPointingPage, {contract: contract});
  }*/

  isEmpty(str) {
    if (str == '' || str == 'null' || !str)
      return true;
    else
      return false;
  }

  upperCase(str) {
    if (this.isEmpty(str))
      return '';
    return str.toUpperCase();
  }
}
