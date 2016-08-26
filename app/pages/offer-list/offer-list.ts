import {NavController, Storage, SqlStorage, Toast} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {Configs} from "../../configurations/configs";
import {OfferAddPage} from "../offer-add/offer-add";
import {OfferDetailPage} from "../offer-detail/offer-detail";
import {OffersService} from "../../providers/offers-service/offers-service";
import {isUndefined} from "ionic-angular/util";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global.service";

/*
 Generated class for the OfferListPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/offer-list/offer-list.html',
    providers: [SearchService, GlobalConfigs, OffersService, GlobalService]
})
export class OfferListPage {

    offerList = [];
    offerService:OffersService;
    projectTarget:string;
    backgroundImage:any;
    db:Storage;
    isNewUser = true;
    globalOfferList = [];
    globalService:any;
    showPublishedOffers= false;
    showUnpublishedOffers = false;
    detailsIconName1:string = "add";
    detailsIconName2:string = "add";

    constructor(public nav:NavController,
                public gc:GlobalConfigs,
                public search:SearchService,
                public offersService:OffersService, private globalService:GlobalService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.phoneTitle = "Téléphone";
        this.themeColor = config.themeColor;
        this.listMode = true;
        this.okButtonName = "add";
        this.backgroundImage = config.backgroundImage;
        this.db = new Storage(SqlStorage);
        //this.cancelButtonName = "";
        //this.loadPeople();

        // jQuery code for dragging components
        // console.log($( "#draggable" ).draggable());
        this.globalService = globalService;
        this.offerService = offersService;

        let currentUserVar = config.currentUserVar;
        this.db.get(currentUserVar).then(value => {
            if (value && value != "null") {
                var currentUser = JSON.parse(value);
                if (!currentUser.titre) {
                    this.isNewUser = true;
                } else {
                    this.isNewUser = false;
                }
            }
        });

    }

    onPageWillEnter() {

        this.offerService.loadOfferList(this.projectTarget).then(data => {
            // TEL26082016 ref : http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
            this.globalOfferList.length = 0;
            this.globalOfferList.push({header: 'Mes offres en ligne', list: []});
            this.globalOfferList.push({header: 'Mes brouillons', list: []});
            this.offerList = data;
            for (var i = 0; i < this.offerList.length; i++) {
                let offer = this.offerList[i];
                if (isUndefined(offer) || !offer || !offer.jobData) {
                    continue;
                }
                if (offer.visible) {
                    offer.color = 'black';//'darkgreen';
                    offer.correspondantsCount = -1;
                    //publishedList.push(offer);
                    this.globalOfferList[0].list.push(offer);
                    this.offerService.getCorrespondingOffers(offer, this.projectTarget).then(data => {
                        console.log('getCorrespondingOffers result : ' + data);
                        offer.correspondantsCount = data.length;
                        // Sort offers corresponding to their search results :
                        this.globalOfferList[0].list.sort((a, b) => {
                            return b.correspondantsCount - a.correspondantsCount;
                        })
                    });
                } else {
                    offer.color = 'grey';
                    offer.correspondantsCount = -1;
                    //unpublishedList.push (offer);
                    this.globalOfferList[1].list.push(offer);
                    /*this.offerService.getCorrespondingOffers(offer, this.projectTarget).then(data => {
                     console.log('getCorrespondingOffers result : ' + data);
                     offer.correspondantsCount = data.length;
                     // Sort offers corresponding to their search results :
                     this.globalOfferList[1].list.sort((a, b) => {
                     return b.correspondantsCount - a.correspondantsCount;
                     })
                     });*/
                }
            }
        });
    }

    // Testing a web service call
    /*loadPeople() {
     this.search.load()
     .then(data => {
     this.people = data.results;
     });
     }*/

    onAddOffer() {
        this.listMode = (!this.listMode);
        if (this.mode)
            this.okButtonName = "add";
        else
            this.okButtonName = "checkmark-circle";
    }

    /**
     * @Description: Navigating to new offer page
     */
    goToNewOffer() {
        if (this.isNewUser) {
            this.presentToast("Veuillez remplir les informations de votre profil avant de créer une offre.", 5);
            return;
        } else {
            this.nav.push(OfferAddPage);
        }
    }

    /**
     * @Description: Navigating to detail offer page
     */
    goToDetailOffer(offer) {
        this.nav.push(OfferDetailPage, {selectedOffer: offer});
    }

    getOfferBadge(item) {

        if (isUndefined(item) || !item || !item.pricticesJob || item.pricticesJob.length == 0) {
            item.correspondantsCount = 0;
            return;
        }

        this.offersService.getBadgeCount(item.pricticesJob[0].pricticeJobId, this.projectTarget).then(count => {
            console.log(count);
            item.correspondantsCount = count;
        });
    }

    presentToast(message:string, duration:number) {
        let toast = Toast.create({
            message: message,
            duration: duration * 1000
        });
        this.nav.present(toast);
    }

    autoSearchMode(offer) {
        var mode = offer.rechercheAutomatique ? "Non" : "Oui";
        this.offerService.saveAutoSearchMode(this.projectTarget, offer.idOffer, mode).then(data => {
            if (data && data.status == "success") {
                offer.rechercheAutomatique = !offer.rechercheAutomatique;
                this.offerService.updateOfferInLocal(offer, this.projectTarget);
                //this.nav.pop();
            } else {
                this.globalService.showAlertValidation("VitOnJob", "Une erreur est survenue lors de la sauvegarde des données.");
            }
        });
    }

    showOfferList (type) {

        if (type == 'Mes offres en ligne') {
            this.showPublishedOffers = !(this.showPublishedOffers);
            this.detailsIconName1 = (this.showPublishedOffers)? 'remove' : 'add';

        } else if (type == 'Mes brouillons'){
            this.showUnpublishedOffers = !(this.showUnpublishedOffers);
            this.detailsIconName2 = (this.showUnpublishedOffers)? 'remove' : 'add';
        }


    }
}
