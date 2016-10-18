import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import { FinanceService } from '../../providers/finance-service/finance-service'

@Component({
    templateUrl: 'build/pages/offer-temp-quote/offer-temp-quote.html',
    providers:[FinanceService]
})
export class OfferTempQuotePage {
    quote : any;
    taxeRate: number = 0.2;
    amountBeforeTaxes: number  = 0;
    taxes:number = 0;
    total:number = 0;
    constructor(private nav: NavController,
                private service : FinanceService,
                navParams : NavParams) {
        //debugger;
        let id = navParams.data.idOffer;
        this.service.loadPrevQuote(id).then(data=>{
            this.quote = data;
            for (let i=0; i< this.quote.lignes.length; i++) {
                this.amountBeforeTaxes += parseFloat(this.quote.lignes[i].valeur);
            }
            this.taxes = this.amountBeforeTaxes * this.taxeRate;
            this.total = this.amountBeforeTaxes + this.taxes;
            console.log(JSON.stringify(this.quote));
        });
        this.initQuote();
    }

    initQuote(){
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

    formatHour(minutes){
        let h = Math.floor(minutes/60);
        let m = minutes%60;
        let sh = h<10?'0'+h:''+h;
        let sm = m<10?'0'+m:''+m;
        return sh+':'+sm;
    }

    formatPercent(rate){
        return (rate*100)+' %';
    }

    closeModal(){
        this.nav.pop();
    }

    notNullValue(r) {
        return !(parseInt(r.valeur) == 0);
    }
}
