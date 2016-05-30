import {Page, NavController, NavParams, Loading, Modal} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {SearchResultsPage} from "../../pages/search-results/search-results";
import {OffersService} from "../../providers/offers-service/offers-service";
import {SearchService} from "../../providers/search-service/search-service";
import {DatePickerOptions} from "ionic-native/dist/plugins/datepicker";
import {ModalJobPage} from "../modal-job/modal-job";
import {ModalQualityPage} from "../modal-quality/modal-quality";
import {ModalLanguagePage} from "../modal-language/modal-language";
import {ModalCalendarPage} from "../modal-calendar/modal-calendar";

/*
 Generated class for the OfferDetailPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/offer-detail/offer-detail.html',
    providers: [GlobalConfigs, OffersService, SearchService]
})
export class OfferDetailPage {
    offer:any;
    dateOptions:DatePickerOptions;

    constructor(public nav:NavController, gc:GlobalConfigs, params:NavParams,
                public offersService:OffersService, public searchService:SearchService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.isEmployer = (this.projectTarget === 'employer');

        // Get Offer passed in NavParams
        this.offer = params.get('selectedOffer');
        this.showJob = false;
        this.jobIconName = 'add';
        this.showQuality = false;
        this.qualityIconName = 'add';
        this.showLanguage = false;
        this.languageIconName = 'add';
        this.showCalendar = false;
        this.calendarIconName = 'add';

        this.modified = {
            isJob : false,
            isQuality: false,
            isLanguage: false,
            isCalendar: false
        };

        this.jobStyle = {
            backgroundImage: "url('img/job.png')",
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.qualityStyle = {
            backgroundImage: "url('img/quality.png')",
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.languageStyle = {
            backgroundImage: "url('img/language.png')",
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.calendarStyle = {
            backgroundImage: "url('img/calendar.png')",
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.dateOptions = {
            weekday: "long", month: "long", year: "numeric",
            day: "numeric"//, hour: "2-digit", minute: "2-digit"
        };

    }

    /**
     * @Description Converts a timeStamp to date string : 
     * @param date : a timestamp date
     */
    toDateString(date:number) {
        return new Date(date).toLocaleDateString('fr-FR', this.dateOptions);
    }

    /**
     * @Description Converts a timeStamp to date string
     * @param time : a timestamp date
     */
    toHourString(time:number) {
        let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
        let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
        return hours + ":" + minutes;
    }

    /**
     * @Description : Launch search from current offer-list
     */
    launchSearch() {
        console.log(this.offer);
        if (!this.offer)
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
        this.offersService.getCorrespondingOffers(this.offer, this.projectTarget).then(data => {
            console.log(data);
            this.searchService.persistLastSearch(data);
            loading.dismiss();
            this.nav.push(SearchResultsPage);
        });
    }


    /**
     * Show job card
     */
    showJobCard() {
        this.showJob = !(this.showJob);
        if (this.showJob) {
            this.jobIconName = 'remove';
            this.jobStyle = {
                backgroundImage: "",
                fontColor: "",
                buttonColor: "",
                fontWeight: ""
            };
        }

        else {
            this.jobIconName = 'add';
            this.jobStyle = {
                backgroundImage: "url('img/job.png')",
                fontColor: "white",
                buttonColor: "white",//transparent
                fontWeight: "bolder"
            };
        }

    }

    /**
     * Show quality card
     */
    showQualityCard() {
        this.showQuality = !(this.showQuality);
        if (this.showQuality) {
            this.qualityIconName = 'remove';
            this.qualityStyle = {
                backgroundImage: "",
                fontColor: "",
                buttonColor: "",
                fontWeight: ""
            };
        } else {
            this.qualityIconName = 'add';
            this.qualityStyle = {
                backgroundImage: "url('img/quality.png')",
                fontColor: "white",
                buttonColor: "white",//transparent
                fontWeight: "bolder"
            };
        }
    }

    /**
     * Show language card
     */
    showLanguageCard() {
        this.showLanguage = !(this.showLanguage);
        if (this.showLanguage) {
            this.languageIconName = 'remove';
            this.languageStyle = {
                backgroundImage: "",
                fontColor: "",
                buttonColor: "",//transparent
                fontWeight: ""
            };
        } else {
            this.languageIconName = 'add';
            this.languageStyle = {
                backgroundImage: "url('img/language.png')",
                fontColor: "white",
                buttonColor: "white",
                fontWeight: "bolder"
            };
        }
    }

    /**
     * Show calendar card
     */
    showCalendarCard() {
        this.showCalendar = !(this.showCalendar);
        if (this.showCalendar) {
            this.calendarIconName = 'remove';
            this.calendarStyle = {
                backgroundImage: "",
                fontColor: "",
                buttonColor: "",
                fontWeight: ""
            };
        }
        else {
            this.calendarIconName = 'add';
            this.calendarStyle = {
                backgroundImage: "url('img/calendar.png')",
                fontColor: "white",
                buttonColor: "white",
                fontWeight: "bolder"
            };
        }
    }

    /**
     * Create Job modal
     */
    showJobModal() {

        //console.log(value);
        let modal = Modal.create(ModalJobPage, {jobData: this.offer.jobData});
        this.nav.present(modal);
        modal.onDismiss(data => {
            this.modified.isJob = data.validated;
            //this.steps.isCalendar = this.validated.isJob;
            //this.localOffer.set('jobData', JSON.stringify(data));
            if (this.modified.isJob)
                this.offer.jobData = data;
        })
    }

    /**
     * Create Qualities modal
     */
    showQualityModal() {

        let modal = Modal.create(ModalQualityPage, {qualities: this.offer.qualityData});
        this.nav.present(modal);
        modal.onDismiss(data => {
            this.modified.isQuality = (data.length) ? data.length > 0 : false;
            if (this.modified.isQuality)
                this.offer.qualityData = data;
        })
    }

    /**
     * Create Language modal
     */
    showLanguageModal() {

        let modal = Modal.create(ModalLanguagePage, {languages: this.offer.languageData});
        this.nav.present(modal);
        modal.onDismiss(data => {
            this.modified.isLanguage = (data.length) ? data.length > 0 : false;
            if (this.modified.isLanguage)
                this.offer.languageData = data;
        })
    }

    /**
     * Create Calendar modal
     */
    showCalendarModal() {

        let modal = Modal.create(ModalCalendarPage, {slots: this.offer.calendarData});
        this.nav.present(modal);
        modal.onDismiss(data => {
            this.modified.isCalendar = (data.length) ? data.length > 0 : false;
            if (this.modified.isCalendar)
                this.offer.calendarData = data;
        })
    }

    /**
     * @description Validate all modififcations
     * 
     */
    validateModification() {
        
    }
}
