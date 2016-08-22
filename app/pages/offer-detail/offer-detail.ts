import {NavController, NavParams, Loading, Modal, Alert, Popover} from 'ionic-angular';
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
import {OfferListPage} from "../offer-list/offer-list";
import {Component} from "@angular/core";
import {OfferQuotePage} from "../offer-quote/offer-quote";
import {PopoverOfferDetailPage} from "../popover-offer-detail/popover-offer-detail";
import {DomSanitizationService} from '@angular/platform-browser';
import {GlobalService} from "../../providers/global.service";
import {OfferTempQuotePage} from "../offer-temp-quote/offer-temp-quote";

/*
 Generated class for the OfferDetailPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/offer-detail/offer-detail.html',
    providers: [GlobalConfigs, OffersService, SearchService, GlobalService]
})
export class OfferDetailPage {
    offer:any;
    dateOptions:DatePickerOptions;
    offerService: OffersService;
    videoAvailable : boolean = false;
    youtubeLink : string = '';
	isLinkValid = true;

    constructor(public nav:NavController, gc:GlobalConfigs, params:NavParams, public offersService:OffersService, public searchService:SearchService, private sanitizer: DomSanitizationService, private globalService: GlobalService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.backgroundImage = config.backgroundImage;
        this.isEmployer = (this.projectTarget === 'employer');
		this.sanitizer = sanitizer;  
		this.offerService = offersService;
        
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

        let image = 'img/job.png';
        this.jobStyle = {
            backgroundImage: {'background-image': "url('img/job.png')"},
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.qualityStyle = {
            backgroundImage: {'background-image': "url('img/quality.png')"},
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.languageStyle = {
            backgroundImage: {'background-image': "url('img/language.png')"},
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.calendarStyle = {
            backgroundImage: {'background-image': "url('img/calendar.png')"},
            fontColor: "white",
            buttonColor: "white",//transparent
            fontWeight: "bolder"
        };

        this.dateOptions = {
            weekday: "long", month: "long", year: "numeric",
            day: "numeric"//, hour: "2-digit", minute: "2-digit"
        };

        //let table = !this.isEmployer?'user_offre_jobyer':'user_offre_entreprise';
        if(!this.offer.videolink){
			this.videoAvailable = false;
		}else{
			this.videoAvailable = true;
			this.youtubeLink = this.offer.videolink.replace("youtu.be", "www.youtube.com/embed").replace("watch?v=", "embed/");            
		}
		 /*this.offerService.getOfferVideo(this.offer.idOffer, table).then(data=>{
            this.videoAvailable = false;
            if(data && data != null && data.video && data.video != "null"){
                this.videoAvailable = true;
                this.youtubeLink = data.video;
            }

		 });*/
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
        let searchFields = {
            class : 'com.vitonjob.callouts.recherche.SearchQuery',
            job : this.offer.jobData.job,
            metier : '',
            lieu : '',
            nom : '',
            entreprise : '',
            date : '',
            table : this.projectTarget == 'jobyer'?'user_offre_entreprise':'user_offre_jobyer',
            idOffre :'0'
        };
        this.searchService.criteriaSearch(searchFields, this.projectTarget).then(data => {
            console.log(data);
            this.searchService.persistLastSearch(data);
            loading.dismiss();
            this.nav.push(SearchResultsPage, {currentOffer : this.offer});
        });
    }

    showQuote(){
        /*let modal = Modal.create(OfferQuotePage, {currentOffer: this.offer});
        this.nav.present(modal);*/
        this.nav.push(OfferTempQuotePage, {idOffer : this.offer.idOffer});
    }

    /**
     * Show job card
     */
    showJobCard() {
        this.showJob = !(this.showJob);
        if (this.showJob) {
            this.jobIconName = 'remove';
            this.jobStyle = {
                backgroundImage: {'background-image': ""},
                fontColor: this.themeColor,
                buttonColor: this.themeColor,
                fontWeight: "normal"
            };
        }

        else {
            this.jobIconName = 'add';
            this.jobStyle = {
                backgroundImage: {'background-image': "url('img/job.png')"},
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
                backgroundImage: {'background-image': ""},
                fontColor: this.themeColor,
                buttonColor: this.themeColor,
                fontWeight: "normal"
            };
        } else {
            this.qualityIconName = 'add';
            this.qualityStyle = {
                backgroundImage: {'background-image': "url('img/quality.png')"},
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
                backgroundImage: {'background-image': ""},
                fontColor: this.themeColor,
                buttonColor: this.themeColor,
                fontWeight: "normal"
            };
        } else {
            this.languageIconName = 'add';
            this.languageStyle = {
                backgroundImage: {'background-image': "url('img/language.png')"},
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
                backgroundImage: {'background-image': ""},
                fontColor: this.themeColor,
                buttonColor: this.themeColor,
                fontWeight: "normal"
            };
        }
        else {
            this.calendarIconName = 'add';
            this.calendarStyle = {
                backgroundImage: {'background-image': "url('img/calendar.png')"},
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
            if (this.modified.isJob){
                this.offer.jobData = data;
                this.offer.title = this.offer.jobData.job+' '+((this.offer.jobData.level != 'junior')?'Expérimenté':'Débutant');
                this.offerService.updateOfferJob(this.offer, this.projectTarget);
            }

        });
    }

    /**
     * Create Qualities modal
     */
    showQualityModal() {

        let modal = Modal.create(ModalQualityPage, {qualities: this.offer.qualityData});
        this.nav.present(modal);
        modal.onDismiss(data => {
            //this.modified.isQuality = (data.length) ? data.length > 0 : false;
            //if (this.modified.isQuality){
                this.offer.qualityData = data;
                this.offerService.updateOfferQualities(this.offer, this.projectTarget);
		//}

        })
    }

    /**
     * Create Language modal
     */
    showLanguageModal() {

        let modal = Modal.create(ModalLanguagePage, {languages: this.offer.languageData});
        this.nav.present(modal);
        modal.onDismiss(data => {
            //this.modified.isLanguage = (data.length) ? data.length > 0 : false;
            //if (this.modified.isLanguage){
                this.offer.languageData = data;
                this.offerService.updateOfferLanguages(this.offer, this.projectTarget);
			//}

        })
    }

    /**
     * Create Calendar modal
     */
    showCalendarModal() {

        let modal = Modal.create(ModalCalendarPage, {slots: this.offer.calendarData});
        this.nav.present(modal);
        modal.onDismiss(data => {
           // this.modified.isCalendar = (data.length) ? data.length > 0 : false;
            //if (this.modified.isCalendar){
                this.offer.calendarData = data;
                this.offerService.updateOfferCalendar(this.offer, this.projectTarget);
			//}

        })
    }

    /**
     * @description Delete offer
     * 
     */
    deleteOffer() {
        let confirm = Alert.create({
            title: "Supprimer l'offre",
            message: "Êtes-vous sûr de vouloir supprimer cette offre ?",
            buttons: [
                {
                    text: 'Non',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: 'Oui',
                    handler: () => {
                        console.log('Agree clicked');
                        this.offerService.deleteOffer(this.offer, this.projectTarget);
                        this.nav.setRoot(OfferListPage);
                    }
                }
            ]
        });
        this.nav.present(confirm);
    }

    /**
     * Copy current offer
     */
    copyOffer() {
        let confirm = Alert.create({
            title: "Copie d'offre",
            message: "Voulez-vous ajouter une nouvelle offre à partir de celle-ci?",
            buttons: [
                {
                    text: 'Non',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: 'Oui',
                    handler: () => {
                        console.log('Agree clicked');
                        let loading = Loading.create({
							content: ` 
								<div>
									<img src='img/loading.gif' />
								</div>
								`,
							spinner: 'hide',
							duration: 10000
						});
						this.nav.present(loading);
						let offer = this.offer;
                        offer.title = this.offer.title + " (Copie)";
						offer.idOffer = "";
                        this.offerService.setOfferInLocal(offer, this.projectTarget)
                            .then(()=> {
                                console.log('••• Adding offer : local storing success!');
                               //debugger;
                                this.offerService.setOfferInRemote(offer, this.projectTarget)
                                    .then(data => {
                                        console.log('••• Adding offer : remote storing success!');
                                       //debugger;
										loading.dismiss();
                                        this.nav.setRoot(OfferListPage);
                                    })
                            });
                    }
                }
            ]
        });
        this.nav.present(confirm);
    }
	
	changePrivacy(){
		var statut = this.offer.visible ? 'Non' : 'Oui';
		this.offerService.updateOfferStatut(this.offer.idOffer, statut, this.projectTarget).then(()=> {
			console.log('offer status changed successfuly');
			this.offer.visible = (statut == 'Non' ? false : true);
			this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
		});
	}

    /**
     * @author TEL
     * Popover menu for offer detail options
     * @param ev
     */
    showPopover(ev) {
        let popover = Popover.create(PopoverOfferDetailPage, {visibility:this.offer.visible, autoSearch:this.offer.rechercheAutomatique});
        this.nav.present(popover, {
            ev: ev
        });

        popover.onDismiss( data => {
            if(!data)
				return;
			switch (data.option) {
                case 1:
                    // Launch copy function
                    this.copyOffer();
                    break;
                case 2:
                    // Launch visibility option
                    this.changePrivacy();
                    break;
                case 3:
                    // launch search option
                    this.launchSearch();
                    break;
				case 4:
                    // launch search option
                    this.autoSearchMode();
                    break;
                case 5:
                    // launch devise option
                    this.showQuote();
                    break;
                case 6:
                    // launch delete option
                    this.deleteOffer();
                    break;
            }
        })

    }

    updateVideo(deleteLink){
		this.isLinkValid = true;
		if(deleteLink){
			this.youtubeLink = "";
		}else{
			if(this.youtubeLink == "" || (this.youtubeLink.indexOf("youtu.be") == -1 && this.youtubeLink.indexOf("www.youtube.com") == -1)){
				this.youtubeLink = "";
				this.isLinkValid = false;
				return;	
			}
			this.youtubeLink = this.youtubeLink.replace("youtu.be", "www.youtube.com/embed").replace("watch?v=", "embed/");   
		}
        this.offerService.updateVideoLink(this.offer.idOffer, this.youtubeLink, this.projectTarget).then(()=>{
           if(deleteLink){
				this.videoAvailable = false;
			}else{
				this.videoAvailable = true;
			}
			console.log('offer youtube link updated successfuly');
			this.offer.videolink = this.youtubeLink;
			this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
        });
    }
	
	videoUrl(){
		return this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeLink);
	}
	
	autoSearchMode(){
		var mode = this.offer.rechercheAutomatique ? "Non" : "Oui";
		this.offerService.saveAutoSearchMode(this.projectTarget, this.offer.idOffer, mode).then(data => {
			if(data && data.status == "success"){
				this.offer.rechercheAutomatique = !this.offer.rechercheAutomatique;
				this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
				this.nav.pop();
			}else{
				this.globalService.showAlertValidation("VitOnJob", "Une erreur est survenue lors de la sauvegarde des données.");
			}
		});
	}
}