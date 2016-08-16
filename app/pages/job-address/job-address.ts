import {Component} from '@angular/core';
import {NavController, NavParams, Alert, Loading} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {GooglePlaces} from '../../components/google-places/google-places';
import {AuthenticationService} from "../../providers/authentication.service";
import {GlobalService} from "../../providers/global.service";
import {Geolocation} from 'ionic-native';
import {Storage, SqlStorage} from 'ionic-angular';
import {HomePage} from "../home/home";
import {OfferListPage} from "../offer-list/offer-list";
import {NgZone} from '@angular/core';

/**
	* @author Amal ROCHD
	* @description update job address for employers and jobyers
	* @module Authentication
*/
@Component({
	directives: [GooglePlaces],
	templateUrl: 'build/pages/job-address/job-address.html',
	providers: [AuthenticationService, GlobalService]
})
export class JobAddressPage {
	searchData : string;
	geolocAddress;
	geolocResult;
	titlePage: string;
	fromPage: string;
	name: string;
	street: string;
	streetNumber: string;
	zipCode;
	city: string;
	country: string;
	isGooglePlaceHidden = true;
	generalLoading;
	//isAdrFormHidden = true;
	currentUserVar: string;
	isZipCodeValid = true;
	
	/**
		* @description While constructing the view, we get the currentEmployer passed as parameter from the connection page
	*/
	constructor(private authService: AuthenticationService, 
				params: NavParams, 
				public gc: GlobalConfigs, 
				nav: NavController, 
				private globalService: GlobalService,
				private zone: NgZone){
		this.nav = nav;
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
		this.currentUserVar = config.currentUserVar;
		this.isEmployer = (this.projectTarget == 'employer');
		this.titlePage = this.isEmployer ? "Adresse lieu de travail" : "Adresse de départ au travail";
		//this.tabs=tabs;
		this.storage = new Storage(SqlStorage);
		//get current employer data from params passed by phone/mail connection
		this.params = params;
		this.currentUser = this.params.data.currentUser;
		this.fromPage = this.params.data.fromPage;
	}
	
	ionViewDidEnter(){
		//in case of user has already signed up
		this.initJobAddressForm();
	}
	/**
		* @description initiate the job address form with data of the logged user
	*/
	initJobAddressForm(){
		this.storage.get(this.currentUserVar).then((value) => {
			//if user has already signed up, fill the address field with his data
			if(value){
				this.currentUser = JSON.parse(value);
				if(this.isEmployer){
					this.searchData = this.currentUser.employer.entreprises[0].workAdress.fullAdress;
					this.name = this.currentUser.employer.entreprises[0].workAdress.name;
					this.streetNumber = this.currentUser.employer.entreprises[0].workAdress.streetNumber;
					this.street = this.currentUser.employer.entreprises[0].workAdress.street;
					this.zipCode = this.currentUser.employer.entreprises[0].workAdress.zipCode;
					this.city = this.currentUser.employer.entreprises[0].workAdress.city;
					this.country = this.currentUser.employer.entreprises[0].workAdress.country;
					//for old users, retrieve address components from server bd and stocke them in local db
					if(!this.country && this.searchData){
						this.authService.getAddressByUser(this.currentUser.employer.entreprises[0].id).then((data) =>{
							this.name = data[1].name;
							this.streetNumber = data[1].streetNumber;
							this.street = data[1].street;
							this.zipCode = data[1].zipCode;
							this.city = data[1].city;
							this.country = data[1].country;
						});
					}
				}else{
					this.searchData = this.currentUser.jobyer.workAdress.fullAdress;
					this.name = this.currentUser.jobyer.workAdress.name;
					this.streetNumber = this.currentUser.jobyer.workAdress.streetNumber;
					this.street = this.currentUser.jobyer.workAdress.street;
					this.zipCode = this.currentUser.jobyer.workAdress.zipCode;
					this.city = this.currentUser.jobyer.workAdress.city;
					this.country = this.currentUser.jobyer.workAdress.country;
					if(!this.country && this.searchData){
						this.authService.getAddressByUser(this.currentUser.jobyer.id).then((data) =>{
							this.name = data[1].name;
							this.streetNumber = data[1].streetNumber;
							this.street = data[1].street;
							this.zipCode = data[1].zipCode;
							this.city = data[1].city;
							this.country = data[1].country;
						});
					}
				}
				if(this.city){
					//this.isAdrFormHidden = false;
					this.isGooglePlaceHidden = true;
				}
			}
			//if there is not a logged user or there is no address saced in the user data
			if(!value || !this.searchData){
			//if(this.fromPage != "profil"){
				//geolocalisation alert
				this.displayRequestAlert();
			}
		});
	}
	
