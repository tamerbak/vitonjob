import {Page, Alert, NavController, NavParams, Tabs} from 'ionic-angular';
import {LoadListService} from "../../providers/load-list.service";
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SqlStorageService} from "../../providers/sql-storage.service";
import {PersonalAddress} from "../personal-address/personal-address";
import {AuthenticationService} from "../../providers/authentication.service";
import {MaskDirective} from '../../directives/mask.directive';
/**
	* @author Amal ROCHD
	* @description update civility information
	* @module Authentication
*/
@Page({
	templateUrl: 'build/pages/civility/civility.html',
	directives: [MaskDirective],
	providers: [GlobalConfigs, LoadListService, SqlStorageService, AuthenticationService]
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
	currentEmployer;
	companyname;
	siret;
	ape;
	
	/**
		* @description While constructing the view, we load the list of nationalities, and get the currentEmployer passed as parameter from the connection page
	*/
	constructor(public nav: NavController, private authService: AuthenticationService,
	public gc: GlobalConfigs, private loadListService: LoadListService, private sqlStorageService: SqlStorageService, tabs:Tabs, params: NavParams) {
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		
		// Set local variables and messages
		this.themeColor = config.themeColor;
		this.isEmployer = (this.projectTarget == 'employer');
		this.tabs=tabs;
		this.params = params;
		this.currentEmployer = this.params.data.currentEmployer;
		
		//load nationality list
		this.loadListService.loadNationalities(this.projectTarget).then((data) => {
			this.nationalities = data.data;
		});
	}
	/**
		* @description update civility information for employer and jobyer
	*/
	updateCivility(){
		if(this.isEmployer){
			//get the role id
			var employerId = this.currentEmployer.employerId;
			//get entreprise id of the current employer
			var entrepriseId = this.currentEmployer.entreprises[0].entrepriseId;
			// update employer
			this.authService.updateEmployerCivility(this.title, this.lastname, this.firstname, this.companyname, this.siret, this.ape, employerId, entrepriseId, this.projectTarget)
			.then((data) => {
				// data saved
				console.log("response update civility : " + data.status);
				if (!this.currentEmployer)
				this.currentEmployer = {};
				this.currentEmployer.titre = this.title;
				this.currentEmployer.nom = this.lastname;
				this.currentEmployer.prenom = this.firstname;
				this.currentEmployer.entreprises[0].name = this.companyname;
				this.currentEmployer.entreprises[0].siret = this.siret;
				this.currentEmployer.entreprises[0].naf = this.ape;
				// PUT IN SESSION
				this.authService.setObj('currentUser', this.currentEmployer);
			}
			).catch( error => {
				reject(error);
			});
			}else{
			//get the role id
			var employerId = this.currentEmployer.jobyerId;
			// update jobyer
			this.authService.updateJobyerCivility(this.title, this.lastname, this.firstname, this.numSS, this.cni, this.nationality, employerId, this.birthdate, this.birthplace, this.projectTarget)
			.then((data) => {
				// data saved
				console.log("response update civility : " + data.status);
				if (!this.currentEmployer)
				this.currentEmployer = {};
				this.currentEmployer.titre = this.title;
				this.currentEmployer.nom = this.lastname;
				this.currentEmployer.prenom = this.firstname;
				this.currentEmployer.cni = this.cni;
				this.currentEmployer.numSS = this.numSS;
				this.currentEmployer.nationalite = this.nationality;
				this.currentEmployer.dateNaissance = this.birthdate;
				this.currentEmployer.lieuNaissance = this.birthplace;
				// PUT IN SESSION
				this.authService.setObj('currentUser', this.currentEmployer);
			}
			).catch( error => {
				reject(error);
			});
		}
		//redirecting to personal address tab
		this.tabs.select(1);
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
		this.ape = this.ape.toUpperCase();
	}
	
	changeToUppercase(){
		this.ape = this.ape.toUpperCase();
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
}