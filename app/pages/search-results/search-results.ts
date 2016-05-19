import {Page, NavController, ActionSheet, Platform, Slides,Alert} from 'ionic-angular';
import {Storage, SqlStorage} from 'ionic-angular';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ViewChild} from 'angular2/core'
import {SearchService} from "../../providers/search-service/search-service";
import {UserService} from "../../providers/user-service/user-service";
import {ContractPage} from '../contract/contract';
import {CivilityPage} from '../civility/civility';
import {JobAddressPage} from '../job-address/job-address';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {LoginsPage} from '../logins/logins';


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
  projectTarget : any;
  avatar : string;
  isUserAuthenticated : boolean;
  employer:any;

  /**
   * @description While constructing the view we get the last results of the search from the user
   * @param nav Navigation controller of the application
   * @param searchService the provider that allows us to get data from search service
     */
  constructor(public globalConfig: GlobalConfigs,
              public nav: NavController,
              private searchService: SearchService,
              private userService:UserService,
              platform : Platform) {
    // Get target to determine configs
    this.projectTarget = globalConfig.getProjectTarget();
    this.avatar = this.projectTarget == 'jobyer' ? 'jobyer_avatar':'eemployer_avatar';

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
    
    //get the connexion object and define if the there is a user connected
    userService.getConnexionObject().then(results =>{
        var connexion = JSON.parse(results);
        if(connexion && connexion.etat){
                this.isUserAuthenticated = true;
        }else{
            this.isUserAuthenticated = false;
        }
        console.log(connexion);
    });
    
    //get the currentEmployer
    userService.getCurrentEmployer().then(results =>{
        var currentEmployer = JSON.parse(results);
        if(currentEmployer){
            this.employer = currentEmployer;
        }
        console.log(currentEmployer);
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
              this.recruitJobyer(item);
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
  
  
  /**
   * @description verify informations of Employer/Jobyer and redirect to recruitement contract
   * @param item the selected Employer/Jobyer
     */
   recruitJobyer(jobyer){
      
        //init local database
        let storage = new Storage(SqlStorage);
      
        console.log(jobyer);

        if(this.isUserAuthenticated){
          
            var currentEmployer = this.employer;
            
            //verification of employer informations
            var redirectToStep1 = (currentEmployer && currentEmployer.entreprises[0]) ?
                                    (currentEmployer.titre == "") ||
                                    (currentEmployer.prenom == "") ||
                                    (currentEmployer.nom == "") ||
                                    (currentEmployer.entreprises[0].name == "") ||
                                    (currentEmployer.entreprises[0].siret == "") ||
                                    (currentEmployer.entreprises[0].naf == "") : true;
                                
            var redirectToStep2 = (currentEmployer && currentEmployer.entreprises[0]) ?
                                    (typeof (currentEmployer.entreprises[0].adresses) == "undefined") ||
                                    (typeof (currentEmployer.entreprises[0].adresses[0]) == "undefined") : true;
                                    
            var redirectToStep3 = (currentEmployer && currentEmployer.entreprises[0]) ?
                                    (typeof (currentEmployer.entreprises[0].adresses) == "undefined") ||
                                    (typeof (currentEmployer.entreprises[0].adresses[1]) == "undefined") : true;
                                    
            var isDataValid = ((!redirectToStep1) && (!redirectToStep2) && (!redirectToStep3));
                
            var steps = {
                "state": false,
                "step1": redirectToStep1,
                "step2": redirectToStep2,
                "step3": redirectToStep3
            };
            
            if (isDataValid) {
                steps.state = false;
                storage.set('STEPS', steps);
                
                //navigate to contract page
                this.nav.push(ContractPage, {jobyer: jobyer});
            }
            else 
            {
                //redirect employer to fill the missing informations
                steps.state = true;
                storage.set('STEPS', steps);

                if (redirectToStep1){
                    this.nav.push(CivilityPage, {jobyer: jobyer});
                }
                else if (redirectToStep2){
                    this.nav.push(PersonalAddressPage, {jobyer: jobyer});
                } 
                else if (redirectToStep3){
                    this.nav.push(JobAddressPage, {jobyer: jobyer});
                }
            }
      
        }
        else
        {
            let alert = Alert.create({
                title: 'Attention',
                message: 'Pour contacter ce jobyer, vous devez être connectés.',
                buttons: [
                    {
                        text: 'Annuler',
                        role: 'cancel',
                    },
                    {
                        text: 'Connexion',
                        handler: () => {
                            this.nav.push(LoginsPage);
                        }
                    }
                ]
            });
            this.nav.present(alert);
        }
      
       
      
   }
  
}