	/**
		* @description display the first request alert for geolocation
	*/
	displayRequestAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Géolocalisation : êtes-vous connecté depuis votre" + (this.isEmployer ? " lieu de travail" : " lieu de départ au travail") +"?",
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
	}
	
	/**
		* @description display the second request alert for geolocation
	*/
	displayGeolocationAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Si vous acceptez d'être localisé, vous n'aurez qu'à valider l'" + (this.isEmployer ? "adresse lieu de travail." : "adresse de départ au travail."),
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
						//gelocate the user
						confirm.dismiss().then(() => {
							this.geolocate();
						});
						return false;
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
		this.generalLoading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide',
			duration : 10000
		});
		this.nav.present(this.generalLoading);
		let options = {timeout: 5000, enableHighAccuracy: true, maximumAge: 0}; 
		Geolocation.getCurrentPosition(options)
			.then((position) => {
				console.log(position);
				this.getAddressFromGeolocation(position);
			})
			.catch((error) => {
				console.log(error);
				this.generalLoading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Impossible de vous localiser. Veuillez vérifier vos paramètres de localisation, ou saisissez votre adresse manuellement");
			});
	}
	
	/**
		* @description get formatted address from gps coordinates
	*/
	getAddressFromGeolocation(position){
		let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		new google.maps.Geocoder().geocode({'location':latLng}, (results, status) =>{
			if(status === google.maps.GeocoderStatus.OK){
				console.log(results[0].formatted_address);
				this.zone.run(()=>{
					//display geolocated address in the searchbar
					this.searchData = results[0].formatted_address;
					//display geolocated address below the input
					this.geolocResult = results[0];
					this.geolocAddress = results[0].formatted_address;
					//display address components in appropriate inputs
					var adrArray = this.authService.decorticateGeolocAddress(this.geolocResult);
					this.street = adrArray[0];
					this.zipCode = adrArray[1];
					this.city = adrArray[2];
					this.country = adrArray[3];
					this.isGooglePlaceHidden = true;
					//this.isAdrFormHidden = false;
				});
				this.generalLoading.dismiss();
			}else{
				console.log(status);
				this.generalLoading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Impossible de vous localiser. Veuillez vérifier vos paramètres de localisation, ou saisissez votre adresse manuellement");				
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
		//display address components in appropriate inputs
		var adrObj = this.authService.decorticateGeolocAddress(this.selectedPlace);
		this.zone.run(()=>{
			this.name = adrObj.name.replace("&#39;", "'");
			this.streetNumber = adrObj.streetNumber.replace("&#39;", "'");
			this.street = adrObj.street.replace("&#39;", "'");
			this.zipCode = adrObj.zipCode;
			this.city = adrObj.city.replace("&#39;", "'");
			this.country = (adrObj.country.replace("&#39;", "'") == "" ? 'France' : adrObj.country.replace("&#39;", "'"));
			this.isGooglePlaceHidden = true;
			//this.isAdrFormHidden = false;
		});
	}
	
	/**
		* @description function that callsthe service to update job address for employers and jobyers
	*/
	updateJobAddress(){
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide',
			duration : 15000
		});
		this.nav.present(loading).then(() => {
			if(this.isEmployer){
				var entreprise = this.currentUser.employer.entreprises[0];  
				var eid = "" + entreprise.id + "";
				// update job address
				this.authService.updateUserJobAddress(eid, this.name, this.streetNumber, this.street, this.zipCode, this.city, this.country)
				.then((data) => {
					if (!data || data.status == "failure") {
						console.log(data.error);
						loading.dismiss();
						this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
						return;
					}else{
						//id address not send by server
						entreprise.workAdress.fullAdress = (this.name ? this.name + ", " : "") + (this.streetNumber ? this.streetNumber + ", " : "") + (this.street ? this.street + ", " : "") + (this.zipCode ? this.zipCode + ", " : "") + this.city + ", " + this.country;
						entreprise.workAdress.name = this.name;
						entreprise.workAdress.streetNumber = this.streetNumber;
						entreprise.workAdress.street = this.street;
						entreprise.workAdress.zipCode = this.zipCode;
						entreprise.workAdress.city = this.city;
						entreprise.workAdress.country = this.country;
						this.currentUser.employer.entreprises[0] = entreprise;
						this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
						loading.dismiss();
						if(this.fromPage == "profil"){
							this.nav.pop();
						}else{
							//redirecting to offer list page
							this.nav.setRoot(OfferListPage);
						}						
					}
				});
				}else{
				var roleId = "" + this.currentUser.jobyer.id + "";
				// update job address
				this.authService.updateUserJobAddress(roleId, this.name, this.streetNumber, this.street, this.zipCode, this.city, this.country)
				.then((data) => {
					if (!data || data.status == "failure") {
						console.log(data.error);
						loading.dismiss();
						this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
						return;
					}else{
						//id address not send by server
						this.currentUser.jobyer.workAdress.fullAdress = (this.name ? this.name + ", " : "") + (this.streetNumber ? this.streetNumber + ", " : "") + (this.street ? this.street + ", " : "") + (this.zipCode ? this.zipCode + ", " : "") + this.city + ", " + this.country;
						this.currentUser.jobyer.workAdress.name = this.name;
						this.currentUser.jobyer.workAdress.streetNumber = this.streetNumber;
						this.currentUser.jobyer.workAdress.street = this.street;
						this.currentUser.jobyer.workAdress.zipCode = this.zipCode;
						this.currentUser.jobyer.workAdress.city = this.city;
						this.currentUser.jobyer.workAdress.country = this.country;
						this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
						loading.dismiss();
						if(this.fromPage == "profil"){
							this.nav.pop();
						}else{
							//redirecting to offer list page
							this.nav.setRoot(OfferListPage);
						}
					}
				});
			}
		});
	}
	
	copyPersonalAddress(){
		if(this.isEmployer){
			this.searchData = this.currentUser.employer.entreprises[0].siegeAdress.fullAdress;
			this.street = this.currentUser.employer.entreprises[0].siegeAdress.street;
			this.zipCode = this.currentUser.employer.entreprises[0].siegeAdress.zipCode;
			this.city = this.currentUser.employer.entreprises[0].siegeAdress.city;
			this.country = this.currentUser.employer.entreprises[0].siegeAdress.country;
			}else{
			this.searchData = this.currentUser.jobyer.personnalAdress.fullAdress;
			this.street = this.currentUser.jobyer.personnalAdress.street;
			this.zipCode = this.currentUser.jobyer.personnalAdress.zipCode;
			this.city = this.currentUser.jobyer.personnalAdress.city;
			this.country = this.currentUser.jobyer.personnalAdress.country;
		}
		this.isGooglePlaceHidden = true;
		//this.isAdrFormHidden = false;
	}
	
	isAddressModified(){
		if(this.isEmployer){
			return (this.searchData != this.currentUser.employer.entreprises[0].workAdress.fullAdress) || (this.selectedPlace != this.currentUser.employer.entreprises[0].workAdress.fullAdress);
			}else{
			return (this.searchData != this.currentUser.jobyer.workAdress.fullAdress) || (this.selectedPlace != this.currentUser.jobyer.workAdress.fullAdress);
		}
	}
	
	showGooglePlaceInput(){
		this.isGooglePlaceHidden = false;
	}
	
	isBtnDisabled(){
		if(this.city && this.country && this.zipCode && this.isZipCodeValid){
			return false;
		}else{
			return true;
		}
	}
	
	watchZipCode(e){
		if (this.zipCode) {
			if (e.target.value.indexOf('.') != -1) {
				e.target.value = e.target.value.replace('.', '');
				this.zipCode = e.target.value;
				return;
			}
			if(e.target.value.length > 5){
				e.target.value = e.target.value.substring(0, 5);
				this.zipCode = e.target.value;
				return;
			}
		}	
	}
	
	validateZipCode(e){
		if(e.target.value.length == 5){
			this.isZipCodeValid = true;	
		}else{
			this.isZipCodeValid = false;	
		}
	}
}