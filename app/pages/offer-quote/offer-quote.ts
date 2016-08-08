import {Component} from '@angular/core';
import {NavController, ViewController, NavParams} from 'ionic-angular';
import {ParametersService} from "../../providers/parameters-service/parameters-service";

@Component({
    templateUrl: 'build/pages/offer-quote/offer-quote.html',
    providers : [ParametersService]
})
export class OfferQuotePage {
    offer : any;
    service : ParametersService;
    viewCtrl : ViewController;
    navParams : NavParams;

    rate : number = 0;
    rateLabel : string = '';
    nbHours : number = 0;
    estimatedPayment : number=0;
    missionCosts : number=0;
    TFAmount : number=0;
    taxRate : string='20 %';
    tax : number = 0.0;
    TaxAmount : number=0;
    TotalAmount : number=0;

    constructor(public nav: NavController,
                viewCtrl : ViewController,
                service : ParametersService,
                navParams : NavParams) {
       //debugger;
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.service = service;

        this.offer = navParams.get('currentOffer');
        console.log(JSON.stringify(this.offer));
        this.nbHours = 0;

        this.missionCosts = 6;
        this.taxRate = '20,00 %';
        this.tax = 0.2;

        for(let i = 0 ; i < this.offer.calendarData.length ; i++){
            let nbMinutes = Math.abs(this.offer.calendarData[i].endHour - this.offer.calendarData[i].startHour);
            this.nbHours+=nbMinutes*1.0/60.0;   //  In order to avoid euclidian division
        }

        this.service.getRates().then(data =>{
            for(let i = 0 ; i < data.length ; i++){
                if(this.offer.jobData.remuneration < data[i].taux_horaire){
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

    closeModal(){
        this.viewCtrl.dismiss();
    }
}
