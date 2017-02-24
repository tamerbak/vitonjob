import {NavController, ToastController, LoadingController, AlertController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {Configs} from "../../configurations/configs";
import {OfferAddPage} from "../offer-add/offer-add";
import {OfferDetailPage} from "../offer-detail/offer-detail";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global-service/global-service";
import {SearchResultsPage} from "../search-results/search-results";
import {Storage} from "@ionic/storage";
import {isUndefined} from "ionic-angular/util/util";
import {Utils} from "../../utils/utils";
import {Offer} from "../../dto/offer";

/*
 Generated class for the OfferListPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'offer-list.html',
    selector: 'offer-list'
})
export class OfferListPage {

    public offerList: Offer[] = [];
    public publicList: Offer[] = [];
    public privateList: Offer[] = [];
    public huntedList: Offer[] = [];

    public projectTarget: string;
    public backgroundImage: any;
    public themeColor: string;
    public backGroundColor: string;
    public config: any;

    public isNewUser = false;
    public isHunter: boolean = false;
    public isEmployer: boolean;
    public currentUser: any;
    public userId: string;

    public isLeaving: boolean = false;

    //determine the number of elements that should be skipped by the query
    public publicOffset: number = 0;
    public privateOffset: number = 0;
    public huntedOffset: number = 0;
    //determine the number of elemens to be retrieved by the query
    public queryLimit: number = 5;

    public recentActiveSegment: String;
    public offersType: string = "public";

    constructor(public nav: NavController,
                public gc: GlobalConfigs,
                public search: SearchService,
                public offerService: OffersService,
                public globalService: GlobalService,
                public searchService: SearchService,
                public loading: LoadingController,
                public toast: ToastController,
                public alert: AlertController,
                public db: Storage) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        this.config = Configs.setConfigs(this.projectTarget);
        this.isHunter = gc.getHunterMask();

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.themeColor = this.config.themeColor;
        this.backgroundImage = this.config.backgroundImage;
        this.backGroundColor = this.config.backGroundColor;
        //this.cancelButtonName = "";
        //this.loadPeople();

        // jQuery code for dragging components
        // console.log($( "#draggable" ).draggable());
    }

    ionViewWillEnter() {
        this.isLeaving = false;
        let currentUserVar = this.config.currentUserVar;
        this.db.get(currentUserVar).then(value => {
            if (!Utils.isEmpty(value)) {
                this.currentUser = JSON.parse(value);
                this.userId = (this.isEmployer ? this.currentUser.employer.entreprises[0].id : this.currentUser.jobyer.id);

                if (!this.currentUser.titre) {
                    this.isNewUser = true;
                } else {
                    this.isNewUser = false;
                }

                this.onSegmentChange();
            }
        });
    }

    // Testing a web service call
    /*loadPeople() {
     this.search.load()
     .then((data:any) => {
     this.people = data.results;
     });
     }*/

    onSegmentChange(){
        if(!Utils.isEmpty(this.recentActiveSegment) && this.recentActiveSegment == this.offersType){
            return;
        }else {
            this.recentActiveSegment = this.offersType;
            if(this.offersType == "public" && this.publicList.length == 0){
                this.offerList = [];
                this.loadOffers();
                return;
            }
            if(this.offersType == "public" && this.publicList.length > 0){
                this.offerList = Utils.cloneObject(this.publicList);
            }
            if(this.offersType == "private" && this.privateList.length == 0){
                this.offerList = [];
                this.loadOffers();
                return;
            }
            if(this.offersType == "private" && this.privateList.length > 0){
                this.offerList = Utils.cloneObject(this.privateList);
                return;
            }
            if(this.offersType == "hunted" && this.huntedList.length == 0){
                this.offerList = [];
                this.loadOffers();
                return;
            }
            if(this.offersType == "hunted" && this.huntedList.length > 0){
                this.offerList = Utils.cloneObject(this.huntedList);
                return;
            }
        }
    }

    loadOffers(){
        return new Promise(resolve => {
            if(this.offersType == 'public'){
                this.loadOffersByCriteria(this.publicList, this.userId, "public").then(() =>{
                    resolve();
                });
                return;
            }

            if(this.offersType == 'private'){
                this.loadOffersByCriteria(this.privateList, this.userId, "private").then(() =>{
                    resolve();
                });
                return;
            }

            //TODO: A voir avec Tamer
            if(this.offersType == 'hunted'){
                this.offerList = [];
                resolve();
            }
        });
    }

    doInfinite(infiniteScroll) {
        console.log('Begin async operation');
        setTimeout(() => {
            this.loadOffers().then(() => {
                console.log('Async operation has ended');
                infiniteScroll.complete();
            });
        }, 500);
    }

    handleOffers(offerList){
        for (let i = 0; i < offerList.length; i++) {
            // case of leaving page before finishing the subscription
            if (this.isLeaving) {
                console.log("leaving request subscription");
                return;
            }

            let offer = offerList[i];

            if (offer.visible) {
                offer.color = 'black';//'darkgreen';
                offer.correspondantsCount = -1;

                //verify if offer is obsolete
                offer.obsolete = this.offerService.isOfferObsolete(offer);

                //l'objet offer retourné par le callout ne contient meme pas la propriete idHunter, alors pourquoi on fait cette verification ?? (offer.idHunter sera tjrs undefined)
                if (offer.idHunter && !(offer.idHunter === 0)) {
                    //debugger;
                    //this.globalOfferList[2].list.push(offer);
                } else {
                    //debugger;
                    //this.globalOfferList[0].list.push(offer);
                }
            }else{
                offer.color = 'grey';
                offer.correspondantsCount = -1;
            }
        }
    }

    loadOffersByCriteria(list, userId, mode){
        return new Promise(resolve => {
            let loading;
            //loading should be displayed in the first call of the service. after that the infinit scroll loading icon is displyed
            if(list.length == 0) {
                loading = this.loading.create({content: "Merci de patienter..."});
                loading.present();
            }

            this.offerService.loadOffers(userId, (this.isEmployer ? "employer" : "jobyer"), mode, (mode == "private" ? this.privateOffset : this.publicOffset), this.queryLimit).then((data: any) => {
                if(list.length == 0 && loading) {
                    loading.dismiss();
                }
                //in case the user chooses another segment before the data loading is completed
                if(!Utils.isEmpty(this.recentActiveSegment) && this.recentActiveSegment != mode){
                    resolve();
                    return;
                }

                list = list.concat(data);
                this.handleOffers(list);
                this.offerList = Utils.cloneObject(list);
                if(mode == "private") {
                    this.privateOffset = this.privateOffset + this.queryLimit;
                    this.privateList = list;
                }else{
                    this.publicOffset = this.publicOffset + this.queryLimit;
                    this.publicList = list;
                }
                resolve();
            });
        });
    }

    /*onAddOffer() {
        this.listMode = (!this.listMode);
        if (this.mode)
            this.okButtonName = "add";
        else
            this.okButtonName = "checkmark-circle";
    }*/

    /**
     * @Description: Navigating to new offer page
     */
    goToNewOffer() {
        if (this.isNewUser) {
            this.presentToast("Veuillez remplir les informations de votre profil avant de créer une offre.", 7);
            return;
        } else {
            this.nav.push(OfferAddPage);
        }
    }

    /**
     * @Description: Navigating to detail offer page
     */
    goToDetailOffer(offer) {
        this.initializingView();
        this.nav.push(OfferDetailPage, {selectedOffer: offer});
    }

    getOfferBadge(item) {
        if (isUndefined(item) || !item || !item.pricticesJob || item.pricticesJob.length == 0) {
            item.correspondantsCount = 0;
            return;
        }

        this.offerService.getBadgeCount(item.pricticesJob[0].pricticeJobId, this.projectTarget).then(count => {
            console.log(count);
            item.correspondantsCount = count;
        });
    }

    autoSearchMode(offer) {
        let mode = offer.rechercheAutomatique ? "Non" : "Oui";
        this.offerService.saveAutoSearchMode(this.projectTarget, offer.idOffer, mode).then((data: {status: string}) => {
            if (data && data.status == "success") {
                offer.rechercheAutomatique = !offer.rechercheAutomatique;
                this.offerService.updateOfferInLocal(offer, this.projectTarget);
                //this.nav.pop();
            } else {
                this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
            }
        });
    }

    /*showOfferList(type) {
        if (type == 'Mes offres en ligne') {
            this.showPublishedOffers = !(this.showPublishedOffers);
            this.detailsIconName1 = (this.showPublishedOffers) ? 'remove' : 'add';
            if(this.showPublishedOffers){
                let loading = this.loading.create({content: "Merci de patienter..."});
                loading.present();
                this.offerService.loadOffers(this.userId, (this.isEmployer ? "employer" : "jobyer"), "public", 0, 10).then((data: any) => {
                    loading.dismiss();
                    //this.offerList = data;
                });
            }
        } else if (type == 'Mes brouillons') {
            this.showUnpublishedOffers = !(this.showUnpublishedOffers);
            this.detailsIconName2 = (this.showUnpublishedOffers) ? 'remove' : 'add';
        } else if (type == 'Mes opportunités capturées') {
            this.showHunterOffers = !(this.showHunterOffers);
            this.detailsIconName3 = (this.showHunterOffers) ? 'remove' : 'add';
        }
    }*/

    /**
     * @Description : Launch search from current offer-list
     */
    launchSearch(offer) {
        console.log(offer);
        if (!offer)
            return;

        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();

        this.offerService.getOffer(offer.idOffer, this.projectTarget).then((data: any) => {
            offer = data;
            let searchQuery = {
                class: 'com.vitonjob.recherche.model.SearchQuery',
                queryType: 'OFFER',
                idOffer: offer.idOffer,
                resultsType: this.projectTarget == 'jobyer' ? 'employer' : 'jobyer'
            };
            this.searchService.advancedSearch(searchQuery).then((data: any) => {
                this.searchService.persistLastSearch(data);
                loading.dismiss();
                this.nav.push(SearchResultsPage, {currentOffer: offer});
            });
        });


    }

    presentToast(message: string, duration: number) {
        let toast = this.toast.create({
            message: message,
            duration: duration * 1000
        });
        toast.present();
    }

    initializingView(){
        this.offerList = [];
        this.publicList.length = 0;
        this.privateList.length = 0;
        this.huntedList.length = 0;

        this.isLeaving = true;

        this.publicOffset = 0;
        this.privateOffset = 0;
        this.huntedOffset = 0;

        this.recentActiveSegment = "";
        this.offersType = "public";
    }

    ionViewWillLeave() {
        this.isLeaving = true;
    }
}
