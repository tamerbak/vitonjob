import {Page, NavController, Toast, Modal, LocalStorage, Storage} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalJobPage} from "../modal-job/modal-job";
import {ModalQualityPage} from "../modal-quality/modal-quality";
import {ModalLanguagePage} from "../modal-language/modal-language";
import {ModalCalendarPage} from "../modal-calendar/modal-calendar";
import {OffersService} from "../../providers/offers-service/offers-service";
import {OfferListPage} from "../offer-list/offer-list";
import {isUndefined} from "ionic-angular/util";

/*
 Generated class for the OfferAddPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/offer-add/offer-add.html',
    providers: [GlobalConfigs, OffersService]
})
export class OfferAddPage {

    themeColor:string;
    inversedThemeColor:string;
    isEmployer:boolean;
    steps:{
        isJob:boolean,
        isQuality:boolean,
        isLanguage:boolean,
        isCalendar:boolean
    };
    validated:{
        isJob:boolean,
        isQuality:boolean,
        isLanguage:boolean,
        isCalendar:boolean
    };
    nav: NavController;
    localOffer:Storage;
    offerService:OffersService;
    visibleOffer:boolean;
    offerToBeAdded:{jobData:any, calendarData:any, qualityData:any, languageData:any,
        visible:boolean, title:string, status:string};

    constructor(public nav:NavController, private gc:GlobalConfigs, private os:OffersService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        //Initializing PAGE:
        this.initializePage(config);
        this.offerService = os;
this.nav = nav;

    }


    /**
     * @Author : TEL
     * #Description : Initializing Offer adding buttons
     */
    initializePage(config) {
        // Set local variables
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.isEmployer = (this.projectTarget === 'employer');

        this.localOffer = new Storage(LocalStorage);

        this.steps = {
            isJob: true,
            isQuality: false,
            isLanguage: false,
            isCalendar: false
        };
        this.validated = {
            isJob: false,
            isQuality: false,
            isLanguage: false,
            isCalendar: false
        };

        this.visibleOffer = true;

        this.offerToBeAdded = {
            jobData: "", calendarData: "", qualityData: "", languageData: "",
            visible: this.visibleOffer, title: "", status: "open"
        };

        this.initLocalStorageOffer();


    }

    /**
     * @description Initializing local storage dara
     */
    initLocalStorageOffer(){
        // --> Job state
        this.localOffer.get('jobData').then(value => {
            value = JSON.parse(value);
            if (value) {
                let level = (this.offerToBeAdded.jobData.level === 'senior') ? 'Expérimenté' : 'Débutant'
                this.offerToBeAdded.jobData = value;
                this.offerToBeAdded.title = this.offerToBeAdded.jobData.job + " " + level;
                this.validated.isJob = value.validated;
                this.steps.isCalendar = this.validated.isJob;
            }
            // --> Calendar state
            this.localOffer.get('slots').then(value => {
                value = JSON.parse(value);
                if (value) {
                    this.offerToBeAdded.calendarData = value;
                    this.validated.isCalendar = value.length > 0;
                    this.steps.isQuality = this.validated.isCalendar;
                }

                // --> Quality state
                this.localOffer.get('qualities').then(value => {
                    value = JSON.parse(value);
                    if (value) {
                        this.offerToBeAdded.qualityData = value;
                        this.validated.isQuality = value.length > 0;
                        this.steps.isLanguage = this.validated.isQuality;
                    }
                    // --> Language state
                    this.localOffer.get('languages').then(value => {
                        value = JSON.parse(value);
                        if (value) {
                            this.offerToBeAdded.languageData = value;
                            this.validated.isLanguage = value.length > 0;
                        }
                    });
                });
            });
        });
    }

    /** ########### Toast #############*/

    /**
     * @description Present the global toast that validate offer-list insertion
     * @param message
     * @param duration
     */
    presentToast(message:string, duration:number) {
        let toast = Toast.create({
            message: message,//"Agenda bien insérée, Votre offre est valide",
            duration: duration * 1000
        });

        toast.onDismiss(() => {
            console.log('Dismissed toast');
            //this.isOfferValidated = (!this.isOfferValidated);
        });

        this.nav.present(toast);
    }

    /**########## Modals #############*/

    /**
     * Create Job modal
     */
    showJobModal() {
        this.localOffer.get('jobData').then(value => {
            console.log(value);
            let modal = Modal.create(ModalJobPage, {jobData: JSON.parse(value)});
            this.nav.present(modal);
            modal.onDismiss(data => {
                this.validated.isJob = data.validated;
                this.steps.isCalendar = this.validated.isJob;
                this.localOffer.set('jobData', JSON.stringify(data));
            })
        });

    }

    /**
     * Create Qualities modal
     */
    showQualityModal() {

        this.localOffer.get('qualities').then(value => {
            let modal = Modal.create(ModalQualityPage, {qualities: JSON.parse(value)});
            this.nav.present(modal);
            modal.onDismiss(data => {
                this.validated.isQuality = (data.length) ? data.length > 0 : false;
                //this.steps.isLanguage = this.validated.isQuality;
                this.localOffer.set('qualities', JSON.stringify(data));
            })
        });
    }

    /**
     * Create Language modal
     */
    showLanguageModal() {
        this.localOffer.get('languages').then(value => {
            let modal = Modal.create(ModalLanguagePage, {languages: JSON.parse(value)});
            this.nav.present(modal);
            modal.onDismiss(data => {
                this.validated.isLanguage = (data.length) ? data.length > 0 : false;
                //this.steps.isCalendar = this.validated.isLanguage;
                this.localOffer.set('languages', JSON.stringify(data));
                if (this.validated.isLanguage && this.validated.isQuality)
                    this.presentToast("Génial! Vous avez préparez une offre complète, " +
                        "vous pouvez maintenant la valider.", 4);
            })
        });
    }

    /**
     * Create Calendar modal
     */
    showCalendarModal() {
        this.localOffer.get('slots').then(value => {
            let modal = Modal.create(ModalCalendarPage, {slots: JSON.parse(value)});
            this.nav.present(modal);
            modal.onDismiss(data => {
                this.validated.isCalendar = (data.length) ? data.length > 0 : false;
                this.localOffer.set('slots', JSON.stringify(data));
                if (this.validated.isCalendar && this.validated.isQuality)
                    this.presentToast("Vous pouvez ajouter votre nouvelle offre dès maintenant! " +
                        "Pour plus de précision pensez à saisir les qualités et langues...", 3);
            })
        });
    }

    /**
     * Description : Adding offer in local and remote databases
     */
    addOffer() {
        this.initLocalStorageOffer();
        this.offerService.setOfferInLocal(this.offerToBeAdded, this.projectTarget)
            .then(()=> {
                console.log('••• Adding offer : local storing success!');
                debugger;
                this.offerService.setOfferInRemote(this.offerToBeAdded, this.projectTarget)
                    .then(data => {
                        console.log('••• Adding offer : remote storing success!');
                        debugger;
                        this.localOffer.clear();
                        this.nav.setRoot(OfferListPage);
                    })

            });

    }

}
