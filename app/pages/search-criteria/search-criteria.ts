import {NavController, ViewController, Loading, Slides} from 'ionic-angular';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from "../../providers/search-service/search-service";
import {SearchResultsPage} from "../search-results/search-results";
import {Component} from "@angular/core";
import {Configs} from "../../configurations/configs";

/**
 * @author abdeslam jakjoud
 * @descirption Modal page exposing search criteria
 * @module Search
 */
@Component({
    templateUrl: 'build/pages/search-criteria/search-criteria.html',
    providers: [GlobalConfigs]
})
export class SearchCriteriaPage {

    filters:any = [];
    projectTarget:string;
    activeCount:number = 0;
    themeColor:string;

    constructor(private viewCtrl:ViewController,
                public globalConfig:GlobalConfigs,
                private searchService:SearchService,
                private nav:NavController) {
        this.viewCtrl = viewCtrl;
        this.projectTarget = globalConfig.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.buildFilters();

    }


    /**
     * @descirption depending on the nature of the project this method constructs the required buttons and input for filters
     */
    buildFilters() {
        if (this.projectTarget == 'jobyer') {
            var filter = {
                title: 'Métier',
                field: 'metier',
                activated: false,
                placeHolder: 'Secteur',
                icon: 'pie',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Job',
                field: 'job',
                activated: false,
                placeHolder: 'Job',
                icon: 'briefcase',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Nom',
                field: 'nom',
                activated: false,
                placeHolder: 'Nom / Prénom',
                icon: 'person',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Localisation',
                field: 'lieu',
                activated: false,
                placeHolder: 'Rue, Ville, Code postal, ...',
                icon: 'pin',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Date de disponibilité',
                field: 'date',
                activated: false,
                placeHolder: 'JJ/MM/AAAA',
                icon: 'calendar',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Entreprise',
                field: 'entreprise',
                activated: false,
                placeHolder: 'Entreprise',
                icon: 'people',
                value: ''
            };

            this.filters.push(filter);

        } else {

            var filter = {
                title: 'Métier',
                field: 'metier',
                activated: false,
                placeHolder: 'Secteur',
                icon: 'pie',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Job',
                field: 'job',
                activated: false,
                placeHolder: 'Job',
                icon: 'briefcase',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Nom',
                field: 'nom',
                activated: false,
                placeHolder: 'Nom / Prénom',
                icon: 'person',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Localisation',
                field: 'lieu',
                activated: false,
                placeHolder: 'Rue, Ville, Code postal, ...',
                icon: 'pin',
                value: ''
            };

            this.filters.push(filter);

            filter = {
                title: 'Date de disponibilité',
                field: 'date',
                activated: false,
                placeHolder: 'JJ/MM/AAAA',
                icon: 'calendar',
                value: ''
            };

            this.filters.push(filter);
        }
    }

    /**
     * @description Enables or disables a filter for multi-criteria search
     * @param filtee the required filter
     */
    toogleFilter(filter) {
        filter.activated = !filter.activated;
        if (filter.activated)
            this.activeCount += 10;
        else
            this.activeCount -= 10;
    }

    /**
     * @description send criteria search to web service and load results view
     */
    validateSearch() {

        //  check first if there are any criteria with value
        var voidQuery = true;
        for (var i = 0; i < this.filters.length; i++) {
            var f = this.filters[i];
            console.log(f);
            if (f.activated && f.value != '') {
                voidQuery = false;
                break;
            }
        }

        if (voidQuery) {
            //  Nothing to do here
            console.log('No search criteria given');
            this.viewCtrl.dismiss();
            return;
        }

        //  Construct the search query in the correct format then summon search service

        var searchFields = {
            class: 'com.vitonjob.callouts.recherche.SearchQuery',
            job: this.filters[1].value,
            metier: this.filters[0].value,
            lieu: this.filters[3].value,
            nom: this.filters[2].value,
            entreprise: this.projectTarget == 'jobyer' ? this.filters[5].value : '',
            date: this.filters[4].value,
            table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
            idOffre: '0'
        };
        console.log(searchFields);
        let loading = Loading.create({
            content: ` 
                <div>
                    <img src='img/loading.gif' />
                </div>
                `,
            spinner: 'hide'
        });
        this.nav.present(loading);
        this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data) => {
            console.log(data);
            this.searchService.persistLastSearch(data);
            loading.dismiss();
            this.nav.push(SearchResultsPage);
        });

        //  Our work is done we dismiss the modal
        this.viewCtrl.dismiss();
    }

    /**
     * @description Cancel search and dismiss the modal page
     */
    close() {
        this.viewCtrl.dismiss();
    }

    calculateHeight() {
        let style = {
            'margin-top': 'calc(100% - ' + this.activeCount + '%);'
        };
        return style;
    }
}
