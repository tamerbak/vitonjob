import {Page, NavController, ActionSheet} from 'ionic-angular';
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
  searchResults : any;

  /**
   * @description While constructing the view we get the last results of the search from the user
   * @param nav Navigation controller of the application
   * @param searchService the provider that allows us to get data from search service
     */
  constructor(public nav: NavController,
              private searchService: SearchService) {
    searchService.retrieveLastSearch().then(results =>{
      var jsonResults = JSON.parse(results);
      if(jsonResults){
        this.searchResults = jsonResults;
        console.log(this.searchResults);
      }
    });

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

  /**
   * @description This function allows to select the candidate for a group recruitment
   * @param item the selected Employer/Jobyer
     */
  addGroupContract(item){
    console.log(item);
  }
}
