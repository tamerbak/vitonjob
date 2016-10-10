import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {FinanceService} from "../../providers/finance-service/finance-service";
import {MissionEndRelevePage} from "../mission-end-releve/mission-end-releve";
import {MissionListPage} from "../mission-list/mission-list";

/*
 Generated class for the MissionEndInvoicePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/mission-end-invoice/mission-end-invoice.html',
    providers : [FinanceService]
})
export class MissionEndInvoicePage {
    invoice : any;
    idInvoice : number;
    unSigned : boolean = false;
    constructor(private nav: NavController,
                private navParams : NavParams,
                private service : FinanceService) {

        this.idInvoice = navParams.data.idInvoice;
        this.invoice = {
            url_signature_de_facture : '',
            demande_de_signature_de_facture : ''
        };

        this.service.loadInvoiceSignature(this.idInvoice).then(data=>{
           //debugger;
            this.invoice = data;
            this.unSigned = (this.invoice.facture_signee == "Non");
            if(this.unSigned)
                this.initYousign();
        });
    }

    initYousign(){
        //get the link yousign of the contract for the employer
        let yousignEmployerLink = this.invoice.url_signature_de_facture;

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

    getBackToMissions(){
        this.nav.pop();
    }


}
