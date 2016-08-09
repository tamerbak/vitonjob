import {Component} from '@angular/core';
import {Alert, NavController, NavParams, Loading, Events, Modal, Platform} from 'ionic-angular';
import {LoadListService} from "../../providers/load-list.service";
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SqlStorageService} from "../../providers/sql-storage.service";
import {PersonalAddressPage} from "../personal-address/personal-address";
import {AuthenticationService} from "../../providers/authentication.service";
import {Storage, SqlStorage} from 'ionic-angular';
import {GlobalService} from "../../providers/global.service";
import {Camera, DatePicker} from 'ionic-native';
import {NgZone} from '@angular/core';
import {CommunesService} from "../../providers/communes-service/communes-service";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {HomePage} from "../home/home";
import {AttachementsService} from "../../providers/attachements-service/attachements-service";
import {MedecineService} from "../../providers/medecine-service/medecine-service";
import {ProfileService} from "../../providers/profile-service/profile-service";

/**
 * @author Amal ROCHD
 * @description update civility information
 * @module Authentication
 */
@Component({
    templateUrl: 'build/pages/civility/civility.html',
    providers: [GlobalConfigs, LoadListService, SqlStorageService, AuthenticationService, GlobalService, CommunesService, AttachementsService, MedecineService, ProfileService]
})
export class CivilityPage {
    //tabs:Tabs;
    title:string;
    lastname:string;
    firstname:string;
    birthdate;
    birthplace:string;
    cni:string;
    numSS:string;
    nationality;
    nationalities = [];
    currentUser;
    companyname:string;
    siret:string;
    ape:string;
    scanUri:string;
    scanTitle:string;
    titlePage:string;
    isAPEValid = true;
    isSIRETValid = true;
    fromPage:string;
    communes:any = [];
    selectedCommune:any;
    communesService:CommunesService;
    numSSMessage:string = '';
    checkSS:boolean = false;
    uploadVerb = "Charger un scan ";
    isRecruiter = false;
    medecineTravail:any;
    medecineId:number;
    medecines:any = [];
    currentUserVar:string;
    isValideLastName:boolean = true;
    isValideFirstName:boolean = true;
    titlestyle:any;
    nationalitiesstyle:any;
    calendarTheme:string;
    isAndroid4:boolean;
    platform: any;

    /**
     * @description While constructing the view, we load the list of nationalities, and get the currentUser passed as parameter from the connection page, and initiate the form with the already logged user
     */
    constructor(public nav:NavController,
                private authService:AuthenticationService,
                public gc:GlobalConfigs,
                private loadListService:LoadListService,
                private sqlStorageService:SqlStorageService,
                params:NavParams,
                private globalService:GlobalService,
                private zone:NgZone,
                public events:Events,
                private attachementService:AttachementsService,
                private medecineService:MedecineService,
                communesService:CommunesService,
                platform:Platform,
				private profileService: ProfileService) {
        // Set global configs
        // Get target to determine configs

        this.projectTarget = gc.getProjectTarget();
        this.storage = new Storage(SqlStorage);

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set local variables and messages
        this.themeColor = config.themeColor;
        this.currentUserVar = config.currentUserVar;
        this.isEmployer = (this.projectTarget == 'employer');
        this.calendarTheme = config.calendarTheme;
        this.isAndroid4 = (platform.version('android').major < 5);
        this.platform = platform;
        //this.tabs=tabs;
        this.params = params;
        this.currentUser = this.params.data.currentUser;
        this.isRecruiter = this.currentUser.estRecruteur;
        this.fromPage = this.params.data.fromPage;
        this.titlePage = this.isEmployer ? "Fiche de l'entreprise" : "Profil";
        //load nationality list
        if (!this.isEmployer && !this.isRecruiter) {
            this.loadListService.loadNationalities(this.projectTarget).then((data) => {
                this.nationalities = data.data;
                //initialize nationality with (9 = francais)
                this.nationality = 9;
                this.scanTitle = " de votre CNI";
            });
        } else {
            this.scanTitle = " de votre extrait k-bis";
        }

        this.communesService = communesService;
        this.selectedCommune = {
            id: 0,
            nom: '',
            code_insee: ''
        };
    }

