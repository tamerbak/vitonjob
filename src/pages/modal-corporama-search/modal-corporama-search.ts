import {
  NavController,
  ViewController,
  LoadingController
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Component} from "@angular/core";
import {CorporamaService} from "../../providers/corporama-service/corporama-service";
import {Utils} from "../../utils/utils";
import {GlobalService} from "../../providers/global-service/global-service";

declare let require: any;

@Component({
  templateUrl: 'modal-corporama-search.html'
})

export class ModalCorporamaSearchPage {
  public typeSearch: string = "company";
  public inputSearch: string = '';
  public companies = [];
  public hasToRedirect: boolean = false;
  public searchPlaceholder: string = "Nom de l'entreprise";
  public viewCtrl: ViewController;
  public isSIRENValid: boolean = true;
  public noResult: boolean = false;
  public projectTarget: string;
  public themeColor: string;
  public isEmployer: boolean;

  constructor(public nav: NavController,
              viewCtrl: ViewController,
              private globalService: GlobalService,
              gc: GlobalConfigs,
              private corporamaService: CorporamaService, public loading: LoadingController) {
    // Set global configs
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.viewCtrl = viewCtrl;
  }

  onCompanynameSelected() {
    if (this.typeSearch == "company") {
      return;
    }
    this.searchPlaceholder = "Nom de l'entreprise";
    this.initForm();
  }

  onSIRENSelected() {
    if (this.typeSearch == "siren") {
      return;
    }
    this.searchPlaceholder = "SIREN";
    this.initForm();
  }

  searchCompany() {
    this.noResult = false;
    if (!this.isInputValid()) {
      return;
    }

    this.hasToRedirect = false;
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.corporamaService.searchCompany(this.typeSearch, this.inputSearch).then((data: any) => {
      if (!data || data.status == "failure" || Utils.isEmpty(data._body)) {
        console.log(data);
        loading.dismiss();
        this.globalService.showAlertValidation("Vit-On-Job", "Service indisponible. Veuillez réessayer ultérieurement.");
        return;
      } else {
        data = JSON.parse(data._body);
        this.companies = this.corporamaService.convertSearchResponse(data);

        //if no result was returned
        if (!this.companies || this.companies.length == 0) {
          this.noResult = true;
        }
        if (this.companies.length == 1) {
          if (Utils.isEmpty(this.companies[0].name)) {
            this.noResult = true;
          }
        }
      }
      loading.dismiss();
    });
  }

  takeAction(company) {
    /*let loadingCtrl = this.alert.create({
     content: `
     <div>
     <img src='assets/img/loadingCtrl.gif' />
     </div>
     `,
     spinner: 'hide',
     });
     loadingCtrl.present();*/
    if (this.typeSearch == "siren" || this.hasToRedirect) {
      //loadingCtrl.dismiss();
      this.viewCtrl.dismiss(company);
    } else {
      this.corporamaService.searchCompany("siren", company.siren).then((data: any) => {
        if (!data || data.status == "failure" || Utils.isEmpty(data._body)) {
          console.log(data);
          //loadingCtrl.dismiss();
          this.globalService.showAlertValidation("Vit-On-Job", "Service indisponible. Veuillez réessayer ultérieurement.");
          return;
        } else {
          data = JSON.parse(data._body);
          this.companies = this.corporamaService.convertSearchResponse(data);
          this.hasToRedirect = true;
          //loadingCtrl.dismiss();
        }
      })
    }
  }

  isInputValid() {
    if (this.typeSearch == "siren") {
      if (!Utils.isNumber(this.inputSearch) || this.inputSearch.length != 9) {
        this.isSIRENValid = false
        return false;
      }
    }
    if (this.typeSearch == "company") {
      if (Utils.isEmpty(this.inputSearch)) {
        return false;
      }
    }
    return true;
  }

  initForm() {
    this.inputSearch = "";
    this.companies = [];
    this.hasToRedirect = false;
    this.isSIRENValid = true;
    this.noResult = false;
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
