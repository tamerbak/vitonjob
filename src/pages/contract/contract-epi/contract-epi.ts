import {Component} from "@angular/core";
import {NavController, LoadingController, NavParams, ViewController} from "ionic-angular";
import {Configs} from "../../../configurations/configs";
import {LoadListService} from "../../../providers/load-list-service/load-list-service";
import {GlobalConfigs} from "../../../configurations/globalConfigs";
import {Utils} from "../../../utils/utils";


@Component({
  templateUrl: 'contract-epi.html'
})
export class ContractEpiPage {
  public selectedEpi: String;
  public epis: any = [];
  public savedEpis: any = [];
  public currentUser: any;
  public projectTarget: string;
  public themeColor: string;
  public providedBy: string;

  constructor(private nav: NavController,
              private navParams: NavParams,
              private loadingCtrl:LoadingController,
              private listService: LoadListService,
              public gc:GlobalConfigs,
              public viewCtrl: ViewController) {
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;

    this.savedEpis = navParams.get('savedEpis');
  }

  ngOnInit(){
    let loading = this.loadingCtrl.create({content:"Merci de patienter..."});
    loading.present();
    this.listService.loadEPI().then((results: any) => {
      loading.dismiss();
      if (results)
        this.epis = results;
    });
  }



  addEpi() {
    let epi = this.selectedEpi + " fourni par " + this.providedBy;
    if(this.savedEpis.indexOf(epi) != -1){
      return;
    }else{
      this.savedEpis.push(epi);
    }
  }

  removeEpi(i) {
    this.savedEpis.splice(i, 1);
  }

  validateModal() {
    this.viewCtrl.dismiss(this.savedEpis);
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  isEmpty(str){
    return Utils.isEmpty(str);
  }
}