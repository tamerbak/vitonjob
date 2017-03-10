import {Component} from "@angular/core";
import {NavController, NavParams, LoadingController} from "ionic-angular";
import {FinanceService} from "../../providers/finance-service/finance-service";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

@Component({
  templateUrl: 'offer-temp-quote.html'
})
export class OfferTempQuotePage {
  public quote: any;
  public taxeRate: number = 0.2;
  public amountBeforeTaxes: number = 0;
  public taxes: number = 0;
  public total: number = 0;
  public isEmployer:boolean;
  public themeColor:string;
  public loading:any;

  constructor(private nav: NavController,
              private service: FinanceService,
              navParams: NavParams, public gc:GlobalConfigs,
              public _loading: LoadingController) {

    this.isEmployer = (gc.getProjectTarget() === 'employer');
    this.themeColor = Configs.setConfigs(gc.getProjectTarget()).themeColor;
    let id = navParams.data.idOffer;
    this.loading = _loading;

    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.service.loadPrevQuote(id).then((data: any) => {
      this.quote = data;
      for (let i = 0; i < this.quote.lignes.length; i++) {
        this.amountBeforeTaxes = +this.amountBeforeTaxes.toFixed(2) + +this.quote.lignes[i].valeur.toFixed(2);
        if(this.quote.lignes[i].unite  && this.quote.lignes[i].unite == 'IJ')
          this.quote.lignes[i].unite = 'J';
        if(this.quote.lignes[i].unite  && this.quote.lignes[i].unite == 'IH')
          this.quote.lignes[i].unite = 'H';
      }
      this.taxes = +this.amountBeforeTaxes.toFixed(2) * +this.taxeRate.toFixed(2);
      this.total = +this.amountBeforeTaxes.toFixed(2) + +this.taxes.toFixed(2);
      loading.dismiss();
      console.log(JSON.stringify(this.quote));
    });

    this.initQuote();
  }

  initQuote() {
    this.quote = {
      "amountBeforeTaxes": 0.0,
      "class": "com.vitonjob.callouts.finance.Quote",
      "dateDevis": 0,
      "hours": [],
      "numero": "",
      "taxeRate": 0.0,
      "taxes": 0.0,
      "total": 0.0
    }
  }

  formatHour(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    let sh = h < 10 ? '0' + h : '' + h;
    let sm = m < 10 ? '0' + m : '' + m;
    return sh + ':' + sm;
  }

  formatPercent(rate) {
    return (rate * 100) + ' %';
  }

  closeModal() {
    this.nav.pop();
  }

  notNullValue(r) {
    return !(parseInt(r.valeur) == 0);
  }
}
