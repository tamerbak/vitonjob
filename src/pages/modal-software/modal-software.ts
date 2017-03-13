import {NavController, ViewController, AlertController,LoadingController, NavParams,Events} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {LoadListService} from "../../providers/load-list-service/load-list-service";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global-service/global-service";
import {AuthenticationService} from "../../providers/authentication-service/authentication-service";
import {Storage} from "@ionic/storage";
import {Utils} from "../../utils/utils";

@Component({
  templateUrl: 'modal-software.html'
})
export class ModalSoftwarePage {

  //nb work and study hours
  public nbWorkVitOnJob: number = 0;
  public nbWorkHours: number = 0;
  public isNbStudyHoursBig: string = "false";

  public currentUserVar: string;
  


  public softwares: Array<{
    id: number,
    libelle: string,
  }>;
  public savedSoftwares: any[];
  public projectTarget: string;
  public currentUser:any;
  public themeColor: string;
  public inversedThemeColor: string;
  public isEmployer: boolean;
  public viewCtrl: any;
  public listService: any;
  public software: any = {id:0, libelle: "",niveau:1};

  constructor(public nav: NavController,
              gc: GlobalConfigs,
              private storage:Storage,
              public events:Events,
              private globalService:GlobalService,
              private authService:AuthenticationService,
              private loading:LoadingController,
              viewCtrl: ViewController,
              params: NavParams,
              listService: LoadListService,
              public alert: AlertController) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();
        
    this.currentUser = params.get('currentUser');
    console.log(this.currentUser);
    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    this.currentUserVar = config.currentUserVar;
    // Set local variables
    this.themeColor = config.themeColor;
    this.inversedThemeColor = config.inversedThemeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.viewCtrl = viewCtrl;
    this.listService = listService;
    this.initializeSoftwareList();
    let savedSoftwares = params.get('savedSoftwares');
    if(savedSoftwares.length == 0){
      this.savedSoftwares = [];
    }else{
      this.savedSoftwares = savedSoftwares;
    }
    this.initWorkHoursParams();
  }

  initWorkHoursParams(){
    this.nbWorkHours = this.currentUser.jobyer.nbWorkHours;
    this.nbWorkVitOnJob = this.currentUser.jobyer.nbVitOnJobHours / 60 | 0;
    this.isNbStudyHoursBig = "" + this.currentUser.jobyer.nbStudyHoursBig + "";
  }

  updateJobyerWorkHours(){

    let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present(loading);

    let jobyerId = this.currentUser.jobyer.id;
    let studyHoursBigValue = (this.isNbStudyHoursBig == "true" ? "OUI" : "NON");

    this.authService.updateJobyerWorkHours( jobyerId, this.nbWorkHours, studyHoursBigValue)
        .then((data: {status: string, error: string}) => {
            if (!data || data.status == "failure") {
                console.log(data.error);
                loading.dismiss();
                this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
                return;
            } else {
                // data saved
                console.log("response update works hour : " + data.status);
                
                this.currentUser.jobyer.nbWorkHours = this.nbWorkHours;
                this.currentUser.jobyer.nbVitOnJobHours = this.nbWorkVitOnJob * 60;
                this.currentUser.jobyer.nbStudyHoursBig = (this.isNbStudyHoursBig == "true" ? true : false);

                // PUT IN SESSION
                this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
                this.events.publish('user:civility', this.currentUser);

                loading.dismiss();
                this.closeModal();
            }
        });
  }
            
  

  /**
   * @Description : Initializing softwares list
   */
  initializeSoftwareList() {
    this.listService.loadPharmacieSoftwares().then((data: any) => {
      let softwares = data.data;
      if (softwares && softwares.length > 0) {
        this.softwares = softwares;
      } else {
        this.softwares = [];
      }
    })
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss(this.savedSoftwares);
  }

  /**
   * @Description : Validating software modal
   */
  addSoftware(soft) {
    for(let i = 0; i < this.savedSoftwares.length; i++){
      if(this.savedSoftwares[i].id == soft.id){
        this.savedSoftwares.splice(i, 1);
        break;
      }
    }
    console.log(soft)
    this.savedSoftwares.push(soft);
    this.software = {id:0, libelle: "",niveau:1};
  }

  /**
   * @Description : removing slected software
   */
  removeSoftware(item) {

    let confirm = this.alert.create({
      title: 'Êtes-vous sûr?',
      message: 'Voulez-vous vraiment supprimer ce logiciel?',
      buttons: [
        {
          text: 'Non',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            console.log('Agree clicked');
            this.savedSoftwares.splice(this.savedSoftwares.indexOf(item), 1);
          }
        }
      ]
    });
    confirm.present();
  }

  isEmpty(str){
    return Utils.isEmpty(str);
  }
}
