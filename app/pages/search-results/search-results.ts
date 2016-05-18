import {Page, NavController, ActionSheet, Platform, Slides} from 'ionic-angular';
import {ViewChild} from 'angular2/core'
import {SearchService} from "../../providers/search-service/search-service";


/**
 * @author jakjoud abdeslam
 * @description search results view
 * @module Search
 */
@Page({
  templateUrl: 'build/pages/search-results/search-results.html',
})
export class SearchResultsPage {
  @ViewChild('cardSlider') slider: Slides;

  searchResults : any;
  listView : boolean = true;
  cardView : boolean = false;
  mapView : boolean = false;
  platform : Platform;
  map : any;
  cardsOptions= {
    loop: false
  };
  currentCardIndex : number = 0;

  /**
   * @description While constructing the view we get the last results of the search from the user
   * @param nav Navigation controller of the application
   * @param searchService the provider that allows us to get data from search service
     */
  constructor(public nav: NavController,
              private searchService: SearchService,
              platform : Platform) {
    this.platform = platform;
    searchService.retrieveLastSearch().then(results =>{
      var jsonResults = JSON.parse(results);
      if(jsonResults){
        this.searchResults = jsonResults;
        for(var i = 0 ; i < this.searchResults.length ; i++){
          let r = this.searchResults[i];
          r.matching = Number(r.matching).toFixed(2);
        }
        console.log(this.searchResults);
      }
    });
  }

  /**
   * @description Detecting the motion of cards to the right or to the left in order to decide if we add or reject the candidate
   */
  onSlideChanged(){
    let currentIndex = this.slider.getActiveIndex();
    if(currentIndex > this.currentCardIndex){
      console.log("went right");
    } else {
      console.log("went left");
    }
    this.currentCardIndex = currentIndex;
  }

  /**
   * @description Selecting an item allows to call an action sheet for communications and contract
   * @param item the selected Employer/Jobyer
   */
  itemSelected(item){
    let actionSheet = ActionSheet.create({
      title: 'Options',
      buttons: [
        {
          text: 'Envoyer SMS',
          icon: 'md-mail',
          handler: () => {

          }
        },{
          text: 'Appeller',
          icon: 'md-call',
          handler: () => {

          }
        },{
          text: 'Contrat',
          icon: 'md-document',
          handler: () => {

          }
        },{
          text: 'Annuler',
          role: 'cancel',
          icon: 'md-close',
          handler: () => {

          }
        }
      ]
    });
    this.nav.present(actionSheet);
    ;
  }

  contract(item){
    console.log('Contract');
  }

  /**
   * @description This function allows to select the candidate for a group recruitment
   * @param item the selected Employer/Jobyer
     */
  addGroupContract(item){
    console.log(item);
  }

  /**
   * @description changing layout of results
   * @param mode
   */
  changeViewMode(mode){
    if(mode == 1){          //  List view
      this.listView = true;
      this.cardView = false;
      this.mapView = false;
    } else if (mode == 2){  //  Cards view
      this.listView = false;
      this.cardView = true;
      this.mapView = false;
    } else {                //  Map view
      this.listView = false;
      this.cardView = false;
      this.mapView = true;
    }
  }
}
