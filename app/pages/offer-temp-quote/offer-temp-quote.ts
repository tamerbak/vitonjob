import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import { FinanceService } from '../../providers/finance-service/finance-service'

@Component({
    templateUrl: 'build/pages/offer-temp-quote/offer-temp-quote.html',
    providers:[FinanceService]
})
export class OfferTempQuotePage {
    quote : any;
    constructor(private nav: NavController,
                private service : FinanceService,
                navParams : NavParams) {
       //debugger;
        let id = navParams.data.idOffer;
        this.service.loadPrevQuote(id).then(data=>{
            this.quote = data;
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
}
