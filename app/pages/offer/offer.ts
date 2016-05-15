import {Page, NavController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {Configs} from "../../configurations/configs";


/*
 Generated class for the OfferPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/offer/offer.html',
    providers: [SearchService]
})
export class OfferPage {

    constructor(public nav:NavController,
                public gc:GlobalConfigs,
                public search:SearchService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.phoneTitle = "Téléphone";

        this.loadPeople();

        // jQuery code for dragging components
        // console.log($( "#draggable" ).draggable());


    }

    // Testing a web service call
    loadPeople() {
        this.search.load()
            .then(data => {
                this.people = data.results;
            });
    }



}
