import {Page, Alert, NavController, NavParams, Tabs} from 'ionic-angular';
import {LoadListService} from "../../providers/load-list.service";
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SqlStorageService} from "../../providers/sql-storage.service";
import {PersonalAddress} from "../personal-address/personal-address";
import {AuthenticationService} from "../../providers/authentication.service";
import {MaskDirective} from '../../directives/mask.directive';
import {Storage, SqlStorage} from 'ionic-angular';
import {GlobalService} from "../../providers/global.service";
import {Camera} from 'ionic-native';

/**
	* @author Amal ROCHD
	* @description update civility information
	* @module Authentication
*/
@Page({
	templateUrl: 'build/pages/civility/civility.html',
	directives: [MaskDirective],
	providers: [GlobalConfigs, LoadListService, SqlStorageService, AuthenticationService, GlobalService]
})
export class CivilityPage {
	tabs:Tabs;
	title: string;
	lastname: string;
	firstname: string;
	birthdate;
	birthplace: string;
	cni: string;
	numSS: string;
	nationality;
	nationalities = [];
	currentUser;
	companyname: string;
	siret: string;
	ape:string;
	scanUri: string;
	scanTitle: string;
	
	/**
		* @description While constructing the view, we load the list of nationalities, and get the currentUser passed as parameter from the connection page
	*/
	constructor(public nav: NavController, private authService: AuthenticationService,
	public gc: GlobalConfigs, private loadListService: LoadListService, private sqlStorageService: SqlStorageService, tabs:Tabs, params: NavParams, private globalService: GlobalService) {
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		this.storage = new Storage(SqlStorage);
		
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		
		// Set local variables and messages
		this.themeColor = config.themeColor;
		this.isEmployer = (this.projectTarget == 'employer');
		this.tabs=tabs;
		this.params = params;
		this.currentUser = this.params.data.currentUser;
		
		//load nationality list
		if(!this.isEmployer){
			this.loadListService.loadNationalities(this.projectTarget).then((data) => {
				this.nationalities = data.data;
				//initialize nationality with (9 = francais)
				this.nationality = 9;
				this.scanTitle = " de votre CNI";
			});
		}else{
			this.scanTitle = " de votre extrait k-bis";
		}
	}
	/**
		* @description update civility information for employer and jobyer
	*/
	updateCivility(){
		if(this.isEmployer){
			//get the role id
			var employerId = this.currentUser.employer.id;
			//get entreprise id of the current employer
			var entrepriseId = this.currentUser.employer.entreprises[0].id;
			// update employer
			this.authService.updateEmployerCivility(this.title, this.lastname, this.firstname, this.companyname, this.siret, this.ape, employerId, entrepriseId, this.projectTarget)
			.then((data) => {
				if (!data || data.status == "failure") {
					console.log(data.error);
					this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
					return;
					}else{
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
					this.storage.set('currentUser', this.currentUser);
					//redirecting to personal address tab
					this.tabs.select(1);
				}
			});
			}else{
			//get the role id
			var jobyerId = this.currentUser.jobyer.id;
			// update jobyer
			this.authService.updateJobyerCivility(this.title, this.lastname, this.firstname, this.numSS, this.cni, this.nationality, jobyerId, this.birthdate, this.birthplace, this.projectTarget)
			.then((data) => {
				if (!data || data.status == "failure") {
					console.log(data.error);
					this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
					return;
					}else{
					// data saved
					console.log("response update civility : " + data.status);
					this.currentUser.titre = this.title;
					this.currentUser.nom = this.lastname;
					this.currentUser.prenom = this.firstname;
					this.currentUser.jobyer.cni = this.cni;
					this.currentUser.jobyer.numSS = this.numSS;
					this.currentUser.jobyer.natId = this.nationality;
					this.currentUser.jobyer.dateNaissance = this.birthdate;
					this.currentUser.jobyer.lieuNaissance = this.birthplace;
					//upload scan
					this.updateScan(jobyerId);
					// PUT IN SESSION
					this.storage.set('currentUser', this.currentUser);
					//redirecting to personal address tab
					this.tabs.select(1);
				}
			});
		}
		
	}
	
