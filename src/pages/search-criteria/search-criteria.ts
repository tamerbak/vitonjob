import {
    NavController,
    ViewController,
    LoadingController,
    PickerController,
    Platform,
    ToastController,
    ModalController,
    AlertController,
    Content,
    FabContainer,
    Events,
    NavParams
} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {SearchResultsPage} from "../search-results/search-results";
import {Component, ViewChild} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {CommunesService} from "../../providers/communes-service/communes-service";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {SearchGuidePage} from "../search-guide/search-guide";
import {DatePicker} from "ionic-native";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
import {Storage} from "@ionic/storage";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";
import {CorporamaService} from "../../providers/corporama-service/corporama-service";

declare let require: any;
/**
 * @author abdeslam jakjoud
 * @descirption Modal page exposing search criteria
 * @module Search
 */
@Component({
    templateUrl: 'search-criteria.html',
    selector: 'search-criteria'
})
export class SearchCriteriaPage {

    @ViewChild(Content)
    content: Content;
    @ViewChild(FabContainer)
    public fab: FabContainer;

    public filters: any = [];
    public projectTarget: string;
    public activeCount: number = 0;
    public themeColor: string;

    public sectors: any = [];
    public sectorList: any = [];
    public jobs: any = [];
    public jobList: any = [];
    public sector: any;
    public idSector: any;
    public job: any;
    public idJob: any;
    public availabilityDate: any;
    public city: any;
    public cities: any = [];
    //public cityList: any = [];
    public isAndroid4: boolean;
    public isSectorFound = true;
    public isJobFound = true;
    public listJobs: any = [];
    public calendarTheme: any;
    public isEmployer: boolean;
    public jobData: {
        'class': "com.vitonjob.callouts.auth.model.JobData",
        idJob: number,
        job: string,
        idSector: number,
        sector: string,
        level: string,
        remuneration: number,
        currency: string,
        validated: boolean,
        prerequisObligatoires: any,
        adress: any
        isJobValidated: boolean;
        isLevelValidated: boolean;
    };
    public newCombination = [];
    public showedSlot: any;
    public maxDate: any;
    public minStartDate: any;
    public maxStartDate: any;
    public minEndDate: any;
    public maxEndDate: any;
    public todayDate: any;
    public filterState: Array<{isActivated: boolean, color: string}> = [];
    public hoursErrorMessage: string;
    public languages = [];
    public qualities = [];
    public offerService: any;

    public person: {firstName: string, lastName: string, isPersonValidated: boolean};
    public enterprise: {id: number, name: string, isEnterpriseValidated: boolean};
    public enterprises = [];
    public isEnterprise: {found: boolean, done: boolean};
    public isCity: {found: boolean, done: boolean};
    public isCityValidated: boolean = false;
    public isLanguageValidated: boolean = false;
    public isQualityValidated: boolean = false;