    watchBirthPlace(e) {

        let val = e.target.value;
        if (val.length < 3) {
            this.communes = [];
            return;
        }
        console.log(val);
        this.communes = [];
        this.communesService.getCommunes(val).then(data=> {
            this.communes = data;
            console.log(JSON.stringify(this.communes));
        });
    }

    communeSelected(commune) {
        this.birthplace = commune.nom;
        this.selectedCommune = commune;
        this.communes = [];
    }

    ionViewDidEnter() {
        //in case of user has already signed up
        this.initCivilityForm();
    }

    titleChange() {
        if (this.title) {
            this.titlestyle = {
                'font-size': '1.4rem'
            }
        }
        else {
            this.titlestyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
        }
    }

    /**
     * @description initiate the civility form with the data of the logged user
     */
    initCivilityForm() {
        this.storage.get(this.currentUserVar).then((value) => {
            if (value && value != "null") {
                this.currentUser = JSON.parse(value);
                this.title = this.currentUser.titre;
                if (this.title) this.titlestyle = { 'font-size': '1.4rem' };
                else this.titlestyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
                this.lastname = this.currentUser.nom;
                this.firstname = this.currentUser.prenom;
                if (!this.isRecruiter && this.isEmployer && this.currentUser.employer.entreprises.length != 0) {
                    this.companyname = this.currentUser.employer.entreprises[0].nom;
                    this.siret = this.currentUser.employer.entreprises[0].siret;
                    this.ape = this.currentUser.employer.entreprises[0].naf;
                    this.medecineService.getMedecine(this.currentUser.employer.entreprises[0].id).then(data=> {
                        if (data && data != null) {
                            this.medecineId = data.id;
                            this.medecineTravail = data.libelle;
                        }

                    });
                } else {
                    if (!this.isRecruiter) {
                        //
                        if (this.currentUser.jobyer.dateNaissance) {
                            if (this.platform.version('android').major < 5) {
                                this.birthdate = new Date(this.currentUser.jobyer.dateNaissance).toLocaleDateString('fr-FR');
                            } else {
                                this.birthdate = new Date(this.currentUser.jobyer.dateNaissance).toISOString();
                            }
                        } else {
                            this.birthdate = "";
                        }
                        //this.birthdate = this.currentUser.jobyer.dateNaissance ?  : "";
                        this.birthplace = this.currentUser.jobyer.lieuNaissance;
                        this.cni = this.currentUser.jobyer.cni;
                        this.numSS = this.currentUser.jobyer.numSS;
                        this.nationality = this.currentUser.jobyer.natId;
                        if (this.nationality) this.nationalitiesstyle = {'font-size': '1.4rem'};
                        else this.nationalitiesstyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
                    }
                }
                if (!this.isRecruiter) {
                    if (this.currentUser.scanUploaded) {
                        this.uploadVerb = "Recharger un scan "
                    } else {
                        this.uploadVerb = "Charger un scan "
                    }
                }
            }

            if (this.birthplace && this.birthplace != 'null' && !this.isRecruiter) {
                this.communesService.getCommunes(this.birthplace).then(data => {

                    if (data && data.length > 0) {
                        this.selectedCommune = data[0];
                    }
                    this.checkSS = true;
                });
            } else
                this.checkSS = true;
        });
    }

    checkGender() {
        let indicator = this.numSS.charAt(0);
        if ((indicator == '1' && this.title == 'M.') || (indicator == '2' && this.title != 'M.'))
            return true;
        else
            return false;
    }

    checkBirthYear() {
        let indicator = this.numSS.charAt(1) + this.numSS.charAt(2);
        //
        let birthYear = (this.platform.version('android').major < 5 ) ? this.birthdate.split('/')[2] : this.birthdate.split('-')[0];
        birthYear = birthYear.substr(2);
        if (indicator == birthYear)
            return true;
        else
            return false;
    }

    checkBirthMonth() {
        let indicator = this.numSS.charAt(3) + this.numSS.charAt(4);
        //
        let birthMonth = (this.platform.version('android').major < 5 ) ? this.birthdate.split('/')[1] : this.birthdate.split('-')[1];
        if (birthMonth.length == 1)
            birthMonth = "0" + birthMonth;
        if (indicator == birthMonth)
            return true;
        else
            return false;
    }

