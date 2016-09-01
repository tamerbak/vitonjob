import {NavController, ViewController} from 'ionic-angular';
import {OffersService} from "../../providers/offers-service/offers-service";
import {SearchService} from "../../providers/search-service/search-service";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {OfferAddPage} from "../offer-add/offer-add";
import {Component} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {OfferDetailPage} from "../offer-detail/offer-detail";

/**
	* @author Abdeslam Jakjoud
	* @description modal popup showing offers list
	* @module Contract signature
*/
@Component({
	templateUrl: 'build/pages/modal-offers/modal-offers.html',
	providers: [SearchService, GlobalConfigs, OffersService]
})
export class ModalOffersPage {
	projectTarget : any;
	offerList : any = [];
	offerService : any;
	voidOffers : boolean = false;
	isEmployer:boolean;
	
	constructor(private viewCtrl: ViewController,
	public nav:NavController,
	public gc:GlobalConfigs,
	public search:SearchService,
	public offerService : OffersService) {
		
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		let config = Configs.setConfigs(this.projectTarget);
		this.isEmployer = (this.projectTarget === 'employer');
		
		// Load offers
		this.offerService = offerService;
		this.offerService.loadOfferList(this.projectTarget).then(data => {
			var offers = data;
			//verify if offer is obsolete
			for(var i = 0; i < offers.length; i++){
				var offer = offers[i];
				for(var j = 0; j < offer.calendarData.length; j++){
					var slotDate = offer.calendarData[j].date;
					var startH = this.offerService.convertToFormattedHour(offer.calendarData[j].startHour);
					slotDate = new Date(slotDate).setHours(startH.split(':')[0], startH.split(':')[1]);						
					var dateNow = new Date().getTime();
					if(slotDate <= dateNow){
						offer.obsolete = true;
						break;
					}else{
						offer.obsolete = false;
						this.offerList.push(offer);
					}
				} 
			}
			this.voidOffers = this.offerList.length == 0;
		});
	}
	
	/**
		* @description Sets the default current offer
		* @param offer
	*/
	chooseOffer(offer){
		this.viewCtrl.dismiss(offer);
	}
	
	/**
		* @description There are no available offers redirect user to add a new offer
	*/
	goToNewOffer() {
		this.nav.push(OfferAddPage);
	}
	
	goToOfferDetails(offer) {
		this.nav.push(OfferDetailPage, {selectedOffer: offer, fromPage: "ModalOffers"});
	}
	
	/**
		* @description : Closing the modal page :
	*/
	closeModal() {
		this.viewCtrl.dismiss();
	}
}
