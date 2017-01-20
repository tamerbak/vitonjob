import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {LoadListService} from "../../providers/load-list-service/load-list-service";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";


@Component({
  templateUrl: 'profile-languages.html'
})
export class ProfileLanguagesPage {
  public selectedLangue: string;
  public langues: any = [];
  public savedLangues: any = [];
  public currentUser: any;
  public isEmployer: boolean;
  public projectTarget: string;
  public themeColor: string;

  constructor(private nav: NavController,
              private navParams: NavParams,
              private profileService: ProfileService,
              private listService: LoadListService, public gc:GlobalConfigs) {
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
    this.currentUser = navParams.data.currentUser;
    this.isEmployer = navParams.data.isEmployer;
    this.listService.loadLanguages().then((results: any) => {
      if (results.data)
        this.langues = results.data;
    });
    let idUser = this.isEmployer ?
      this.currentUser.employer.entreprises[0].id :
      this.currentUser.jobyer.id;
    let projectType = this.isEmployer ? 'employer' : 'jobyer';
    this.profileService.getUserLanguages(idUser, projectType).then((results: any) => {
      this.savedLangues = results;
    });
  }

  addLangue() {

    let found = false;
    let q = null;
    for (let i = 0; i < this.langues.length; i++)
      if (this.selectedLangue == this.langues[i].id) {
        found = true;
        q = this.langues[i];
        break;
      }

    if (!found)
      return;

    for (let i = 0; i < this.savedLangues.length; i++)
      if (this.savedLangues[i].id == q.id)
        return;

    this.savedLangues.push(q);
    let idUser = this.isEmployer ?
      this.currentUser.employer.entreprises[0].id :
      this.currentUser.jobyer.id;
    let projectType = this.isEmployer ? 'employer' : 'jobyer';
    this.profileService.saveLanguages(this.savedLangues, idUser, projectType);
  }

  removeLangue(q) {
    let index = this.savedLangues.indexOf(q);
    this.savedLangues.splice(index, 1);
    let idUser = this.isEmployer ?
      this.currentUser.employer.entreprises[0].id :
      this.currentUser.jobyer.id;
    let projectType = this.isEmployer ? 'employer' : 'jobyer';
    this.profileService.saveLanguages(this.savedLangues, idUser, projectType);
  }
}