    checkINSEE() {
        let indicator = this.numSS.substr(5, 5);
        if (this.selectedCommune.id != '0') {
            if (indicator != this.selectedCommune.code_insee)
                return false;
            else
                return true;
        }
        if (indicator.charAt(0) != '9')
            return false;
        else
            return true;
    }

    checkModKey() {
        try {
            let indicator = this.numSS.substr(0, 13);
            let key = this.numSS.substr(13);
            let number = parseInt(indicator);
            let nkey = parseInt(key);
            let modulo = number % 97;
            if (nkey == 97 - modulo)
                return true;
            else
                return false;
        }
        catch (err) {
            return false;
        }

    }

    /**
     * @description update civility information for employer and jobyer
     */
    updateCivility() {
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide'
        });
        this.nav.present(loading);
		if (this.isRecruiter) {
            this.authService.updateRecruiterCivility(this.title, this.lastname, this.firstname, this.currentUser.id).then((data) => {
                if (!data || data.status == "failure") {
                    console.log(data.error);
                    loading.dismiss();
                    this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
                    return;
                } else {
                    // data saved
                    console.log("response update civility : " + data.status);
                    this.currentUser.titre = this.title;
                    this.currentUser.nom = this.lastname;
                    this.currentUser.prenom = this.firstname;
                    this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
                    this.events.publish('user:civility', this.currentUser);
                    loading.dismiss();
                    if (this.fromPage == "profil") {
                        this.nav.pop();
                    }
                }
            });
            return;
        }
        if (this.isEmployer) {
            //get the role id
			var employerId = this.currentUser.employer.id;
			//get entreprise id of the current employer
			var entrepriseId = this.currentUser.employer.entreprises[0].id;
			// update employer
			this.authService.updateEmployerCivility(this.title, this.lastname, this.firstname, this.companyname, this.siret, this.ape, employerId, entrepriseId, this.projectTarget, this.medecineId).then((data) => {
				if (!data || data.status == "failure") {
					console.log(data.error);
					loading.dismiss();
					this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
					return;
				} else {
					// data saved
					console.log("response update civility : " + data.status);
					this.currentUser.titre = this.title;
					this.currentUser.nom = this.lastname;
					this.currentUser.prenom = this.firstname;
					this.currentUser.employer.entreprises[0].nom = this.companyname;
					this.currentUser.employer.entreprises[0].siret = this.siret;
					this.currentUser.employer.entreprises[0].naf = this.ape;
					//upload scan
					this.updateScan(employerId);
					// PUT IN SESSION
					this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
					this.events.publish('user:civility', this.currentUser);
					loading.dismiss();
					if (this.fromPage == "profil") {
						this.nav.pop();
					} else {
						//redirecting to personal address tab
						//this.tabs.select(1);
						this.nav.push(PersonalAddressPage);
					}
				}
			});
        } else {
            if (!this.isRecruiter) {
                //get the role id
                var jobyerId = this.currentUser.jobyer.id;
                // update jobyer
                this.authService.updateJobyerCivility(this.title, this.lastname, this.firstname, this.numSS, this.cni, this.nationality, jobyerId, this.birthdate, this.birthplace).then((data) => {
                    if (!data || data.status == "failure") {
                        console.log(data.error);
                        loading.dismiss();
                        this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
                        return;
                    } else {
                        // data saved
                        console.log("response update civility : " + data.status);
                        this.currentUser.titre = this.title;
                        this.currentUser.nom = this.lastname;
                        this.currentUser.prenom = this.firstname;
                        this.currentUser.jobyer.cni = this.cni;
                        this.currentUser.jobyer.numSS = this.numSS;
                        this.currentUser.jobyer.natId = this.nationality;
                        //this.currentUser.jobyer.natLibelle = this.nationality;
                        //
                        if (this.platform.version('android').major < 5) {
                            let birth = new Date (this.birthdate.split('/')[1] + '-' +
                                this.birthdate.split('/')[0] + '-' +
                                this.birthdate.split('/')[2]);
                            this.currentUser.jobyer.dateNaissance = birth.toISOString();

                        } else {
                            this.currentUser.jobyer.dateNaissance = this.birthdate;
                        }
                        this.currentUser.jobyer.lieuNaissance = this.birthplace;
                        //upload scan
                        this.updateScan(jobyerId);
                        // PUT IN SESSION
                        this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
                        this.events.publish('user:civility', this.currentUser);
                        loading.dismiss();
                        if (this.fromPage == "profil") {
                            this.nav.pop();
                        } else {
                            //redirecting to personal address tab
                            //this.tabs.select(1);
                            this.nav.push(PersonalAddressPage);
                        }
                    }
                });
            }
        }
    }

    /**
     * @description upload scan and attach ot to the current user
     */
    updateScan(userId) {
        if (this.scanUri) {
            this.currentUser.scanUploaded = true;
            this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
            this.authService.uploadScan(this.scanUri, userId, 'scan', 'upload')
                .then((data) => {
                    if (!data || data.status == "failure") {
                        console.log("Scan upload failed !");
                        //this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde du scan");
                        this.currentUser.scanUploaded = false;
                        this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
                    }
                    else {
                        console.log("Scan uploaded !");
                    }

                });
            this.storage.get(this.currentUserVar).then(usr => {
                if (usr) {
                    let user = JSON.parse(usr);
                    this.attachementService.uploadFile(user, 'scan ' + this.scanTitle, this.scanUri);
                }
            });

        }
    }

    /**
     * @description function called to decide if the validate button should be disabled or not
     */
    isUpdateDisabled() {
        if (this.isRecruiter) {
            return (!this.title || !this.firstname || !this.lastname);
        }
        if (this.isEmployer) {
            return (!this.title || !this.firstname || !this.lastname || !this.companyname || (this.siret && this.siret.length < 17) || (this.ape && (this.ape.length < 5 || !this.isAPEValid)) || !this.isValideFirstName || !this.isValideLastName);
        } else {
            if ((!this.title || !this.firstname || !this.lastname || (this.cni && this.cni.length != 12 && this.cni.length != 0) || (this.numSS && this.numSS.length != 15 && this.numSS.length != 0) || !this.isValideFirstName || !this.isValideLastName )) {
                return true;
            }
            if (!this.numSS || this.numSS.length == 0)
                return false;
            if (!this.checkGender() || !this.checkBirthYear() || !this.checkBirthMonth() || !this.checkINSEE() || !this.checkModKey()) {
                return true;
            }
            return false;
        }
    }

    /**
     * @description watch and validate the "num de sécurité social" field
     */
    watchNumSS(e) {
        if (this.isEmployer)
            return;
        var s = e.target.value;
        if (s.length > 15) {
            s = s.substring(0, 15);
            e.target.value = s;
			this.numSS = e.target.value;
            return;
        }
        if (s.indexOf('.') != -1) {
            s = s.replace('.', '');
            e.target.value = s;
			this.numSS = e.target.value;
            return;
        }
        if (e.keyCode < 48 || e.keyCode > 57) {
            e.preventDefault();
            return;
        }
        if (!this.numSS) {
            return;
        }
    }

    /**
     * @description watch and validate the cni field
     */
    watchCNI(e) {
        var s = e.target.value;
        if (s.length > 12) {
            s = s.substring(0, 12);
            e.target.value = s;
			this.cni = e.target.value;
            return;
        }
        if (s.indexOf('.') != -1) {
            s = s.replace('.', '');
            e.target.value = s;
            this.cni = e.target.value;
            return;
        }
        /*if (e.keyCode < 48 || e.keyCode > 57) {
            e.preventDefault();
            return;
        }*/
    }

    /**
     * @description watch and validate the siret field
     */
    watchSIRET(e) {
        var s = e.target.value;
        if (s.length != 17) {
            this.isSIRETValid = false;
        }
        if (e.keyCode == 8) {
            e.preventDefault();
            return;
        }
        for (var i = 0; i < s.length; i++) {
            if (i == 3 || i == 7 || i == 11) {
                if (s[i] != ' ') {
                    s = s.replace(s[i], ' ');
                }
                continue;
            }
            if (!this.isNumeric(s[i])) {
                s = s.replace(s[i], '');
            }
        }
        if (s.length == 3) {
            s = s + " ";
        }
        if (s.length == 7) {
            s = s + " ";
        }
        if (s.length == 11) {
            s = s + " ";
        }
        e.target.value = s;

        if (s.length == 17) {
            this.isSIRETValid = true;
        }
    }

    /**
     * @description watch and validate the ape or naf field
     */
    watchAPE(e) {
        //var s = this.ape;
        var s = e.target.value;
        //this is not woring on android, because of the predective text
        /*s = s.substring(0, 5);
         for(var i = 0; i < s.length; i++){
         if(i < 4 && !this.isNumeric(s[i])){
         s = s.replace(s[i], '');
         continue;
         }
         if(i == 4 && !this.isLetter(s[i])){
         s = s.replace(s[i], '');
         continue;
         }
         }*/
        //check if ape valid
        if (this.isNumeric(s.substring(0, 4)) && this.isLetter(s.substring(4, 5)) && s.length == 5) {
            e.target.value = this.changeToUppercase(s);
            this.isAPEValid = true;
        } else {
            this.isAPEValid = false;
        }

    }

    watchLastName(e) {
        let name = e.target.value;
        this.isValideLastName = CivilityPage.isValidName(name);
    }

    watchFirstName(e) {
        let name = e.target.value;
        this.isValideFirstName = CivilityPage.isValidName(name);
    }

    static isValidName(name:string) {
        let regEx = /^[A-Za-zÀ-ú.' \-\p{L}\p{Zs}\p{Lu}\p{Ll}']+$/;
        return name.match(regEx);
    }

    isNumeric(n) {
        var numbers = /^[0-9]+$/;
        if (n.match(numbers)) {
            return true;
        }
        else {
            return false;
        }
    }

    isLetter(s) {
        var letters = /^[A-Za-z]+$/;
        if (s.match(letters)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * @description change the ape data to uppercase
     */
    changeToUppercase(s) {
        return s.toUpperCase();
    }

    /**
     * @description show error msg for cni field
     */
    showCNIError() {
        if (this.cni && this.cni.length < 12) {
            return true;
        }
    }

    /**
     * @description show error msg for num ss field
     */
    showNSSError() {
        if (this.isEmployer)
            return false;
        if (!this.checkSS)
            return false;
        if (this.numSS && this.numSS.length == 0)
            return false;

        if (!this.numSS || this.numSS.length != 15) {
            this.numSSMessage = '* Saisissez les 15 chiffres du n° NIR';
            return true;
        }

        
        let correct = this.checkGender();
        if (!correct) {
            this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
            return true;
        }
        correct = this.checkBirthYear();
        if (!correct) {
            this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
            return true;
        }
        correct = this.checkBirthMonth();
        if (!correct) {
            this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
            return true;
        }
        correct = this.checkINSEE();
        if (!correct) {
            this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
            return true;
        }
        correct = this.checkModKey();
        if (!correct) {
            this.numSSMessage = '* Le numéro de sécurité sociale renseigné ne correspond pas aux informations personnelles';
            return true;
        }
        return false;
    }

    /**
     * @description read the file to upload and convert it to base64
     */
    onChangeUpload(e) {
        var file = e.target.files[0];
        var myReader = new FileReader();
        this.zone.run(()=> {
            myReader.onloadend = (e) => {
                this.scanUri = myReader.result;
            }
            myReader.readAsDataURL(file);
        });
    }

    /**
     * @description trigged when the user take a picture of the scan, the image taken is base64
     */
    takePicture() {
        Camera.getPicture({
            destinationType: Camera.DestinationType.DATA_URL,
            targetWidth: 1000,
            targetHeight: 1000
        }).then((imageData) => {
            this.zone.run(()=> {
                // imageData is a base64 encoded string
                this.scanUri = "data:image/jpeg;base64," + imageData;
            });
        }, (err) => {
            console.log(err);
        });
    }

    /**
     * @description change the title of the scan buttton according to the selected nationality
     */
    onChangeNationality(e) {

        if (this.nationality) {
            this.nationalitiesstyle = {
                'font-size': '1.4rem'
            }
        }
        else {
            this.nationalitiesstyle = {'font-size': '2rem', 'position': 'absolute', 'top': '0.2em'};
        }
        if (this.nationality == 9)
            this.scanTitle = " de votre CNI";
        else
            this.scanTitle = " de votre autorisation de travail";
    }


    /**
     * @description remove data to scanUri
     */
    onDelete(e) {
        this.scanUri = null;
        var fileinput = document.getElementById('fileinput');
        fileinput.value = "";
    }

    /**
     * @description show modal
     */
    showModal() {
        let modal = Modal.create(ModalGalleryPage, {scanUri: this.scanUri});
        this.nav.present(modal);
    }

    watchMedecineTravail(e) {

        let val = e.target.value;
        if (val.length < 3) {
            this.medecines = [];
            return;
        }
        console.log(val);
        this.medecines = [];
        this.medecineService.autocomplete(val).then(data=> {
            this.medecines = data;
            console.log(JSON.stringify(this.medecines));
        });
    }

    medecineSelected(c) {
        this.medecineId = c.id;
        this.medecineTravail = c.libelle;
        this.medecines = [];
    }

    /**
     * launching dateTimePicker component for slot selection
     */
    launchDateTimePicker(type, flag) {

        DatePicker.show({
            date: new Date(),
            mode: type,
            minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour: true,
            allowOldDates: false, doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
        }).then(
            date => {
                console.log("Got date: ", date);

                switch (flag) {
                    case 'start' :
                        this.slot.startHour = date.getHours() * 60 + date.getMinutes();
                        this.showedSlot.startHour = this.toHourString(this.slot.startHour);
                        break;
                    case 'end' :
                        this.slot.endHour = date.getHours() * 60 + date.getMinutes();
                        this.showedSlot.endHour = this.toHourString(this.slot.endHour);
                        break;
                    default :
                        this.slot.date = date.getTime();
                        this.showedSlot.date = this.toDateString(this.slot.date.getTime(), '');
                        this.showedSlot.angular4Date = this.toDateString(this.slot.date.getTime(), '');
                        break;
                }
            },
            err => console.log("Error occurred while getting date:", err)
        );
    }
	
	watchCompanyname(e){
		//verify if company name exists
		this.profileService.countEntreprisesByRaisonSocial(this.companyname).then(data => {
			if(data.data[0].count != 0 && this.companyname != this.currentUser.employer.entreprises[0].nom){
				if (!this.isEmpty(this.currentUser.employer.entreprises[0].nom)) {
					this.globalService.showAlertValidation("VitOnJob", "L'entreprise " + this.companyname + " existe déjà. Veuillez saisir une autre raison sociale.");
					this.companyname = this.currentUser.employer.entreprises[0].nom;
				}else{
					this.displayCompanynameAlert();
				}
			}else{
				return;
			}	
		})
	}
	
	displayCompanynameAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "L'entreprise " + this.companyname + " existe déjà. Si vous continuez, ce compte sera bloqué, \n sinon veuillez saisir une autre raison sociale. \n Voulez vous continuez?",
			buttons: [
				{
					text: 'Non',
					handler: () => {
						this.companyname = this.currentUser.employer.entreprises[0].nom;
						console.log('No clicked');
					}
				},
				{
					text: 'Oui',
					handler: () => {
						console.log('Yes clicked');	
						confirm.dismiss().then(() => {
							this.displayCompanynameLastAlert();	
						})
					}
				}
			]
		});
		this.nav.present(confirm);
	}
	
	displayCompanynameLastAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Votre compte sera bloqué. \n Voulez vous vraiment continuez?",
			buttons: [
				{
					text: 'Non',
					handler: () => {
						this.companyname = this.currentUser.employer.entreprises[0].nom;
						console.log('No clicked');
					}
				},
				{
					text: 'Oui',
					handler: () => {
						console.log('Yes clicked');	
						confirm.dismiss().then(() => {
							this.profileService.deleteEmployerAccount(this.currentUser.id, this.currentUser.employer.id).then(data => {
								this.storage.set(this.currentUserVar, null);
								this.storage.set("RECRUITER_LIST", null);
								this.events.publish('user:logout');
								this.nav.setRoot(HomePage);
							});	
						})
					}
				}
			]
		});
		this.nav.present(confirm);
	}

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date
     * @param options Date options
     */
    toDateString(date:number, options:any) {
        let d = new Date(date);
        return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
    }
	
	isEmpty(str){
		if(str == '' || str == 'null' || !str)
			return true;
		else
			return false;
	}
}
