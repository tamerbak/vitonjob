import {Component} from '@angular/core';
import {NavController, NavParams, Alert, Loading} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {GooglePlaces} from '../../components/google-places/google-places';
import {AuthenticationService} from "../../providers/authentication.service";
import {GlobalService} from "../../providers/global.service";
import {Geolocation} from 'ionic-native';
import {Storage, SqlStorage} from 'ionic-angular';
import {JobAddressPage} from "../job-address/job-address";
import {enableProdMode, ElementRef, Renderer} from '@angular/core'; 
enableProdMode();

/**
	* @author Amal ROCHD
	* @description update personal address for employers and jobyers
	* @module Authentication
*/
@Component({
	directives: [GooglePlaces],
	templateUrl: 'build/pages/personal-address/personal-address.html',
	providers: [AuthenticationService, GlobalService]
})
export class PersonalAddressPage {
	searchData : string;
	geolocAddress;
	geolocResult;
	titlePage: string;
	fromPage: string;
	
	/**
		* @description While constructing the view, we get the currentUser passed as parameter from the connection page
	*/
	constructor(private authService: AuthenticationService, params: NavParams, public gc: GlobalConfigs, public nav: NavController, public elementRef: ElementRef, public renderer: Renderer, private globalService: GlobalService) {
		//manually entered address
		this.searchData = "";
		//formatted geolocated address
		this.geolocAddress = "";
		//geolocated result
		this.geolocResult = null;
		
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		// Set local variables and messages
		this.themeColor = config.themeColor;
		this.isEmployer = (this.projectTarget == 'employer');
		this.titlePage = this.isEmployer ? "Adresse siège" : "Adresse personnelle";
		//this.tabs=tabs;
		this.storage = new Storage(SqlStorage);
		//get current employer data from params passed by phone/mail connection
		this.params = params;
		this.currentUser = this.params.data.currentUser;
		this.fromPage = this.params.data.fromPage;
		
		//in case of user has already signed up
		this.initPersonalAddressForm();
	}
	
	/**
		* @description initiate the personal address form with data of the logged user
	*/
	initPersonalAddressForm(){
		this.storage.get("currentUser").then((value) => {
			//if user has already signed up, fill the address field with his data
			if(value){
				this.currentUser = JSON.parse(value);
				if(this.isEmployer){
					this.searchData = this.currentUser.employer.entreprises[0].siegeAdress.fullAdress;
					}else{
					this.searchData = this.currentUser.jobyer.personnalAdress.fullAdress;
				}
			}
			//if there is not a logged user or there is no address saved in the user data
			//if(!value || !this.searchData ){
			if(this.fromPage != "profil"){
				//geolocalisation alert
				this.displayGeolocationAlert();
			}
		});
	}
	
	/**
		* @description display the first request alert for geolocation
	*/
	/*displayRequestAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Géolocalisation : êtes-vous connecté depuis votre" + (this.isEmployer ? " siège social" : " domicile") + "?",
			buttons: [
				{
					text: 'Non',
					handler: () => {
						console.log('No clicked');
					}
				},
				{
					text: 'Oui',
					handler: () => {
						console.log('Yes clicked');	
						confirm.dismiss().then(() => {
							this.displayGeolocationAlert();
						})
					}
				}
			]
		});
		this.nav.present(confirm);
	}*/
	
