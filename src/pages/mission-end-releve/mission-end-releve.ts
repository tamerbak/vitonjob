import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {FinanceService} from "../../providers/finance-service/finance-service";
import {Configs} from "../../configurations/configs";

/*
 Generated class for the MissionEndRelevePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'mission-end-releve.html'
})
export class MissionEndRelevePage {
  public invoice: any;
  public isEmployer: boolean;
  public idInvoice: number;
  public unSigned: boolean = false;
  public themeColor:string;

  constructor(private nav: NavController,
              public globalConfig: GlobalConfigs,
              private navParams: NavParams,
              private service: FinanceService) {
    this.idInvoice = navParams.data.idInvoice;
    this.isEmployer = globalConfig.getProjectTarget() === 'employer';
    let configs:any= Configs.setConfigs(globalConfig.getProjectTarget());
    this.themeColor = configs.themeColor;
    this.invoice = {
      url_signature_de_releve_employeur: '',
      url_signature_de_releve_jobyer: ''
    };

    this.service.loadInvoiceSignature(this.idInvoice).then((data: any) => {

      this.invoice = data;

      if (this.isEmployer) {
        this.unSigned = (this.invoice.releve_signe_employeur == "Non");
        if (this.unSigned)
          this.initEmployerYousign();
      } else {
        this.unSigned = (this.invoice.releve_signe_jobyer == "Non");
        if (this.unSigned)
          this.initJobyerYousign();
      }
    });


  }

  initEmployerYousign() {
    //get the link yousign of the contract for the employer
    let yousignEmployerLink = this.invoice.url_signature_de_releve_employeur;

    //Create to Iframe to show the contract in the NavPage
    let iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.id = "youSign";
    iframe.style.overflow = "hidden";
    iframe.style.height = "100%";
    iframe.style.width = "100%";
    iframe.setAttribute("src", yousignEmployerLink);

    document.getElementById("iframPlaceHolder").appendChild(iframe);
  }

  initJobyerYousign() {
    //get the link yousign of the contract for the employer
    let yousignEmployerLink = this.invoice.url_signature_de_releve_jobyer;

    //Create to Iframe to show the contract in the NavPage
    let iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.id = "youSign";
    iframe.style.overflow = "hidden";
    iframe.style.height = "100%";
    iframe.style.width = "100%";
    iframe.setAttribute("src", yousignEmployerLink);

    document.getElementById("iframPlaceHolder").appendChild(iframe);
  }

  gotoInvoice() {
    this.nav.pop();
  }
}
