import {Page, NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from '../../providers/search-service/search-service';

/*
  Generated class for the PhonePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/phone/phone.html',
  providers: [GlobalConfigs, SearchService]
})
export class PhonePage {
  projectTarget: string;
  isEmployer: boolean;
  phoneTitle: string;
  public people: any;

  constructor(public nav: NavController,
              public gc: GlobalConfigs) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.isEmployer = (this.projectTarget=='employer');
    this.phoneTitle = "Téléphone";
  }


}
