import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchDetailsPage} from "../search-details/search-details";
import {Storage} from "@ionic/storage";

@Component({
  templateUrl: 'pending-contracts.html'
})
export class PendingContractsPage {
  public isEmployer: boolean = false;
  public contractList: any = [];
  public themeColor: string;

  public projectTarget: any;
  public backgroundImage: any;
  public backGroundColor:string;

  constructor(private nav: NavController,
              public gc: GlobalConfigs, public db: Storage) {

    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    this.backgroundImage = config.backgroundImage;
    this.backGroundColor = config.backGroundColor;

    this.isEmployer = this.projectTarget === 'employer';

    // Set store variables and messages
    this.themeColor = config.themeColor;

    this.db.get('PENDING_CONTRACTS').then(contrats => {

      if (contrats) {
        this.contractList = JSON.parse(contrats);
        //temporarely : do not display old pending contracts (that dont have jobyer and offer objects included)
        for (let i = 0; i < this.contractList.length; i++) {
          if (!this.contractList[i].jobyer) {
            this.contractList.splice(i, 1);
          }
        }
        //temporarely : should be removed after saving pending contracts in server
      }
    });
  }

  selectContract(item) {
    this.nav.push(SearchDetailsPage, {searchResult: item.jobyer, currentOffer: item.offer});//, delegate : this
  }

  removeContract(item) {
    let index = -1;
    for (let i = 0; i < this.contractList.length; i++)
      if (this.contractList[i].idOffre == item.jobyer.idOffre) {
        index = i;
        break;
      }
    if (index < 0)
      return;

    this.contractList.splice(index, 1);
    this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contractList));
  }

  //TODO : Adding delete button to every item

}
