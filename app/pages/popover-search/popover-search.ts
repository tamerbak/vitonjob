import {Component} from '@angular/core';
import {NavController, Modal} from 'ionic-angular';
import {SearchCriteriaPage} from "../search-criteria/search-criteria";
import {SearchGuidePage} from "../search-guide/search-guide";

/*
 Generated class for the PopoverSearchPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/popover-search/popover-search.html',
})
export class PopoverSearchPage {

    popInCriteria:boolean = false;

    constructor(public nav:NavController) {
    }

    /**
     * @description this method allows to render the multicriteria modal component
     */
    showCriteriaModal()
    {
        var dismissedModal = function () {
            this.popInCriteria = false;
        };

        if (this.popInCriteria)
            return;
        let m = new Modal(SearchCriteriaPage);
        m.onDismiss(dismissedModal.bind(this));
        this.popInCriteria = true;
        this.nav.present(m);
    }

    /**
     * @description this method allows to render the guided search modal component
     */
    showGuideModal()
    {
        var dismissedModal = function () {
            this.popInCriteria = false;
        };

        if (this.popInCriteria)
            return;
        let m = new Modal(SearchGuidePage);
        m.onDismiss(dismissedModal.bind(this));
        this.popinCrietria = true;
        this.nav.present(m);
    }


}
