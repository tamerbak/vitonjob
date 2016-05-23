import {Page, Alert, NavController, NavParams, Tabs} from 'ionic-angular';
import {LoadListService} from "../../providers/load-list.service";
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SqlStorageService} from "../../providers/sql-storage.service";
import {PersonalAddress} from "../personal-address/personal-address";
import {AuthenticationService} from "../../providers/authentication.service";

@Page({
	templateUrl: 'build/pages/civility/civility.html',
	providers: [GlobalConfigs, LoadListService, SqlStorageService, AuthenticationService]
})
export class CivilityPage {
	tabs:Tabs;
	title: string;
	lastname: string;
	firstname: string;
	birthdate: string;
	birthplace: string;
	cni: string;
	numSS: string;
	nationality;
	nationalities = [];
	currentEmployer;
	companyname;
	siret;
	ape;
	
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
			console.log(this.nationalities);
			console.log(this.nationalities[0]);
			//console.log(this.nationalities[0].natId);
			console.log(this.nationalities[0].libelle);
		});
	}
	
	updateCivility(){
		//parse current employer into json
		//this.currentEmployer = JSON.parse(this.currentEmployer);
		//get the role id
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
				this.authService.setObj('currentEmployer', this.currentEmployer);
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
				this.authService.setObj('currentEmployer', this.currentEmployer);
			}
			).catch( error => {
				reject(error);
			});
		}
		//redirecting to personal address tab
		this.tabs.select(1);
	}
	
	
	isBtnUpdtDisabled(){
		if(!this.isEmployer){
			return (!this.title || !this.firstname || !this.lastname || !this.cni || !this.numSS || !this.nationality || !this.birthplace || !this.birthdate)
		}
		else{
			return (!this.title || !this.firstname || !this.lastname || !this.companyname || !this.siret || !this.ape)
		}	
	}
}
