import {Component} from '@angular/core';
import {NavController, ViewController, NavParams} from 'ionic-angular';
import {NewOpportunityPage} from "../new-opportunity/new-opportunity";
import {OpportunityFillPage} from "../opportunity-fill/opportunity-fill";
import {JobyerNewPage} from "../jobyer-new/jobyer-new";
import {ContactsPage} from "../contacts/contacts";
import {EntreprisePage} from "../entreprise/entreprise";

/*
 Generated class for the ModalChoicePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-tutorial/modal-tutorial.html',
})
export class ModalTutorialPage {
    pictureMessage:string;
    offerMessage:{header:string, body:string};
    personMessage:{header:string, body:string};
    inviteMessage:{header:string, body:string};
    //isEmployerChoice:boolean;
    pushPicturePage: any;
    pushOfferPage: any;
    pushInvitePage : any;
    pushPersonPage : any;
    paramsOfferPage: any;
    paramsInvitePage: any;
    content:any;

    constructor(public nav:NavController, public viewCtrl:ViewController, public params:NavParams) {

        this.content = params.get('content');

    }

    closeModal() {
        this.viewCtrl.dismiss();
    }
}
