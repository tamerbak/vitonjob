import {
    NavController, ViewController, Modal, NavParams, Storage, SqlStorage, PickerColumnOption,
    Picker, Popover, Alert, Platform
} from 'ionic-angular';
import {FormBuilder, Validators} from "@angular/common";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Component} from "@angular/core";
import {PopoverAutocompletePage} from "../popover-autocomplete/popover-autocomplete";

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

    public jobData:{
        'class':"com.vitonjob.callouts.auth.model.JobData",
        idJob:string,
        job:number,
        idSector:number,
        sector:string,
        level:string,
        remuneration:number,
        currency:string,
        validated:boolean
    };
    offerService:any;
    db:Storage;
    sectors:any = [];
    jobs:any = [];
    platform:any;
	isSectorFound = true;
	isJobFound = true;


    constructor(public nav:NavController,
                viewCtrl:ViewController,
                fb:FormBuilder,
                gc:GlobalConfigs,
                os:OffersService,
                params:NavParams, platform:Platform) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.platform = platform;
        console.log(this.platform.version);
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

        this.currency = "euro";

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
    initializeJobForm(params:any) {

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

        this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === '') && !(this.jobData.remuneration == 0));
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
        this.jobData.validated = ( !(this.jobData.job === '') && !(this.jobData.sector === '') && !(this.jobData.remuneration == 0));
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
            console.log(JSON.stringify(this.jobList));
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
		//console.log(removeDiacritics("Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ"));
		for (let i = 0; i < this.sectorList.length; i++) {
			let s = this.sectorList[i];
			if (removeDiacritics(s.libelle).toLocaleLowerCase().indexOf(removeDiacritics(val).toLocaleLowerCase()) > -1) {
				this.sectors.push(s);
			}
		}
		if(this.sectors.length == 0){
			this.isSectorFound = false;
		}else{
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
		if(this.jobs.length == 0){
			this.isJobFound = false;
		}else{
			this.isJobFound = true;
		}
    }

    jobSelected(job) {
        this.jobData.job = job.libelle;
        this.jobData.idJob = job.id;
        this.jobs = [];

    }


    /**
     * Sectors picker
     */
    setSectorsPicker() {

        if (this.platform.version('android').major >= 5) {
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
        let options:PickerColumnOption[] = new Array<PickerColumnOption>();
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
}
