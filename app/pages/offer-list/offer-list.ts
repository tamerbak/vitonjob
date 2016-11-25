import {NavController, Storage, SqlStorage, Toast, Loading} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {Configs} from "../../configurations/configs";
import {OfferAddPage} from "../offer-add/offer-add";
import {OfferDetailPage} from "../offer-detail/offer-detail";
import {OffersService} from "../../providers/offers-service/offers-service";
import {isUndefined} from "ionic-angular/util";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global.service";
import {SearchResultsPage} from "../search-results/search-results";

/*
 Generated class for the OfferListPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/offer-list/offer-list.html',
    providers: [SearchService, OffersService, GlobalService, SearchService]
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
    showPublishedOffers = false;
    showUnpublishedOffers = false;
    showHunterOffers = false;
    showObsoleteOffers:boolean = false;
    detailsIconName1:string = "add";
    detailsIconName2:string = "add";
    detailsIconName3:string = "add";
    detailsIconName4:string = "add";
    searchService:any;
    isHunter:boolean = false;

    constructor(public nav:NavController,
                public gc:GlobalConfigs,
                public search:SearchService,
                public offersService:OffersService, private globalService:GlobalService, private searchService:SearchService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        this.isHunter = gc.getHunterMask();

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
        this.searchService = searchService;

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
        let obsoleteOffers:any = [];
        this.offerService.loadOfferList(this.projectTarget).then(data => {
            // TEL26082016 ref : http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
            this.globalOfferList.length = 0;
            this.globalOfferList.push({header: 'Mes offres en ligne', list: []});
            this.globalOfferList.push({header: 'Mes offres obsolètes', list: []});
            this.globalOfferList.push({header: 'Mes offres privées', list: []});
            this.globalOfferList.push({header: 'Mes opportunités capturées', list: []});
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

                    //verify if offer is obsolete
                    for (var j = 0; j < offer.calendarData.length; j++) {
                        var slotDate = offer.calendarData[j].date;
                        var startH = this.offersService.convertToFormattedHour(offer.calendarData[j].startHour);
                        slotDate = new Date(slotDate).setHours(startH.split(':')[0], startH.split(':')[1]);
                        var dateNow = new Date().getTime();
                        if (slotDate <= dateNow) {
                            offer.obsolete = true;
                            break;
                        } else {
                            offer.obsolete = false;
                        }
                    }

                    if (offer.idHunter && !(offer.idHunter = 0)) {
                        this.globalOfferList[3].list.push(offer);
                    } else {
                        if (!offer.obsolete)
                            this.globalOfferList[0].list.push(offer);
                        else
                            this.globalOfferList[1].list.push(offer);
                    }

                    let searchFields = {
                        class: 'com.vitonjob.callouts.recherche.SearchQuery',
                        job: offer.jobData.job,
                        metier: '',
                        lieu: '',
                        nom: '',
                        entreprise: '',
                        date: '',
                        table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
                        idOffre: '0'
                    };
                    this.searchService.criteriaSearch(searchFields, this.projectTarget).then(data => {
                        offer.correspondantsCount = data.length;
                        this.globalOfferList[0].list.sort((a, b) => {
                            return (b.correspondantsCount - a.correspondantsCount);
                        });
                        this.globalOfferList[1].list.sort((a, b) => {
                            return (b.correspondantsCount - a.correspondantsCount);
                        });
                        //debugger;
                        //this.globalOfferList[0].list.concat(obsoleteOffers);
                    });


                } else {
                    offer.color = 'grey';
                    offer.correspondantsCount = -1;
                    //unpublishedList.push (offer);
                    this.globalOfferList[2].list.push(offer);
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
                this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
            }
        });
    }

    showOfferList(type) {

        if (type == 'Mes offres en ligne') {
            this.showPublishedOffers = !(this.showPublishedOffers);
            this.detailsIconName1 = (this.showPublishedOffers) ? 'remove' : 'add';
        } else if (type == 'Mes offres privées') {
            this.showUnpublishedOffers = !(this.showUnpublishedOffers);
            this.detailsIconName2 = (this.showUnpublishedOffers) ? 'remove' : 'add';
        } else if (type == 'Mes opportunités capturées') {
            this.showHunterOffers = !(this.showHunterOffers);
            this.detailsIconName3 = (this.showHunterOffers) ? 'remove' : 'add';
        } else if (type == 'Mes offres obsolètes') {
            this.showObsoleteOffers = !(this.showObsoleteOffers);
            this.detailsIconName4 = (this.showObsoleteOffers) ? 'remove' : 'add';
        }


    }

    /**
     * @Description : Launch search from current offer-list
     */
    launchSearch(offer) {
        console.log(offer);
        if (!offer)
            return;
        let loading = Loading.create({
            content: ` 
                <div>
                    <img src='img/loading.gif' />
                </div>
                `,
            spinner: 'hide'
        });
        this.nav.present(loading);
        let searchFields = {
            class: 'com.vitonjob.callouts.recherche.SearchQuery',
            job: offer.jobData.job,
            metier: '',
            lieu: '',
            nom: '',
            entreprise: '',
            date: '',
            table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
            idOffre: '0'
        };
        this.searchService.criteriaSearch(searchFields, this.projectTarget).then(data => {
            console.log(data);
            this.searchService.persistLastSearch(data);
            loading.dismiss();
            this.nav.push(SearchResultsPage, {currentOffer: offer});
        });
    }
}