	updateScan(userId){
		if (this.scanUri) {
			this.authService.uploadScan(this.scanUri, userId, 'scan', 'upload')
			.then((data) => {
				if(!data || data.status == "failure"){
					console.log("Scan upload failed !");
					this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde du scan");
				}
				else{
					console.log("Scan uploaded !");
					//this.currentUser.employer.scan = this.scanUri;
				}
			});
		}
	}
	
	/**
		* @description function called to decide if the validate button should be disabled or not
	*/
	isUpdateDisabled(){
		if(!this.isEmployer){
			return (!this.title || !this.firstname || !this.lastname || !this.cni || this.cni.length < 12 || !this.numSS || this.numSS.length < 21 || !this.nationality || !this.birthplace || !this.birthdate)
		}
		else{
			return (!this.title || !this.firstname || !this.lastname || !this.companyname || !this.siret || !this.ape)
		}	
	}
	
	watchNumSS(e){
		if (e.keyCode < 48 || e.keyCode > 57){
			e.preventDefault();
			return;
		}
		if(!this.numSS){
			return;
		}
		if(this.numSS.length == 1){
			this.numSS = this.numSS + " ";
		}
		if(this.numSS.length == 4){
			this.numSS = this.numSS + " ";
		}
		if(this.numSS.length == 7){
			this.numSS = this.numSS + " ";
		}
		if(this.numSS.length == 10){
			this.numSS = this.numSS + " ";
		}
		if(this.numSS.length == 14){
			this.numSS = this.numSS + " ";
		}
		if(this.numSS.length == 18){
			this.numSS = this.numSS + " ";
		}
	}
	
	watchCNI(e){
		if (e.keyCode < 48 || e.keyCode > 57){
			e.preventDefault();
			return;
		}
	}
	
	watchSIRET(e){
		if (e.keyCode < 48 || e.keyCode > 57){
			e.preventDefault();
			return;
		}
		if(!this.siret){
			return;
		}
		if(this.siret.length == 3){
			this.siret = this.siret + " ";
		}
		if(this.siret.length == 7){
			this.siret = this.siret + " ";
		}
		if(this.siret.length == 11){
			this.siret = this.siret + " ";
		}
	}
	
	watchAPE(e){
		//if first characte is string, prevent
		if(!this.ape){
			if (e.keyCode < 48 || e.keyCode > 57){
				e.preventDefault();
			}
			return;
		}
		if(this.ape.length < 4){
			if (e.keyCode < 48 || e.keyCode > 57){
				e.preventDefault();
				return;
			}	
		}
		if(this.ape.length == 4){
			if (e.keyCode >= 48 && e.keyCode <= 57){
				e.preventDefault();
				return;
			}	
		}
	}
	
	changeToUppercase(){
		if(this.ape){
			this.ape = this.ape.toUpperCase();
		}
	}
	
	showCNIError(){
		if(this.cni && this.cni.length < 12){
			return true;
		}
	}
	
	showNSSError(){
		if(this.numSS && this.numSS.length < 21){
			return true;
		}
	}
	
	onChangeUpload(e){
		var file = e.srcElement.files[0];
		var myReader = new FileReader();
		myReader.onloadend = (e) =>{
			this.scanUri = myReader.result;
		}
		myReader.readAsDataURL(file);
	}
	
	takePicture(){
		Camera.getPicture({
			destinationType: Camera.DestinationType.DATA_URL,
			targetWidth: 1000,
			targetHeight: 1000
			}).then((imageData) => {
			// imageData is a base64 encoded string
			this.scanUri = "data:image/jpeg;base64," + imageData;
			}, (err) => {
			console.log(err);
		});
	}
	
	onChangeNationality(){
		if(this.nationality == 9)
		this.scanTitle=" de votre CNI";
		else
		this.scanTitle=" de votre autorisation de travail";
	}
}