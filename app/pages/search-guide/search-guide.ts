import {NavController, ViewController, Loading} from 'ionic-angular';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from "../../providers/search-service/search-service";
import {SearchResultsPage} from "../search-results/search-results";
import {Component} from "@angular/core";


@Component({
  templateUrl: 'build/pages/search-guide/search-guide.html',
})
export class SearchGuidePage {
  projectTarget : string;
  jobLabel : string = '';
  job : string;
  levelLabel :string;
  level : string;
  availabilityLabel : string;
  availability : any;
  constructor(private viewCtrl: ViewController,
              public globalConfig: GlobalConfigs,
              private searchService: SearchService,
              private nav: NavController) {
    this.viewCtrl = viewCtrl;
    this.projectTarget = globalConfig.getProjectTarget();
    this.projectTarget = globalConfig.getProjectTarget();
    if(this.projectTarget == 'jobyer')
      this.prepareLabelsJobyer();
    else
      this.prepareLabelsEmployer();
  }

  prepareLabelsJobyer(){
    this.jobLabel = "Je cherche de l'emploi comme ";
    this.levelLabel = "Mon niveau est ";
    this.availabilityLabel = "Disponibles à parir du ";
  }

  prepareLabelsEmployer(){
    this.jobLabel = "Je cherche candidats pour ";
    this.levelLabel = "Le niveau requis est ";
    this.availabilityLabel = "Disponibles à parir du ";
  }

  validateSearch(){

    var voidQuery = this.job == '';
    if(voidQuery){
      //  Nothing to do here
      console.log('No search criteria given');
      this.viewCtrl.dismiss();
      return;
    }

    var searchFields = {
      class : 'com.vitonjob.callouts.recherche.SearchQuery',
      job : this.job,
      metier : '',
      lieu : '',
      nom : '',
      entreprise : '',
      date : this.availability,
      table : this.projectTarget == 'jobyer'?'user_offre_entreprise':'user_offre_jobyer',
      idOffre :'0'
    };
    console.log(searchFields);
    let loading = Loading.create({
      content: ` 
                <div>
                    <img src='img/loading.gif' />
                </div>
                `,
      spinner : 'hide'
    });
    this.nav.present(loading);
    this.searchService.criteriaSearch(searchFields, this.projectTarget ).then((data) => {
      console.log(data);
      this.searchService.persistLastSearch(data);
      loading.dismiss();
      this.nav.push(SearchResultsPage);
    });

    //  Our work is done we dismiss the modal
    this.viewCtrl.dismiss();
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
