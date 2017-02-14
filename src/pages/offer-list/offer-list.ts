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

    public offerList: any = [];
    public publicList: any = [];
    public privateList: any = [];
    public huntedList: any = [];
    public projectTarget: string;
    public backgroundImage: any;
    public isNewUser = false;
    public globalOfferList = [];
    public showPublishedOffers = false;
    public showUnpublishedOffers = false;
    public showHunterOffers = false;
    public detailsIconName1: string = "add";
    public detailsIconName2: string = "add";
    public detailsIconName3: string = "add";
    public isHunter: boolean = false;
    public isEmployer: boolean;
    public themeColor: string;
    public listMode: boolean;
    public okButtonName: string;
    public mode: any;
    public backGroundColor: string;
    public isLeaving: boolean = false;
    public userId: string;
    public config: any;
    public offersType: string = "public";
    public currentUser: any;

    //determine the number of elements that should be skipped by the query
    public publicOffset: number = 0;
    public privateOffset: number = 0;
    public huntedOffset: number = 0;
    //determine the number of elemens to be retrieved by the query
    public queryLimit: number = 5;
    public recentActiveSegment: String;

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
        this.listMode = true;
        this.okButtonName = "add";
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
            }
            if(this.offersType == "public" && this.publicList.length > 0){
                this.offerList = (JSON.parse(JSON.stringify(this.publicList)));
            }
            if(this.offersType == "private" && this.privateList.length == 0){
                this.offerList = [];
                this.loadOffers();
            }
            if(this.offersType == "private" && this.privateList.length > 0){
                this.offerList = (JSON.parse(JSON.stringify(this.privateList)));
            }
            if(this.offersType == "hunted" && this.huntedList.length == 0){
                this.offerList = [];
                this.loadOffers();
            }
            if(this.offersType == "hunted" && this.huntedList.length > 0){
                this.offerList = (JSON.parse(JSON.stringify(this.huntedList)));
            }
        }
    }
    loadOffers(){
        let loading;
        return new Promise(resolve => {
            if(this.offersType == 'public'){
                if(this.publicList.length == 0) {
                    loading = this.loading.create({content: "Merci de patienter..."});
                    loading.present();
                }
                this.offerService.loadOffers(this.userId, (this.isEmployer ? "employer" : "jobyer"), "public", this.publicOffset, this.queryLimit).then((data: any) => {
                    if(this.publicList.length == 0) {
                        loading.dismiss();
                    }
                    this.publicList = this.publicList.concat(data);
                    this.handleOffers(this.publicList);
                    this.offerList = (JSON.parse(JSON.stringify(this.publicList)));
                    //this.offerList = this.publicList;
                    this.publicOffset = this.publicOffset + this.queryLimit;
                    resolve();
                });
            }
            if(this.offersType == 'private'){
                if(this.privateList.length == 0) {
                    loading = this.loading.create({content: "Merci de patienter..."});
                    loading.present();
                }
                this.offerService.loadOffers(this.userId, (this.isEmployer ? "employer" : "jobyer"), "private", this.privateOffset, this.queryLimit).then((data: any) => {
                    if(this.privateList.length == 0) {
                        loading.dismiss();
                    }
                    this.privateList = this.privateList.concat(data);
                    this.handleOffers(this.privateList);
                    this.offerList = (JSON.parse(JSON.stringify(this.privateList)));
                    this.privateOffset = this.privateOffset + this.queryLimit;
                    resolve();
                });
            }
            if(this.offersType == 'hunted'){
                this.offerList = [];
                this.handleOffers(this.offerList);
                resolve();
            }
        })
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
            //TODO: Demander à Tamer à quoi sert le isLeaving
            if (this.isLeaving) {
                console.log("leaving request subscription");
                return;
            }

            let offer = offerList[i];

            if (offer.visible) {
                offer.color = 'black';//'darkgreen';
                offer.correspondantsCount = -1;

                //verify if offer is obsolete
                for (let j = 0; j < offer.calendarData.length; j++) {
                    // case of leaving page before finishing the subscription
                    if (this.isLeaving) {
                        console.log("leaving request subscription");
                        return;
                    }

                    let slotDate = offer.calendarData[j].date;
                    let startH = this.offerService.convertToFormattedHour(offer.calendarData[j].startHour);
                    slotDate = new Date(slotDate).setHours(Number(startH.split(':')[0]), Number(startH.split(':')[1]));
                    let dateNow = new Date().getTime();
                    if (slotDate <= dateNow) {
                        offer.obsolete = true;
                        break;
                    } else {
                        offer.obsolete = false;
                    }
                }

                if (offer.idHunter && !(offer.idHunter === 0)) {
                    //debugger;
                    //this.globalOfferList[2].list.push(offer);
                } else {
                    //debugger;
                    //this.globalOfferList[0].list.push(offer);
                }
            }
            if (!offer.visible) {
                offer.color = 'grey';
                offer.correspondantsCount = -1;
            }
        }
    }

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

    presentToast(message: string, duration: number) {
        let toast = this.toast.create({
            message: message,
            duration: duration * 1000
        });
        toast.present();
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

    showOfferList(type) {

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


    }

    /**
     * @Description : Launch search from current offer-list
     */
    launchSearch(offer) {
        console.log(offer);
        if (!offer)
            return;
        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();

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

    }



    ionViewWillLeave() {
        this.isLeaving = true;
    }
}
