import {Component} from "@angular/core";
import {NavController, ViewController, NavParams} from "ionic-angular";
import {ParametersService} from "../../providers/parameters-service/parameters-service";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

@Component({
  templateUrl: 'offer-quote.html'
})
export class OfferQuotePage {
  public offer: any;
  public service: ParametersService;
  public viewCtrl: ViewController;
  public navParams: NavParams;

  public rate: number = 0;
  public rateLabel: string = '';
  public nbHours: number = 0;
  public estimatedPayment: number = 0;
  public missionCosts: number = 0;
  public TFAmount: number = 0;
  public taxRate: string = '20 %';
  public tax: number = 0.0;
  public TaxAmount: number = 0;
  public TotalAmount: number = 0;
  public isEmployer:boolean;
  public themeColor: string;

  constructor(public nav: NavController,
              viewCtrl: ViewController,
              service: ParametersService,
              navParams: NavParams, public gc:GlobalConfigs) {

    this.navParams = navParams;
    this.viewCtrl = viewCtrl;
    this.service = service;
    this.isEmployer = (gc.getProjectTarget() === 'employer');
    let config = Configs.setConfigs(gc.getProjectTarget());
    this.themeColor = config.themeColor;

    this.offer = navParams.get('currentOffer');
    console.log(JSON.stringify(this.offer));
    this.nbHours = 0;

    this.missionCosts = 6;
    this.taxRate = '20,00 %';
    this.tax = 0.2;

    for (let i = 0; i < this.offer.calendarData.length; i++) {
      let nbMinutes = Math.abs(this.offer.calendarData[i].endHour - this.offer.calendarData[i].startHour);
      this.nbHours += nbMinutes * 1.0 / 60.0;   //  In order to avoid euclidian division
    }

    this.service.getRates().then((data: Array<any>) => {
      for (let i = 0; i < data.length; i++) {
        if (this.offer.jobData.remuneration < data[i].taux_horaire) {
          this.rate = parseFloat(data[i].coefficient) * this.offer.jobData.remuneration;
          this.rateLabel = data[i].libelle;
          break;
        }
      }

      this.estimatedPayment = this.nbHours * this.rate;
      this.TFAmount = this.estimatedPayment + this.missionCosts;
      this.TaxAmount = this.tax * this.TFAmount;
      this.TotalAmount = this.TFAmount + this.TaxAmount;
    });
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
