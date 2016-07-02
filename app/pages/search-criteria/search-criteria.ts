import {
    NavController, ViewController, Loading, Slides, Picker, PickerColumnOption, Storage, SqlStorage,
    Modal
} from 'ionic-angular';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from "../../providers/search-service/search-service";
import {SearchResultsPage} from "../search-results/search-results";
import {Component} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {CommunesService} from "../../providers/communes-service/communes-service";
import {isUndefined} from "ionic-angular/util";
import {SearchGuidePage} from "../search-guide/search-guide";

/**
 * @author abdeslam jakjoud
 * @descirption Modal page exposing search criteria
 * @module Search
 */
@Component({
    templateUrl: 'build/pages/search-criteria/search-criteria.html',
    providers: [GlobalConfigs, CommunesService]
})
export class SearchCriteriaPage {

    filters:any = [];
    projectTarget:string;
    activeCount:number = 0;
    themeColor:string;

    sectors : any = [];
    sectorList : any = [];
    jobs : any = [];
    jobList : any = [];
    sector : any;
    idSector : any;
    job : any;
    idJob : any;
    db : Storage;
    availabilityDate : any;
    city : any;
    cities : any = [];
    cityList : any = [];

    constructor(private viewCtrl:ViewController,
                public globalConfig:GlobalConfigs,
                private searchService:SearchService,
                private cityServices : CommunesService,
                private nav:NavController) {
        this.viewCtrl = viewCtrl;
        this.projectTarget = globalConfig.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.buildFilters();
        this.db = new Storage(SqlStorage);
        this.db.get("SECTOR_LIST").then(data => {
            this.sectorList = JSON.parse(data);
        });

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
        /*var voidQuery = true;
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
        }*/

        //  Construct the search query in the correct format then summon search service

        if(isUndefined(this.sector) || (this.job && this.job.length>0))
            this.sector = '';
        if(isUndefined(this.job))
            this.job = '';
        if(isUndefined(this.city))
            this.city = '';

        let date = '';
        if(this.availabilityDate){
            date = this.availabilityDate.split('-')[2]+'/'+this.availabilityDate.split('-')[1]+'/'+this.availabilityDate.split('-')[0];
        }

        var searchFields = {
            class: 'com.vitonjob.callouts.recherche.SearchQuery',
            job: this.job,
            metier: this.sector,
            lieu: this.city,
            nom: this.filters[2].value,
            entreprise: this.projectTarget == 'jobyer' ? this.filters[5].value : '',
            date: date,
            table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
            idOffre: '0'
        };
        console.log(JSON.stringify(searchFields));
        debugger;
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




    watchSector(e){
        let val = e.target.value;
        if(val.length<3){
            this.sectors = [];
            return;
        }

        this.sectors = [];

        for(let i = 0 ; i < this.sectorList.length ; i++){
            let s = this.sectorList[i];
            if(s.libelle.toLocaleLowerCase().indexOf(val.toLocaleLowerCase())>-1){
                this.sectors.push(s);
            }
        }
    }

    watchJob(e){
        let val = e.target.value;
        if(val.length<3){
            this.jobs = [];
            return;
        }

        this.jobs = [];

        for(let i = 0 ; i < this.jobList.length ; i++){
            let s = this.jobList[i];
            if(s.libelle.toLocaleLowerCase().indexOf(val.toLocaleLowerCase())>-1){
                this.jobs.push(s);
            }
        }
    }

    jobSelected(job){
        this.job = job.libelle;
        this.idJob = job.id;
        this.jobs = [];

    }

    setSectorsPicker() {
        let picker = Picker.create();
        let options:PickerColumnOption[] = new Array<PickerColumnOption>();

        this.db.get('SECTOR_LIST').then(listSectors => {
            if (listSectors) {
                listSectors = JSON.parse(listSectors);
                for (let i = 1; i < listSectors.length; i++) {
                    options.push({
                        value: listSectors[i].id,
                        text: listSectors[i].libelle
                    })
                }
            }
            let column = {
                selectedIndex: 0,
                options: options
            };

            picker.addColumn(column);
            picker.addButton('Annuler');
            picker.addButton({
                text: 'Valider',
                handler: data => {
                    this.sector = data.undefined.text;
                    this.idSector = data.undefined.value;
                    this.filterJobList();
                    this.job = '';
                    this.idJob = 0;
                }
            });
            picker.setCssClass('sectorPicker');
            this.nav.present(picker);

        });
    }

    filterJobList() {

        this.db.get('JOB_LIST').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.idSector;

                    // if the value is an empty string don't filter the items
                    if (!(q === '')) {
                        list = list.filter((v) => {
                            return (v.idsector == q);
                        });
                        this.listJobs = list;
                        this.jobList = list;
                    }

                }
            }
        );

    }

    setJobsPicker() {
        let picker = Picker.create();
        let options:PickerColumnOption[] = new Array<PickerColumnOption>();


        this.db.get('JOB_LIST').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.idSector;

                    // if the value is an empty string don't filter the items
                    if (!(q === '')) {
                        list = list.filter((v) => {
                            return (v.idsector == q);
                        });
                    }

                    this.listJobs = list;
                    this.jobList = list;
                    for (let i = 1; i < this.listJobs.length; i++) {
                        options.push({
                            value: this.listJobs[i].id,
                            text: this.listJobs[i].libelle
                        })
                    }
                    let column = {
                        selectedIndex: 0,
                        options: options
                    };

                    picker.addColumn(column);
                    picker.addButton('Annuler');
                    picker.addButton({
                        text: 'Valider',
                        handler: data => {
                            this.job = data.undefined.text;
                            this.idJob = data.undefined.value;
                            /*this.enterpriseCard.offer.job = data.undefined.text;
                             this.enterpriseCard.offer.idJob = data.undefined.value;*/
                        }
                    });
                    picker.setCssClass('jobPicker');
                    this.nav.present(picker);

                }
            }
        );


    }

    sectorSelected(sector){
        this.sector = sector.libelle;
        this.idSector = sector.id;
        this.sectors = [];

        this.db.get("JOB_LIST").then(data => {

            this.jobList = JSON.parse(data);
            this.jobList = this.jobList.filter((v)=>{
                return (v.idsector == sector.id);
            }) ;

        });
    }

    watchCity(e){
        let val = e.target.value;
        if(val.length<3){
            this.cities = [];
            return;
        }

        this.cities = [];

        this.cityServices.autocompleteCity(val).then(data=>{
            if(data)
                this.cities = data;
        });
    }

    citySelected(job){
        this.city = job.nom;
        this.cities = [];
    }

    setCitiesPicker() {
        let picker = Picker.create();
        let options:PickerColumnOption[] = new Array<PickerColumnOption>();

        this.db.get('CITIES_LIST').then(listCities => {
            if (listCities) {
                listCities = JSON.parse(listCities);
                for (let i = 1; i < listCities.length; i++) {
                    options.push({
                        value: listCities[i].id,
                        text: listCities[i].nom
                    })
                }
            }
            let column = {
                selectedIndex: 0,
                options: options
            };

            picker.addColumn(column);
            picker.addButton('Annuler');
            picker.addButton({
                text: 'Valider',
                handler: data => {
                    this.city = data.undefined.text;
                }
            });
            picker.setCssClass('sectorPicker');
            this.nav.present(picker);

        });
    }

    showGuideModal(){
        let m = new Modal(SearchGuidePage);
        this.nav.present(m);
    }
}
