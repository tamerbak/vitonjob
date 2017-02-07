import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
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

  constructor(private nav: NavController,
              private service: FinanceService,
              navParams: NavParams, public gc:GlobalConfigs) {

    this.isEmployer = (gc.getProjectTarget() === 'employer');
    this.themeColor = Configs.setConfigs(gc.getProjectTarget()).themeColor;
    let id = navParams.data.idOffer;
    this.service.loadPrevQuote(id).then((data: any) => {
      this.quote = data;
      for (let i = 0; i < this.quote.lignes.length; i++) {
        this.amountBeforeTaxes += parseFloat(this.quote.lignes[i].valeur);
      }
      this.taxes = this.amountBeforeTaxes * this.taxeRate;
      this.total = this.amountBeforeTaxes + this.taxes;
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