    constructor(private viewCtrl: ViewController,
                public globalConfig: GlobalConfigs,
                private searchService: SearchService,
                private cityServices: CommunesService,
                private nav: NavController, platform: Platform,
                public loading: LoadingController,
                public toast: ToastController,
                public picker: PickerController, public db: Storage, public modal: ModalController,
                _offerService: OffersService,
                public alert: AlertController,
                public event: Events,
                public corporama: CorporamaService, public params: NavParams) {
        this.viewCtrl = viewCtrl;
        this.projectTarget = globalConfig.getProjectTarget();
        this.isEmployer = (this.projectTarget === 'employer');
        let config = Configs.setConfigs(this.projectTarget);
        this.isAndroid4 = (platform.is('android')) && (platform.version().major < 5);
        this.offerService = _offerService;
        this.themeColor = config.themeColor;
        this.buildFilters();
        this.db.get("SECTOR_LIST").then((data: any) => {
            this.sectorList = JSON.parse(data);
        });

        for (let i = 0; i < 7; i++) {
            this.filterState.push({isActivated: false, color: "light"});
        }

        let jobParam = this.params.get('job');
        let cityParam = this.params.get('city');

        this.city = (cityParam) ? cityParam.nom : "";
        this.isCityValidated = (cityParam);
        this.filterState[2].isActivated = (cityParam);

        this.jobData = {
            'class': "com.vitonjob.callouts.auth.model.JobData",
            job: (jobParam) ? jobParam.libelle : (cityParam) ? "un/une jobyer" :"",
            sector: (jobParam) ? jobParam.sector : "",
            idSector: (jobParam) ? jobParam.idsector : "",
            idJob: (jobParam) ? jobParam.id : (cityParam) ? -1 : 0,
            level: 'junior',
            remuneration: null,
            currency: 'euro',
            validated: false,
            prerequisObligatoires: [],
            adress: {
                fullAdress: '',
                name: '',
                street: '',
                streetNumber: '',
                zipCode: '',
                city: '',
                country: ''
            },
            isJobValidated: (cityParam),
            isLevelValidated: false
        };

        this.person = {firstName: "", lastName: "", isPersonValidated: false};
        this.enterprise = {id: 0, name: "", isEnterpriseValidated: false};
        this.isEnterprise = {found: true, done: true};
        this.isCity = {found: true, done: true};

        //load Jobs
        this.db.get('JOB_LIST').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    // if the value is an empty string don't filter the items
                    this.listJobs = list;
                    this.jobList = list;
                }
            }
        );
        this.todayDate = new Date();
        this.maxDate = new Date(new Date().getFullYear() + 2, 11, 31).toISOString();
        this.minStartDate = new Date(this.todayDate.setUTCHours(this.todayDate.getUTCHours() + 1)).toISOString();
        this.maxStartDate = this.maxDate;
        this.minEndDate = new Date(this.todayDate.setUTCHours(this.todayDate.getUTCHours(), this.todayDate.getUTCMinutes() + 15)).toISOString();
        this.maxEndDate = new Date(this.todayDate.setDate(this.todayDate.getDate() + 1)).toISOString();

        this.showedSlot = {
            date: new Date().toISOString(),
            startDate: this.minStartDate,
            endDate: this.minEndDate,
            startHour: null,
            isSlotValidated: false
        };
        /*offerService.loadJobs(this.projectTarget, this.jobData.idSector).then((data)=>{
         this.jobs = data;
         });*/
    }

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date or Date object
     * @param options Date options
     */
    toDateString(date: any) {
        return new Date(date).toLocaleDateString('fr-FR');
    }

    onPageScroll(event) {
        console.log(event.scrollTop);
        if (event.scrollTop === event.startY)
            this.fab.close();

    }

    ngOnInit() {
        //this.content.ionScroll.subscribe(this.onPageScroll.bind(this));
    }

    ngOnChanges(changes) {
        // changes.prop contains the old and the new value...
        debugger;
    }


    /**
     * @descirption depending on the nature of the project this method constructs the required buttons and input for filters
     */
    buildFilters() {
        if (this.projectTarget == 'jobyer') {
            let filter = {
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

            let filter = {
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

        let idLevel = 0;
        let startDate: Date;
        let endDate: Date;
        let langIdList = [];
        let qualIdList = [];
        let query = '';
        // Construct the search query in the correct format then summon search service
        // TEL05082016 : fixes #628
        let ignoreSector: boolean = false;
        if (isUndefined(this.sector) || (this.job && this.job.length > 0))
            ignoreSector = true;
        if (this.jobData.idJob === 0) {
            //launch semantic search with search sentence as a query
            query = this.jobData.job;
        }
        if (isUndefined(this.city))
            this.city = '';
        if (isUndefined(this.jobData.level))
            if (this.jobData.level === 'junior')
                idLevel = 1;
            else idLevel = 2;
        if (this.showedSlot.startDate) {
            startDate = new Date(this.showedSlot.startDate);
        }
        if (this.showedSlot.endDate) {
            endDate = new Date(this.showedSlot.endDate);
        }
        if (this.languages.length > 0) {
            // TODO id not recognized
            debugger;
            for (let i = 0; i < this.languages.length; i++)
                langIdList.push(this.languages[i].idLanguage.toString());
        }
        if (this.qualities.length > 0) {
            for (let i = 0; i < this.qualities.length; i++)
                qualIdList.push(this.qualities[i].idQuality.toString());
        }

        // If job is not recognized :
        if (query.length > 0) {
            this.doSemanticSearch(query);
            return;
        }

        let searchFields = {
            class: 'com.vitonjob.recherche.model.SearchQuery',
            queryType: 'CRITERIA',
            job: this.jobData.idJob,
            sector: 0,
            location: (this.filterState[2].isActivated) ? this.city : "",
            firstName: (this.filterState[6].isActivated && this.projectTarget == 'employer') ? this.person.firstName : "",
            lastName: (this.filterState[6].isActivated && this.projectTarget == 'employer') ? this.person.lastName : "",

            startDate: (this.filterState[1].isActivated) ? startDate : null,
            endDate: (this.filterState[1].isActivated) ? endDate : null,
            startHour: (this.filterState[1].isActivated) ? 0 : 0,
            endHour: (this.filterState[1].isActivated) ? 0 : 0,

            level: (this.filterState[0].isActivated) ? idLevel : 0,

            idEntreprise: (this.filterState[3].isActivated && this.projectTarget == 'jobyer') ? this.enterprise.id : 0,

            languages: (this.filterState[4].isActivated) ? langIdList : null,
            qualities: (this.filterState[5].isActivated) ? qualIdList : null,

            resultsType: this.projectTarget == 'jobyer' ? 'employer' : 'jobyer'
        };

        /*let searchFields = {
         class: 'com.vitonjob.callouts.recherche.SearchQuery',
         job: this.job,
         metier: (ignoreSector) ? '' : this.sector,
         lieu: this.city,
         nom: this.filters[2].value,
         entreprise: this.projectTarget == 'jobyer' ? this.filters[5].value : '',
         date: startDate,
         table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
         idOffre: '0'
         };*/
        console.log(JSON.stringify(searchFields));

        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();
        this.searchService.advancedSearch(searchFields).then((data: any) => {
            console.log(data);
            this.searchService.persistLastSearch(data);
            loading.dismiss();
            this.nav.push(SearchResultsPage);
        });


    }

    /**
     * @description Cancel search and dismiss the modal page
     */
    close() {
        this.nav.pop();
    }

    calculateHeight() {
        let style = {
            'margin-top': 'calc(100% - ' + this.activeCount + '%);'
        };
        return style;
    }

    /**
     * @author abdeslam jakjoud
     * @description perform semantic search and pushes the results view
     */
    doSemanticSearch(query: string) {
        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();
        console.log('Initiating search for ' + query);
        this.searchService.semanticSearch(query, 0, this.projectTarget).then((results: any) => {
            let data = [];
            if (this.projectTarget == 'jobyer')
                data = results.offerEnterprise;
            else
                data = results.offerJobyers;

            this.searchService.setLastIndexation({resultsIndex: results.indexation});
            this.searchService.persistLastSearch(data);
            loading.dismiss();
            this.nav.push(SearchResultsPage, {searchType: 'semantic'});
        });
    }

    watchSector(e) {
        let val = e.target.value;
        if (val.length < 3) {
            this.isSectorFound = true;
            this.sectors = [];
            return;
        }

        this.sectors = [];
        let removeDiacritics = require('diacritics').remove;
        for (let i = 0; i < this.sectorList.length; i++) {
            let s = this.sectorList[i];
            if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
                this.sectors.push(s);
            }
        }
        if (this.sectors.length == 0) {
            this.isSectorFound = false;
        } else {
            this.isSectorFound = true;
        }
    }

    watchJob(e) {
        let val = e.target.value;
        if (val.length < 3) {
            this.isJobFound = true;
            this.jobs = [];
            this.newCombination = [];
            return;
        }

        this.jobs = [];
        this.newCombination = [];
        let removeDiacritics = require('diacritics').remove;
        for (let i = 0; i < this.jobList.length; i++) {
            let s = this.jobList[i];
            let sectorIndex = 0;
            if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
                let currentJob = s;
                if (this.newCombination.filter((elem, pos) => {
                        sectorIndex = pos;
                        return elem.idSector === s.idsector;
                    }).length > 0) {
                    this.newCombination[sectorIndex].jobs.push(currentJob);
                } else {
                    this.newCombination.push({idSector: s.idsector, sector: s.sector, jobs: [currentJob]});
                }
            }

        }

        this.jobs = this.newCombination.sort((a, b) => {
            return b.sector - a.sector;
        });
        if (this.jobs.length == 0) {
            this.isJobFound = false;
        } else {
            this.isJobFound = true;
        }
    }

    jobSelected(job) {
        this.job = job.libelle;
        this.idJob = job.id;
        this.jobs = [];
        this.newCombination = [];
        this.jobData.job = job.libelle;
        this.jobData.idJob = job.id;
        this.jobData.idSector = job.idsector;
        this.jobData.sector = job.sector;
        //this.filterJobList();

    }

    setSectorsPicker() {
        let picker = this.picker.create();
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();

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
                    this.isSectorFound = true;
                    this.isJobFound = true;
                    this.sector = data.undefined.text;
                    this.idSector = data.undefined.value;
                    this.filterJobList();
                    this.job = '';
                    this.idJob = 0;
                }
            });
            picker.setCssClass('sectorPicker');
            picker.present();

        });
    }

    filterJobList() {

        this.db.get('JOB_LIST').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.jobData.idSector;

                    // if the value is an empty string don't filter the items
                    if (q > 0) {
                        list = list.filter((v) => {
                            return (v.idsector == q);
                        });
                    }
                    this.listJobs = list;
                    this.jobList = list;
                }
            }
        );

    }

    setJobsPicker() {
        let picker = this.picker.create();
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();


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
                            this.isJobFound = true;
                            this.job = data.undefined.text;
                            this.idJob = data.undefined.value;
                            /*this.enterpriseCard.offer.job = data.undefined.text;
                             this.enterpriseCard.offer.idJob = data.undefined.value;*/
                        }
                    });
                    picker.setCssClass('jobPicker');
                    picker.present();

                }
            }
        );


    }

    sectorSelected(sector) {
        this.isJobFound = true;
        this.sector = sector.libelle;
        this.idSector = sector.id;
        this.job = '';
        this.sectors = [];
        this.jobData.sector = sector.libelle;
        this.jobData.idSector = sector.id;

        this.db.get("JOB_LIST").then((data: any) => {

            this.jobList = JSON.parse(data);
            this.jobList = this.jobList.filter((v) => {
                return (v.idsector == sector.id);
            });

        });
    }

    watchCity(e) {
        let val = e.target.value;
        this.isCity.found = true;
        if (val.length < 3) {
            this.cities = [];
            this.isCity.done = true;
            return;
        } else
            this.isCity.done = false;

        this.cities = [];
        this.cityServices.autocompleteCity(val).then((data: any) => {
            if (data) {
                this.cities = data.filter((item, pos, inputArray) => {
                    for (let i = 0; i < pos; i++) {
                        if (item.nom.trim().toLowerCase() === inputArray[i].nom.trim().toLowerCase())
                            return false;
                        else
                            continue;
                    }
                    return true
                });
            }
            this.isCity.done = true;
            this.isCity.found = this.cities.length > 0;

        });
    }

    watchEnterprise(e) {
        let val = e.target.value;
        this.isEnterprise.found = true;
        if (val.length < 3) {
            this.enterprises = [];
            this.isEnterprise.done = true;
            return;
        } else {
            this.isEnterprise.done = false;
        }

        this.enterprises = [];
        this.corporama.autocompleteEnterprise(val).then((data: any) => {
            if (data) {
                this.enterprises = data.filter((item, pos, inputArray) => {
                    for (let i = 0; i < pos; i++) {
                        if (item.nom.trim().toLowerCase() === inputArray[i].nom.trim().toLowerCase())
                            return false;
                        else
                            continue;
                    }
                    return true
                });
            }
            this.isEnterprise.found = this.enterprises.length > 0;
            this.isEnterprise.done = true;
        });
    }

    enterpriseSelected(enterprise) {
        this.enterprise.name = enterprise.nom;
        this.enterprise.id = enterprise.id;
        this.enterprises = [];
        this.isEnterprise.found = true;
    }

    citySelected(city) {
        this.city = city.nom;
        this.cities = [];
    }

    setCitiesPicker() {
        let picker = this.picker.create();
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();

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
            picker.present();

        });
    }

    showGuideModal() {

        this.nav.push(SearchGuidePage);
    }

    /**
     * launching dateTimePicker component for slot selection
     */
    launchDateTimePicker(type) {

        DatePicker.show({
            date: new Date(),
            mode: type,
            minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour: true,
            doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
        }).then(
            date => {
                console.log("Got date: ", date);
                this.availabilityDate = this.toDateString(date.getTime());
                //this.showedSlot.angular4Date = this.toDateString(this.slot.date.getTime(), '');
            },
            err => console.log("Error occurred while getting date:", err)
        );
    }

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date
     */
    toDateStringFR(date: number) {
        let d = new Date(date);
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }

    /**
     * @Description Converts a timeStamp to date string
     * @param time : a timestamp date
     */
    toHourString(time: number) {
        let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
        let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
        return hours + ":" + minutes;
    }

    presentToast(message: string, duration: number) {
        let toast = this.toast.create({
            message: message,
            duration: duration * 1000
        });
        toast.present();
    }

    /**
     * @Description : loads sector list
     */
    showSectorList() {
        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();
        this.db.get("SECTOR_LIST").then((data: any) => {
            this.sectorList = JSON.parse(data);
            let selectionModel = this.modal.create(ModalSelectionPage,
                {type: 'secteur', items: this.sectorList, selection: this});
            loading.dismiss();
            selectionModel.present();
            selectionModel.onDidDismiss(() => {
                this.isSectorFound = true;
                this.isJobFound = true;
                this.sector = this.jobData.sector;
                this.idSector = this.jobData.idSector;
                this.filterJobList();
                this.job = '';
                this.idJob = 0;
            });
        });

    }

    /**
     * @Description : loads jobs list
     */
    showJobList() {
        let c = this.jobData.idSector;
        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();
        this.db.get("JOB_LIST").then((data: any) => {

            this.jobList = JSON.parse(data);
            this.jobList = this.jobList.filter((v) => {
                return (v.idsector == c);
            });

            let selectionModel = this.modal.create(ModalSelectionPage,
                {type: 'job', items: this.jobList, selection: this});
            loading.dismiss();
            selectionModel.present();
            selectionModel.onDidDismiss(() => {
                this.isJobFound = true;
                this.job = this.jobData.job;
                this.idJob = this.jobData.idJob;
            });
        });
    }

    setFilter(index, fab) {
        this.filterState[index].isActivated = !this.filterState[index].isActivated;
        this.filterState[index].color = (this.filterState[index].isActivated) ? 'vojbrown' : 'light';
        fab.close()
    }

    clearSector() {
        this.jobData.sector = "";
        this.jobData.idSector = 0;
        this.sector = "";
        this.idSector = 0;
        this.jobData.job = "";
        this.jobData.idJob = 0;
        this.job = "";
        this.idJob = 0;
        this.isJobFound = true;
        this.isSectorFound = true;
        this.jobs = [];
        this.filterJobList();
    }

    clearJob() {
        this.jobData.job = "";
        this.jobData.idJob = 0;
        this.job = "";
        this.idJob = 0;
        this.isJobFound = true;
        this.jobs = [];
    }

    checkHour(i) {
        this.hoursErrorMessage = '';

        /*if (i === 0) {
         this.minEndDate = new Date(new Date(this.showedSlot.startDate).setUTCHours(new Date(this.showedSlot.startDate).getUTCHours(), new Date(this.showedSlot.startDate).getUTCMinutes() + 15)).toISOString();
         this.maxEndDate = new Date(new Date(this.showedSlot.startDate).setUTCHours(new Date(this.showedSlot.startDate).getUTCHours() + 10)).toISOString();
         this.showedSlot.endDate = this.minEndDate;
         if (this.daysList.filter(da=>{return da.checked}).length > 0){
         this.daysList.filter(da=>{return da.checked})[0].checked = false;
         }
         if (this.daysList.filter(da=>{return da.value === new Date(this.showedSlot.startDate).getDate()}).length > 0){
         this.daysList.filter(da=>{return da.value === new Date(this.showedSlot.startDate).getDate()})[0].checked = true;
         }

         this.showedSlot.startHour = new Date(this.showedSlot.startDate).getUTCHours();
         } else if (i===1) {
         this.showedSlot.endHour = new Date(this.showedSlot.endHour).getUTCHours();
         }*/
        let date = new Date(this.showedSlot.startDate);
        this.showedSlot.startHour = (date.getHours() - 1) * 60 + date.getMinutes();

        date = new Date(this.showedSlot.endDate);
        this.showedSlot.startHour = date.getHours() - 1 * 60 + date.getMinutes();

        //check if dates and hours are coherent
        if (new Date(this.showedSlot.startDate) && new Date(this.showedSlot.endDate) && new Date(this.showedSlot.startDate) >= new Date(this.showedSlot.endDate)) {
            if (i == 0) {
                this.hoursErrorMessage = "* L'heure de début doit être inférieure à l'heure de fin";
                this.showedSlot.startHour = "";
                return;
            } else {
                this.hoursErrorMessage = "* L'heure de fin doit être supérieure à l'heure de début";
                this.showedSlot.endHour = "";
                return;
            }
        } else
            this.hoursErrorMessage = "";

        //check if chosen hour and date are passed
        if (i == 0 && this.showedSlot.startDate && new Date(this.showedSlot.startDate) <= new Date()) {
            this.hoursErrorMessage = "* L'heure de début doit être supérieure à l'heure actuelle";
            this.showedSlot.startDate = "";
            return;
        } else
            this.hoursErrorMessage = "";
        if (i == 1 && this.showedSlot.endDate && new Date(this.showedSlot.endDate) <= new Date()) {
            this.hoursErrorMessage = "* L'heure de fin doit être supérieure à l'heure actuelle";
            this.showedSlot.endDate = "";
            return;
        } else
            this.hoursErrorMessage = "";
    }

    /**
     * @Description : loads language list
     */
    showLanguages() {
        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();
        this.offerService.loadLanguages(this.projectTarget).then((data: any) => {
            let languageList = data;
            let selectionModel = this.modal.create(ModalSelectionPage,
                {type: 'langue', items: languageList, selection: this});
            loading.dismiss();
            selectionModel.present();
        });
    }

    /**
     * @Description : removing slected language
     */
    removeLanguage(item) {

        if (this.languages.length > 0 && this.languages.indexOf(item) > -1)
            this.languages.splice(this.languages.indexOf(item), 1);
    }

    /**
     * @Description : loads language list
     */
    showQualities() {
        let loading = this.loading.create({content: "Merci de patienter..."});
        loading.present();
        this.offerService.loadQualities(this.projectTarget).then((data: any) => {
            let qualityList = data;
            let selectionModel = this.modal.create(ModalSelectionPage,
                {type: 'qualité', items: qualityList, selection: this});
            loading.dismiss();
            selectionModel.present();
        });
    }

    /**
     * @Description : removing slected quality
     */
    removeQuality(item) {

        if (this.qualities.length > 0 && this.qualities.indexOf(item) > -1)
            this.qualities.splice(this.qualities.indexOf(item), 1);
    }

    jobValidated() {
        if (this.jobData.job)
            this.jobData.isJobValidated = true;
    }

    levelValidated() {
        if (this.jobData.level)
            this.jobData.isLevelValidated = true;
    }

    slotValidated() {
        this.showedSlot.isSlotValidated = true;
        let date = new Date(this.showedSlot.startDate);
        this.showedSlot.startHour = date.getHours() * 60 + date.getMinutes();

        date = new Date(this.showedSlot.endDate);
        this.showedSlot.startHour = date.getHours() * 60 + date.getMinutes();
    }

    cityValidated() {
        this.isCityValidated = true;
        // Didier wanna discover french city's population :
        this.jobData.isJobValidated = true;
        this.jobData.idJob = -1;
        this.jobData.job = "un/une jobyer"
    }

    enterpriseValidated() {
        this.enterprise.isEnterpriseValidated = true;
    }

    languageValidated() {
        this.isLanguageValidated = true;
    }

    qualityValidated() {
        this.isQualityValidated = true;
    }

    personValidated() {
        this.person.isPersonValidated = true;
    }

    closeChip(fab, chip: Element, elemList?) {
        chip.remove();
        switch (chip.id) {
            case 'jobChip':
                this.clearJob();
                this.jobData.isJobValidated = false;
                break;
            case 'cityChip':
                this.city = '';
                this.cities = [];
                this.isCityValidated = false;
                fab.close();
                break;
            case 'levelChip' :
                this.jobData.level = '';
                this.jobData.isLevelValidated = false;
                fab.close();
                break;
            case 'slotChip' :
                this.showedSlot.isSlotValidated = false;
                fab.close();
                break;
            case 'slotChip2' :
                this.showedSlot.isSlotValidated = false;
                fab.close();
                break;
            case 'enterpriseChip' :
                this.enterprise.isEnterpriseValidated = false;
                fab.close();
                break;
            case 'langChip' :
                this.removeLanguage(elemList);
                this.isLanguageValidated = false;
                fab.close();
                break;
            case 'qualityChip':
                this.removeQuality(elemList);
                this.isQualityValidated = false;
                fab.close();
                break;
            case 'personChip':
                this.person.isPersonValidated = false;
                fab.close();
                break;
        }

    }

}