	/**
		* @description display the second request alert for geolocation
	*/
	displayGeolocationAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Géolocalisation : êtes-vous connecté depuis votre" + (this.isEmployer ? " siège social" : " domicile") + "?\n" + "Si vous acceptez d'être localisé, vous n'aurez qu'à valider" + (this.isEmployer ? " l'adresse de votre siège social." : " votre adresse personnelle."),
			buttons: [
				{
					text: 'Non',
					handler: () => {
						console.log('No clicked');
					}
				},
				{
					text: 'Oui',
					handler: () => {
						console.log('Yes clicked');
						confirm.dismiss().then(() => {
							this.geolocate();
						})
					}
				}
			]
		});
		this.nav.present(confirm);
	}
	
	/**
		* @description geolocate current user
	*/
	geolocate(){
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide'
		});
		this.nav.present(loading);
		Geolocation.getCurrentPosition(
		{
			enableHighAccuracy:true, 
			timeout:5000, 
			maximumAge:0
		}
		).then(position => {
			console.log(position);
			loading.dismiss();
			this.getAddressFromGeolocation(position);
		},
		error => {
			console.log(error);
			loading.dismiss();
			this.globalService.showAlertValidation("VitOnJob", "Impossible de vous localiser. Veuillez vérifier vos paramètres de localisation, ou saisissez votre adresse manuellement");	
		}
		);
	}
	
	/**
		* @description get formatted address from gps coordinates
	*/
	getAddressFromGeolocation(position){
		let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		new google.maps.Geocoder().geocode({'location':latLng}, (results, status) =>{
			if(status === google.maps.GeocoderStatus.OK){
				console.log(results[0].formatted_address);
				//display geolocated address in the searchbar
				this.searchData = results[0].formatted_address;
				//display geolocated address below the input
				this.geolocAddress = results[0].formatted_address;
				this.geolocResult = results[0];
				//to set focus on the search bar, otherwise the geolocated address will not be displyed
				const searchInput = this.elementRef.nativeElement.querySelector('input');
				setTimeout(() => {
					//delay required or ionic styling gets finicky
					this.renderer.invokeElementMethod(searchInput, 'focus', []);
				}, 0);
			}
		});
	}
	
	/**
		* @description function to get the selected result in the google place autocomplete
	*/
	showResults(place) {
		this.selectedPlace = place;
		this.geolocAddress = "";
		this.geolocResult = null;
	}
	
	/**
		* @description function that calls the service to update personal address for employers and jobyers
	*/
	updatePersonalAddress(){
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide'
		});
		this.nav.present(loading).then(() => {
			var address = '';
			//verify if the adress was modified
			if(!this.isAddressModified()){
				loading.dismiss();
				if(this.fromPage == "profil"){
					this.nav.pop();
				}else{
					//redirecting to job address tab
					//this.tabs.select(2);
					this.nav.rootNav.setRoot(JobAddressPage);
				}
				return;
			}
			//if address is manually entered
			if(this.searchData && !this.selectedPlace && !this.geolocResult){
				loading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Cette adresse n'est pas reconnaissable. Vous serez notifié après sa validation par notre équipe.");
				if(this.fromPage == "profil"){
					this.nav.pop();
				}else{
					//redirecting to job address tab
					//this.tabs.select(2);
					this.nav.rootNav.setRoot(JobAddressPage);
				}
				return;
			}
			// put personal address in session
			if(this.geolocResult == null){
				this.storage.set('adr_address', JSON.stringify(this.selectedPlace));
				address = this.selectedPlace.adr_address;
				}else{
				this.storage.set('adr_address', JSON.stringify(this.geolocAddress));
			}
			if(this.isEmployer){
				var entreprise = this.currentUser.employer.entreprises[0];  
				var eid = "" + entreprise.id + "";
				// update personal address
				this.authService.updateUserPersonalAddress(eid, address, this.geolocResult)
				.then((data) => {
					if (!data || data.status == "failure") {
						console.log(data.error);
						loading.dismiss();
						this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
						return;
						}else{
						//id address not send by server
						//entreprise.siegeAdress.id = x;
						entreprise.siegeAdress.fullAdress = (this.geolocResult == null ? this.selectedPlace.formatted_address : this.geolocAddress);
						this.currentUser.employer.entreprises[0] = entreprise;
						this.storage.set('currentUser', JSON.stringify(this.currentUser));
						//redirecting to job address tab
						loading.dismiss();
						if(this.fromPage == "profil"){
							this.nav.pop();
						}else{
							//redirecting to job address tab
							//this.tabs.select(2);
							this.nav.rootNav.setRoot(JobAddressPage);
						}
					}
				});
				}else{
				var roleId = "" + this.currentUser.jobyer.id + "";
				// update personal address
				this.authService.updateUserPersonalAddress(roleId, address, this.geolocResult)
				.then((data) => {
					if (!data || data.status == "failure") {
						console.log(data.error);
						loading.dismiss();
						this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
						return;
						}else{
						//id address not send by server
						//this.currentUser.jobyer.adress.id = x;
						this.currentUser.jobyer.personnalAdress.fullAdress = (this.geolocResult == null ? this.selectedPlace.formatted_address : this.geolocAddress);
						this.storage.set('currentUser', JSON.stringify(this.currentUser));
						loading.dismiss();
						if(this.fromPage == "profil"){
							this.nav.pop();
						}else{
							//redirecting to job address tab
							//this.tabs.select(2);
							this.nav.rootNav.setRoot(JobAddressPage);
						}
					}
				});
			}
		});
	}
	
	isAddressModified(){
		if(this.isEmployer){
			return this.searchData != this.currentUser.employer.entreprises[0].siegeAdress.fullAdress;
			}else{
			return this.searchData != this.currentUser.jobyer.personnalAdress.fullAdress;
		}
	}
}
