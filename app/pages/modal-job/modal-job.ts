import {
    NavController,
    ViewController,
    Modal,
    NavParams,
    Storage,
    SqlStorage,
    PickerColumnOption,
    Picker,
    Popover,
    Alert,
    Platform
} from "ionic-angular";
import {FormBuilder, Validators} from "@angular/common";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Component} from "@angular/core";
import {PopoverAutocompletePage} from "../popover-autocomplete/popover-autocomplete";

declare var require: any;

/*
 Generated class for the ModalJobPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-job/modal-job.html',
    providers: [OffersService]
})
export class ModalJobPage {

    public jobData: {
        'class': "com.vitonjob.callouts.auth.model.JobData",
        idJob: number,
        job: string,
        idSector: number,
        sector: string,
        level: string,
        remuneration: number,
        currency: string,
        validated: boolean
    };
    offerService: any;
    db: Storage;
    sectors: any = [];
    jobs: any = [];
    listJobs = [];
    jobList = [];
    sectorList = [];
    isSectorFound = true;
    isJobFound = true;

    projectTarget: string;
    currentUser: any;
    isEmployer: boolean;

    themeColor: string;
    storage: any;

    viewCtrl: ViewController;
    fb: FormBuilder;
    gc: GlobalConfigs;
    os: OffersService;
    params: NavParams;
    platform: Platform;

    alertOptions = {
        title: '',
        subTitle: ''
    };

    /*
     * Collective conventions management
     */
    convention: any;
    niveauxConventions: any = [];
    selectedNivConvID: number = 0;
    categoriesConventions: any = [];
    selectedCatConvID: number = 0;
    echelonsConventions: any = [];
    selectedEchConvID: number = 0;
    coefficientsConventions: any = [];
    selectedCoefConvID: number = 0;
    parametersConvention: any = [];
    selectedParamConvID: number = 0;
    minHourRate: number = 0;
    invalidHourRateMessage: string = '';
    invalidHourRate = false;

    niveauxConventionsList: any = [];
    isNiveauxConventionsFound: boolean = true;

    public static CONV_FILTER_NIV = 0;
    public static CONV_FILTER_ECH = 1;
    public static CONV_FILTER_CAT = 2;
    public static CONV_FILTER_COEF = 3;
    conventionFilters: any = [{
        name: 'NIV',
        labelle: 'niveau',
        selected: "",
        list: [],
        filteredList: [],
        isFound: true,
    }, {
        name: 'ECH',
        labelle: 'echelon',
        selected: "",
        list: [],
        filteredList: [],
        isFound: true,
    }, {
        name: 'CAT',
        labelle: 'catégorie',
        selected: "",
        list: [],
        filteredList: [],
        isFound: true,
    }, {
        name: 'COEF',
        labelle: 'coéfficient',
        selected: "",
        list: [],
        filteredList: [],
        isFound: true,
    }];

    categoriesHeure: any = [];
    majorationsHeure: any = [];
    indemnites: any = [];
    dataValidation: boolean = false;

    constructor(public nav: NavController,
                viewCtrl: ViewController,
                fb: FormBuilder,
                gc: GlobalConfigs,
                os: OffersService,
                params: NavParams,
                platform: Platform,
                public offersService: OffersService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        this.convention = {
            id: 0,
            code: '',
            libelle: ''
        };

        // this.currentUser = config.currentUserVar;

        let self = this;
        this.storage = new Storage(SqlStorage);
        this.storage.get(config.currentUserVar).then((value) => {
            if (value) {
                var currentUser = JSON.parse(value);

                self.projectTarget = (currentUser.estRecruteur ? 'employer' : (currentUser.estEmployeur ? 'employer' : 'jobyer'));

                if (currentUser.estEmployeur && currentUser.employer.entreprises[0].conventionCollective.id > 0) {
                    // Load collective convention
                    self.offersService.getConvention(currentUser.employer.entreprises[0].conventionCollective.id).then(c=> {
                        if (c)
                            self.convention = c;
                        if (self.convention.id > 0) {
                            self.offersService.getConventionNiveaux(self.convention.id).then(data=> {
                                this.conventionFilters[ModalJobPage.CONV_FILTER_NIV].list = data;
                                this.db.set('CONV_NIV_LIST', JSON.stringify(data));
                            });
                            self.offersService.getConventionCoefficients(self.convention.id).then(data=> {
                                this.conventionFilters[ModalJobPage.CONV_FILTER_COEF].list = data;
                                this.db.set('CONV_COEF_LIST', JSON.stringify(data));
                            });
                            self.offersService.getConventionEchelon(self.convention.id).then(data=> {
                                this.conventionFilters[ModalJobPage.CONV_FILTER_ECH].list = data;
                                this.db.set('CONV_ECH_LIST', JSON.stringify(data));
                            });
                            self.offersService.getConventionCategory(self.convention.id).then(data=> {
                                this.conventionFilters[ModalJobPage.CONV_FILTER_CAT].list = data;
                                this.db.set('CONV_CAT_LIST', JSON.stringify(data));
                            });
                            self.offersService.getConventionParameters(self.convention.id).then(data=> {
                                self.parametersConvention = data;
                                self.checkHourRate();
                            });
                            self.offersService.getHoursCategories(self.convention.id).then(data=> {
                                self.categoriesHeure = data;
                            });
                            self.offersService.getHoursMajoration(self.convention.id).then(data=> {
                                self.majorationsHeure = data;
                            });
                            self.offersService.getIndemnites(self.convention.id).then(data=> {
                                self.indemnites = data;
                            });

                        }
                    });
                }
            }
        });

        // Set local variables
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.platform = platform;

        // Modal traitement:
        this.viewCtrl = viewCtrl;
        this.jobForm = fb.group({
            sector: ['', Validators.required],
            job: ['', Validators.required]
        });

        this.offerService = os;
        this.initializeJobForm(params);

        this.alertOptions = {
            title: 'Devise',
            subTitle: 'Sélectionner votre devise'
        };

        this.db = new Storage(SqlStorage);


        this.jobList = [];
        this.sectorList = [];
        this.db.get("SECTOR_LIST").then(data => {
            this.sectorList = JSON.parse(data);
        });


        //this.level = 'junior';

        //this.jobData.job = this.jobForm.controls['username'];
        //this.jobData.sector = this.jobForm.controls['password'];
    }


    /**
     * @Description : Initializing job form
     */
    initializeJobForm(params: any) {

        let jobData = params.get('jobData');

        if (jobData) {

            this.jobData = jobData;
        } else {
            this.jobData = {
                'class': "com.vitonjob.callouts.auth.model.JobData",
                job: "",
                sector: "",
                idSector: 0,
                idJob: 0,
                level: 'junior',
                remuneration: null,
                currency: 'euro',
                validated: false
            }
        }
    }


    /**
     * @description : Closing the modal page :
     */
    closeModal() {
        //this.jobData.validated = false;

        this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === '') && !(this.jobData.remuneration <= 0) && !this.isEmpty(this.jobData.remuneration));
        this.viewCtrl.dismiss(this.jobData);
    }

    /**
     * @Author : TEL
     * @Description: Validating the modal page (All fields are filled)
     */
    validateJob() {
        if (this.jobData.idJob == 0 || this.jobData.idSector == 0) {
            let alert = Alert.create({
                title: 'Erreur',
                subTitle: "Veuillez choisir un secteur et un job valides",
                buttons: ['OK']
            });
            this.nav.present(alert);
            return;
        }
        if ((this.jobData.remuneration <= 0) || this.isEmpty(this.jobData.remuneration)) {
            let alert = Alert.create({
                title: 'Erreur',
                subTitle: "Veuillez saisir une rémunération valide",
                buttons: ['OK']
            });
            this.nav.present(alert);
            return;
        }
        this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === '') && !(this.jobData.remuneration <= 0) && !this.isEmpty(this.jobData.remuneration));
        //this.jobData.level = 'senior';
        this.viewCtrl.dismiss(this.jobData);
    }

    /**
     * @Description : loads jobs list
     */
    showJobList() {
        let c = this.jobData.idSector;
        this.db.get("JOB_LIST").then(data => {

            this.jobList = JSON.parse(data);
            this.jobList = this.jobList.filter((v)=> {
                return (v.idsector == c);
            });

            let selectionModel = Modal.create(ModalSelectionPage,
                {type: 'job', items: this.jobList, selection: this});
            this.nav.present(selectionModel);
        });
    }


    /**
     * @Description : loads sector list
     */
    showSectorList() {
        this.db.get("SECTOR_LIST").then(data => {
            this.sectorList = JSON.parse(data);
            let selectionModel = Modal.create(ModalSelectionPage,
                {type: 'secteur', items: this.sectorList, selection: this});
            this.nav.present(selectionModel);
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
        var removeDiacritics = require('diacritics').remove;
        // removeDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ");
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

    sectorSelected(sector) {
        this.isJobFound = true;

        this.jobData.sector = sector.libelle;
        this.jobData.idSector = sector.id;
        this.jobData.job = '';
        this.jobData.idJob = 0;
        this.sectors = [];

        this.db.get("JOB_LIST").then(data => {

            this.jobList = JSON.parse(data);
            this.jobList = this.jobList.filter((v)=> {
                return (v.idsector == sector.id);
            });

        });
    }

    watchJob(e) {
        let val = e.target.value;
        if (val.length < 3) {
            this.isJobFound = true;
            this.jobs = [];
            return;
        }

        this.jobs = [];
        var removeDiacritics = require('diacritics').remove;
        for (let i = 0; i < this.jobList.length; i++) {
            let s = this.jobList[i];
            if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
                this.jobs.push(s);
            }
        }
        if (this.jobs.length == 0) {
            this.isJobFound = false;
        } else {
            this.isJobFound = true;
        }
    }

    /**
     * The job has been selected we will set the offer's job and the conventions data
     * @param job
     */
    jobSelected(job) {
        this.jobData.job = job.libelle;
        this.jobData.idJob = job.id;
        this.jobs = [];

    }

    /**
     * If a collective convention is loaded we need to set the salary to the minimum rate of its parameters
     */
    checkHourRate() {

        if (!this.parametersConvention || this.parametersConvention.length == 0)
            return;

        this.selectedParamConvID = this.parametersConvention[0].id;
        this.minHourRate = this.parametersConvention[0].rate;
        for (let i = 0; i < this.parametersConvention.length; i++) {
            if (this.minHourRate > this.parametersConvention[i].rate) {
                this.selectedParamConvID = this.parametersConvention[i].id;
                this.minHourRate = this.parametersConvention[i].rate;
            }
        }

        this.validateRate(this.jobData.remuneration);
    }

    /**
     *
     * @param rate
     * @returns {boolean}
     */
    validateRate(rate) {
        let r = parseFloat(rate);
        if (r >= this.minHourRate) {
            this.invalidHourRateMessage = '0.00';
            this.invalidHourRate = false;
            return true;
        }

        this.invalidHourRateMessage = (Math.round(this.minHourRate * 100) / 100) + '';
        this.invalidHourRate = true;
        return false;
    }

    /**
     * Display a filtered list of lvl
     * @param e
     */
    // watchConvNiv(e) {
    //     let val = e.target.value;
    //     if (val.length < 2) {
    //         this.isNiveauxConventionsFound = true;
    //         this.niveauxConventions = [];
    //         return;
    //     }
    //
    //     this.niveauxConventions = [];
    //     var removeDiacritics = require('diacritics').remove;
    //     // emoveDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ");
    //     for (let i = 0; i < this.niveauxConventionsList.length; i++) {
    //         let s = this.niveauxConventionsList[i];
    //         if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
    //             this.niveauxConventions.push(s);
    //         }
    //     }
    //
    //     this.isNiveauxConventionsFound = (this.niveauxConventions.length != 0);
    // }

    /**
     * Display a filtered list of lvl
     * @param e
     */
    watchConvFilter(conventionFilter, e) {

        // Check minimum value's length
        let val = e.target.value;
        if (val.length < 2) {
            conventionFilter.isFound = true;
            conventionFilter.filteredList = [];
            return;
        }

        // Set filtered list to display
        conventionFilter.filteredList = [];
        var removeDiacritics = require('diacritics').remove;
        // removeDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ");
        for (let i = 0; i < conventionFilter.list.length; i++) {
            let s = conventionFilter.list[i];
            if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
                conventionFilter.filteredList.push(s);
            }
        }

        // Display error message if no value matches
        conventionFilter.isFound = (conventionFilter.filteredList.length != 0);
    }

    /**
     * Convention level picker
     */
    setConvNivPicker(conventionFilter) {

        if (this.platform.version('android').major >= 5) {
            let picker = Picker.create();
            let options: PickerColumnOption[] = new Array<PickerColumnOption>();

            this.db.get('CONV_' + conventionFilter.name + '_LIST').then(listForPicker => {
                if (listForPicker) {
                    listForPicker = JSON.parse(listForPicker);
                    for (let i = 0; i < listForPicker.length; i++) {
                        options.push({
                            value: listForPicker[i],
                            text: listForPicker[i].libelle
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
                        this.updateHourRateThreshold(conventionFilter, data.undefined.value);
                        conventionFilter.isFound = true;
                    }
                });
                picker.setCssClass('sectorPicker');
                this.nav.present(picker);

            });
        } else {
            /* Android versions 4.x.x */
            this.showConvList(conventionFilter, conventionFilter.labelle);
        }

    }

    /**
     * Modal page to slect convention filter's list
     * @Description : loads sector list
     */
    showConvList(conventionFilter, type) {
        this.db.get('CONV_' + conventionFilter.name + '_LIST').then(data => {
            let selectionModel = Modal.create(
                ModalSelectionPage, {
                    type: type,
                    items: JSON.parse(data),
                    selection: this
                }
            );
            this.nav.present(selectionModel);
        });

    }

    updateHourRateThreshold(conventionFilter: any, obj: any) {

        // Hide error message and close list
        conventionFilter.isFound = true;
        conventionFilter.filteredList = [];


        if (!this.parametersConvention || this.parametersConvention.length == 0)
            return;

        conventionFilter.selected = obj.libelle;

        //  Ensure to take the maximum threshold before checking other options
        for (let i = 0; i < this.parametersConvention.length; i++) {
            if (this.minHourRate <= this.parametersConvention[i].rate) {
                this.selectedParamConvID = this.parametersConvention[i].id;
                this.minHourRate = this.parametersConvention[i].rate;
            }
        }

        //  Now let's seek the suitable parameters
        for (let i = 0; i < this.parametersConvention.length; i++) {

            if (conventionFilter.name == 'CAT' && obj.id > 0 && this.parametersConvention[i].idcat != obj.id)
                continue;
            if (conventionFilter.name == 'COEF' && obj.id > 0 && this.parametersConvention[i].idcoeff != obj.id)
                continue;
            if (conventionFilter.name == 'ECH' && obj.id > 0 && this.parametersConvention[i].idechelon != obj.id)
                continue;
            if (conventionFilter.name == 'NIV' && obj.id > 0 && this.parametersConvention[i].idniv != obj.id)
                continue;

            if (this.minHourRate > this.parametersConvention[i].rate) {
                this.selectedParamConvID = this.parametersConvention[i].id;
                this.minHourRate = this.parametersConvention[i].rate;
            }
        }

        this.validateRate(this.jobData.remuneration);
    }

    convParametersVisible() {
        if (!this.parametersConvention || this.parametersConvention.length == 0
            || !this.jobData.remuneration || this.jobData.remuneration == 0)
            return false;
        return true;
    }

    /**
     * Sectors picker
     */
    setSectorsPicker() {

        if (this.platform.version('android').major >= 5) {
            let picker = Picker.create();
            let options: PickerColumnOption[] = new Array<PickerColumnOption>();

            this.db.get('SECTOR_LIST').then(listSectors => {
                if (listSectors) {
                    listSectors = JSON.parse(listSectors);
                    for (let i = 0; i < listSectors.length; i++) {
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
                        this.jobData.sector = data.undefined.text;
                        this.jobData.idSector = data.undefined.value;
                        this.filterJobList();
                        this.jobData.job = '';
                        this.jobData.idJob = 0;
                    }
                });
                picker.setCssClass('sectorPicker');
                this.nav.present(picker);

            });
        } else {
            /* Android versions 4.x.x */
            this.showSectorList();
        }

    }

    filterJobList() {

        this.db.get('JOB_LIST').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.jobData.idSector;

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

    /**
     * Sectors picker
     */
    setJobsPicker() {

        let picker = Picker.create();
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();
        if (this.platform.version('android').major >= 5) {
            this.db.get('JOB_LIST').then(
                list => {
                    if (list) {
                        list = JSON.parse(list);
                        let q = this.jobData.idSector;

                        // if the value is an empty string don't filter the items
                        if (!(q === '')) {
                            list = list.filter((v) => {
                                return (v.idsector == q);
                            });
                        }

                        this.listJobs = list;
                        this.jobList = list;
                        for (let i = 0; i < this.listJobs.length; i++) {
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
                                this.jobData.job = data.undefined.text;
                                this.jobData.idJob = data.undefined.value;
                                /*this.enterpriseCard.offer.job = data.undefined.text;
                                 this.enterpriseCard.offer.idJob = data.undefined.value;*/
                            }
                        });
                        picker.setCssClass('jobPicker');
                        this.nav.present(picker);

                    }
                }
            );

        } else {
            /* Android versions 4.x.x */
            this
                .showJobList();
        }


    }

    presentPopover(ev, type) {

        let popover = Popover.create(PopoverAutocompletePage, {
            list: (type === 'secteur') ? this.listSectors : this.listJobs,
            type: type,
            idSector: this.jobData.idSector
        });
        this.nav.present(popover, {
            ev: ev
        });

        popover.onDismiss(data => {
            if (data) {

                if (type === 'secteur') {
                    this.jobData.sector = data.libelle;
                    this.jobData.idSector = data.id;
                    this.filterJobList();
                    this.jobData.job = '';
                    this.jobData.idJob = 0;
                } else if (type === 'job') {
                    this.jobData.job = data.libelle;
                    this.jobData.idJob = data.id ? data.id : 0;
                }
            }
        });

    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}
