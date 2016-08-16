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
import {NgZone} from '@angular/core';

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
	name: string;
	street: string;
	streetNumber: string;
	zipCode: string;
	city: string;
	country: string;
	isGooglePlaceHidden = true;
	generalLoading;
	//isAdrFormHidden = true;
	currentUserVar: string;
	isZipCodeValid = true;
	
	/**
		* @description While constructing the view, we get the currentUser passed as parameter from the connection page
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
		this.titlePage = this.isEmployer ? "Adresse siège" : "Adresse personnelle";
		//this.tabs=tabs;
		this.storage = new Storage(SqlStorage);
		//get current employer data from params passed by phone/mail connection
		this.params = params;
		this.currentUser = this.params.data.currentUser;
		this.fromPage = this.params.data.fromPage;
	}
	
	ionViewDidEnter(){
		//in case of user has already signed up
		this.initPersonalAddressForm();
	}
	
	/**
		* @description initiate the personal address form with data of the logged user
	*/
	initPersonalAddressForm(){
		this.storage.get(this.currentUserVar).then((value) => {
			//if user has already signed up, fill the address field with his data
			if(value){
				this.currentUser = JSON.parse(value);
				if(this.isEmployer){
					this.searchData = this.currentUser.employer.entreprises[0].siegeAdress.fullAdress;
					this.name = this.currentUser.employer.entreprises[0].siegeAdress.name;
					this.streetNumber = this.currentUser.employer.entreprises[0].siegeAdress.streetNumber;
					this.street = this.currentUser.employer.entreprises[0].siegeAdress.street;
					this.zipCode = this.currentUser.employer.entreprises[0].siegeAdress.zipCode;
					this.city = this.currentUser.employer.entreprises[0].siegeAdress.city;
					this.country = this.currentUser.employer.entreprises[0].siegeAdress.country;
					//for old users, retrieve address components from server bd and stocke them in local db
					if(!this.country && this.searchData){
						this.authService.getAddressByUser(this.currentUser.employer.entreprises[0].id).then((data) =>{
							this.name = data[0].name;
							this.streetNumber = data[0].streetNumber;
							this.street = data[0].street;
							this.zipCode = data[0].zipCode;
							this.city = data[0].city;
							this.country = data[0].country;
						});
					}
				}else{
					this.searchData = this.currentUser.jobyer.personnalAdress.fullAdress;
					this.name = this.currentUser.jobyer.personnalAdress.name;
					this.streetNumber = this.currentUser.jobyer.personnalAdress.streetNumber;
					this.street = this.currentUser.jobyer.personnalAdress.street;
					this.zipCode = this.currentUser.jobyer.personnalAdress.zipCode;
					this.city = this.currentUser.jobyer.personnalAdress.city;
					this.country = this.currentUser.jobyer.personnalAdress.country;
					if(!this.country && this.searchData){
						this.authService.getAddressByUser(this.currentUser.jobyer.id).then((data) =>{
							this.name = data[0].name;
							this.streetNumber = data[0].streetNumber;
							this.street = data[0].street;
							this.zipCode = data[0].zipCode;
							this.city = data[0].city;
							this.country = data[0].country;
						});
					}
				}
				if(this.city){
					//this.isAdrFormHidden = false;
					this.isGooglePlaceHidden = true;
				}
			}
			//if there is not a logged user or there is no address saved in the user data
			if(!value || !this.searchData ){
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
	}
	
	/**
		* @description display the second request alert for geolocation
	*/
	displayGeolocationAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Si vous acceptez d'être localisé, vous n'aurez qu'à valider" + (this.isEmployer ? " l'adresse de votre siège social." : " votre adresse personnelle."),
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
					this.geolocResult = results[0];
					//display geolocated address below the input
					this.geolocAddress = results[0].formatted_address;
					//display address components in appropriate inputs
					var adrObj = this.authService.decorticateGeolocAddress(this.geolocResult);
					this.name = !adrObj.name ? '' : adrObj.name.replace("&#39;", "'");
					this.streetNumber = adrObj.streetNumber.replace("&#39;", "'");
					this.street = adrObj.street.replace("&#39;", "'");
					this.zipCode = adrObj.zipCode;
					this.city = adrObj.city.replace("&#39;", "'");
					this.country = (adrObj.country.replace("&#39;", "'") == "" ? 'France' : adrObj.country.replace("&#39;", "'"));
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
			this.name = !adrObj.name ? '' : adrObj.name.replace("&#39;", "'");
			this.streetNumber = adrObj.streetNumber.replace("&#39;", "'");
			this.street = adrObj.street.replace("&#39;", "'");
			this.zipCode = adrObj.zipCode;
			this.city = adrObj.city.replace("&#39;", "'");
			this.country = (adrObj.country.replace("&#39;", "'") == "" ? 'France' : adrObj.country.replace("&#39;", "'"));
			this.isGooglePlaceHidden = true;
		});
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
			spinner : 'hide',
			duration : 15000
		});
		this.nav.present(loading).then(() => {
			if(this.isEmployer){
				var entreprise = this.currentUser.employer.entreprises[0];  
				var eid = "" + entreprise.id + "";
				// update personal address
				this.authService.updateUserPersonalAddress(eid, this.name, this.streetNumber, this.street, this.zipCode, this.city, this.country)
				.then((data) => {
					if (!data || data.status == "failure") {
						console.log(data.error);
						loading.dismiss();
						this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
						return;
					}else{
						//id address not send by server
						entreprise.siegeAdress.fullAdress = (this.name ? this.name + ", " : "") + (this.streetNumber ? this.streetNumber + ", " : "") + (this.street ? this.street + ", " : "") + (this.zipCode ? this.zipCode + ", " : "") + this.city + ", " + this.country;
						entreprise.siegeAdress.name = this.name;
						entreprise.siegeAdress.streetNumber = this.streetNumber;
						entreprise.siegeAdress.street = this.street;
						entreprise.siegeAdress.zipCode = this.zipCode;
						entreprise.siegeAdress.city = this.city;
						entreprise.siegeAdress.country = this.country;
						this.currentUser.employer.entreprises[0] = entreprise;
						this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
						//redirecting to job address tab
						loading.dismiss();
						if(this.fromPage == "profil"){
							this.nav.pop();
						}else{
							//redirecting to job address tab
							//this.tabs.select(2);
							this.nav.push(JobAddressPage);
						}
					}
				});
				}else{
				var roleId = "" + this.currentUser.jobyer.id + "";
				// update personal address
				this.authService.updateUserPersonalAddress(roleId, this.name, this.streetNumber, this.street, this.zipCode, this.city, this.country)
				.then((data) => {
					if (!data || data.status == "failure") {
						console.log(data.error);
						loading.dismiss();
						this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
						return;
					}else{
						//id address not send by server
						this.currentUser.jobyer.personnalAdress.fullAdress = (this.name ? this.name + ", " : "") + (this.streetNumber ? this.streetNumber + ", " : "") + (this.street ? this.street + ", " : "") + (this.zipCode ? this.zipCode + ", " : "") + this.city + ", " + this.country;
						this.currentUser.jobyer.personnalAdress.name = this.name;
						this.currentUser.jobyer.personnalAdress.streetNumber = this.streetNumber;
						this.currentUser.jobyer.personnalAdress.street = this.street;
						this.currentUser.jobyer.personnalAdress.zipCode = this.zipCode;
						this.currentUser.jobyer.personnalAdress.city = this.city;
						this.currentUser.jobyer.personnalAdress.country = this.country;
						this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
						loading.dismiss();
						if(this.fromPage == "profil"){
							this.nav.pop();
						}else{
							//redirecting to job address tab
							//this.tabs.select(2);
							this.nav.push(JobAddressPage);
						}
					}
				});
			}
		});
	}
	
	isAddressModified(){
		if(this.isEmployer){
			return (this.searchData != this.currentUser.employer.entreprises[0].siegeAdress.fullAdress) || (this.selectedPlace != this.currentUser.employer.entreprises[0].siegeAdress.fullAdress);
			}else{
			return (this.searchData != this.currentUser.jobyer.personnalAdress.fullAdress) || (this.selectedPlace != this.currentUser.jobyer.personnalAdress.fullAdress);
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