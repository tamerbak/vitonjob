import {NavController, ViewController, AlertController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {LoadListService} from "../../providers/load-list-service/load-list-service";
import {Component} from "@angular/core";

@Component({
  templateUrl: 'modal-software.html'
})
export class ModalSoftwarePage {

  public softwares: Array<{
    id: number,
    nom: string,
  }>;
  public savedSoftwares: any[];
  public projectTarget: string;
  public themeColor: string;
  public inversedThemeColor: string;
  public isEmployer: boolean;
  public viewCtrl: any;
  public listService: any;
  public software: any = {id:0, nom: ""};

  constructor(public nav: NavController,
              gc: GlobalConfigs,
              viewCtrl: ViewController,
              params: NavParams,
              listService: LoadListService,
              public alert: AlertController) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
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
    this.savedSoftwares.push(soft);
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
            this.savedSoftwares.splice(this.softwares.indexOf(item), 1);
          }
        }
      ]
    });
    confirm.present();
  }
}
