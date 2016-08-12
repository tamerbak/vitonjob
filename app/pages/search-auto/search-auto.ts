import {Component} from '@angular/core';
import {NavController, NavParams, Loading} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Storage, SqlStorage} from 'ionic-angular';
import {OffersService} from "../../providers/offers-service/offers-service";
import {SearchService} from "../../providers/search-service/search-service";
import {SearchResultsPage} from "../../pages/search-results/search-results";
import {SearchDetailsPage} from "../search-details/search-details";

@Component({
	templateUrl: 'build/pages/search-auto/search-auto.html',
	providers: [OffersService, SearchService]
})

export class SearchAutoPage {
	projectTarget: string;
	isEmployer: boolean;
	themeColor:string;
	currentUser: any;
	publicOffers = [];
	autoSearchOffers = [];
	searchResults: any;
	contratsAttente : any = [];
	backgroundImage:string;
	imageURL:string;
	
	constructor(public nav: NavController,
				params:NavParams,
				public gc: GlobalConfigs,
				public offerService : OffersService,
				public searchService:SearchService) {
		this.projectTarget = gc.getProjectTarget();
		this.storage = new Storage(SqlStorage);
		let config = Configs.setConfigs(this.projectTarget);
		this.backgroundImage = config.backgroundImage;
		this.imageURL = config.imageURL;
        
		// Set local variables and messages
		this.themeColor = config.themeColor;
		this.isEmployer = (this.projectTarget == 'employer');
		this.currentUserVar = config.currentUserVar;
		this.params = params;
        this.getOffers();
	}
	
	getOffers(){
		this.storage.get(this.currentUserVar).then((value) => {
            var isConnected = false;
			if(!value || value == "null"){
				this.currentUser = this.params.data.currentUser;	
				if(!this.currentUser || this.currentUser == "null"){
					isConnected = false;
					return;
				}else{
					isConnected = true;
				}
			}else{
                this.currentUser = JSON.parse(value);
				isConnected = true;
			}
			if(isConnected){
				var offers = this.isEmployer ? this.currentUser.employer.entreprises[0].offers : this.currentUser.jobyer.offers;
				for(var i = 0; i < offers.length; i++){
					var offer = offers[i];
					if(offer.visible && offer.rechercheAutomatique){
						offer.arrowLabel = "arrow-dropright";
						offer.isResultHidden = true;
						this.autoSearchOffers.push(offer);
						continue;
					}
					if(offer.visible && !offer.rechercheAutomatique){
						offer.correspondantsCount = -1;
						this.publicOffers.push(offer);
					}
				}
				for(var i = 0; i < this.publicOffers.length; i++){
					let offer = this.publicOffers[i];
					this.offerService.getCorrespondingOffers(offer, this.projectTarget).then(data => {
						offer.correspondantsCount = data.length;
					});
				}
			}
		});
	}
	
	/**
     * @Description : Launch search from current offer-list
     */
    launchSearch(offer, noRedirect) {
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
            class : 'com.vitonjob.callouts.recherche.SearchQuery',
            job : offer.jobData.job,
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
            if(!noRedirect){
				this.nav.push(SearchResultsPage, {currentOffer : offer});
			}else{
				this.showResult(offer);
			}
        });
    }
	
	showResult(offer){
		//get search results for this offer
		let configInversed = this.projectTarget != 'jobyer' ? Configs.setConfigs('jobyer'): Configs.setConfigs('employer');
		this.searchService.retrieveLastSearch().then(results =>{  
			let jsonResults = JSON.parse(results);
			if(jsonResults){
				this.searchResults = jsonResults;
				for(let i = 0 ; i < this.searchResults.length ; i++){
					let r = this.searchResults[i];
					r.matching = Number(r.matching).toFixed(2);
					r.index = i + 1;
					if (r.titre === 'M.') {
						r.avatar = configInversed.avatars[0].url;
					} else {
						r.avatar = configInversed.avatars[1].url;
					}
				}
				console.log(this.searchResults);
			}
		});
	}
	
	 itemSelected(item){
        this.nav.push(SearchDetailsPage, {searchResult : item});
	 }
}