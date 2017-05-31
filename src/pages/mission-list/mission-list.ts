import {Component} from "@angular/core";
import {LoadingController, NavController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ContractService} from "../../providers/contract-service/contract-service";
import {MissionDetailsPage} from "../mission-details/mission-details";
//import {MissionPointingPage} from "../mission-pointing/mission-pointing";
import {Storage} from "@ionic/storage";
import {Utils} from "../../utils/utils";
import {MissionDetailsJobyerPage} from "../mission-details-jobyer/mission-details-jobyer";

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
  public config: any;

  public employer: any;
  public jobyer: any;
  public contractList: any;
  public missionListTitle: string;
  public currentUserVar: string;
  public inversedThemeColor: string;
  public backgroundImage: any;
  public currentUser: any;
  public backGroundColor:string;

  public missionList: any;
  public missionsType: string = "current";
  public recentActiveSegment: String;

  public missionsNow: any = [];
  public missionsFutur: any = [];
  public missionsPast: any = [];
  public missionsCanceled: any = [];
  public isLeaving: boolean = false;

  //determine the number of elements that should be skipped by the query
  public currentMissionOffset: number = 0;
  public finishedMissionOffset: number = 0;
  //determine the number of elemens to be retrieved by the query
  public queryLimit: number = 5;

  public userId: number;

  constructor(public gc: GlobalConfigs,
              public nav: NavController,
              private contractService: ContractService,
              public storage:Storage,
              public loading: LoadingController) {
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    this.config = Configs.setConfigs(this.projectTarget);
    // Set store variables and messages
    this.themeColor = this.config.themeColor;
    this.inversedThemeColor = this.config.inversedThemeColor;
    this.currentUserVar = this.config.currentUserVar;
    this.backgroundImage = this.config.backgroundImage;
    this.missionListTitle = "Suivi des missions";
    this.isEmployer = (this.projectTarget == 'employer');
    this.backGroundColor = this.config.backGroundColor;

  }

  ionViewWillEnter() {
    this.isLeaving = false;
    let currentUserVar = this.config.currentUserVar;
    this.storage.get(this.currentUserVar).then((value) => {
      if (!Utils.isEmpty(value)) {
        this.currentUser = JSON.parse(value);
        this.userId = (this.isEmployer ? this.currentUser.employer.entreprises[0].id : this.currentUser.jobyer.id);

        this.onSegmentChange();
      }
    });
  }

  onSegmentChange(){
    if (!Utils.isEmpty(this.recentActiveSegment) && this.recentActiveSegment == this.missionsType) {
      return;
    } else {
      this.recentActiveSegment = this.missionsType;
      if (this.missionsType == "current" && this.missionsNow.length == 0) {
        this.missionList = [];
        this.loadMissions();
        return;
      }
      if (this.missionsType == "current" && this.missionsNow.length > 0) {
        this.missionList = Utils.cloneObject(this.missionsNow);
      }
      if (this.missionsType == "finished" && this.missionsPast.length == 0) {
        this.missionList = [];
        this.loadMissions();
        return;
      }
      if (this.missionsType == "finished" && this.missionsPast.length > 0) {
        this.missionList = Utils.cloneObject(this.missionsPast);
        return;
      }
    }
  }

  loadMissions(){
    return new Promise(resolve => {
      if(this.missionsType == 'current'){
        this.loadMissionsByCriteria(this.missionsNow, this.userId, "current").then(() =>{
          resolve();
        });
        return;
      }

      if(this.missionsType == 'finished'){
        this.loadMissionsByCriteria(this.missionsPast, this.userId, "finished").then(() =>{
          resolve();
        });
        return;
      }
    });
  }

  loadMissionsByCriteria(list, userId, mode){
    return new Promise(resolve => {
      let loading;
      //loading should be displayed in the first call of the service. after that the infinit scroll loading icon is displyed
      if(list.length == 0) {
        loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();
      }

      this.contractService.getContractsByType((mode == "current" ? 0 : 2), (mode == "current" ? this.currentMissionOffset: this.finishedMissionOffset), this.queryLimit, userId, (this.isEmployer ? "employer" : "jobyer")).then((data: any) => {
        if(list.length == 0 && loading) {
          loading.dismiss();
        }
        //in case the user chooses another segment before the data loading is completed
        if(!Utils.isEmpty(this.recentActiveSegment) && this.recentActiveSegment != mode){
          resolve();
          return;
        }

        if(data && data.data && data.status == "success"){
          list = list.concat(data.data);
          this.missionList = Utils.cloneObject(list);
          if(mode == "finished") {
            this.finishedMissionOffset = this.finishedMissionOffset + this.queryLimit;
            this.missionsPast = list;
          }else{
            this.currentMissionOffset = this.currentMissionOffset + this.queryLimit;
            this.missionsNow = list;
          }
        }
        resolve();
      });
    });
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
    setTimeout(() => {
      this.loadMissions().then(() => {
        console.log('Async operation has ended');
        infiniteScroll.complete();
      });
    }, 500);
  }

  toStringDate(date: any) {
    if (date)
      date = new Date(date);
    else
      date = new Date();
    return date.getDate() + '/' + (parseInt(date.getMonth()) + 1) + '/' + date.getFullYear();
  }

  goToMissionDetailsPage(contract) {
    if(this.isEmployer) {
      this.nav.push(MissionDetailsPage, {contract: contract});
    }else{
      this.nav.push(MissionDetailsJobyerPage, {contract: contract});
    }
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
