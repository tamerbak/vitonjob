import {NavController, Page, IonicApp, NavParams, Tabs, Alert} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {GooglePlaces} from '../../components/google-places/google-places';
import {AuthenticationService} from "../../providers/authentication.service";
import {OfferListPage} from "../offer-list/offer-list";
import {Geolocation} from 'ionic-native';

/**
	* @author Amal ROCHD
	* @description update job address for employers and jobyers
	* @module Authentication
*/
@Page({
	directives: [GooglePlaces],
	templateUrl: 'build/pages/job-address/job-address.html',
	providers: [AuthenticationService]
})
export class JobAddressPage {
	searchData : string;
	/**
		* @description While constructing the view, we get the currentEmployer passed as parameter from the connection page
	*/
	constructor(private authService: AuthenticationService, params: NavParams, public gc: GlobalConfigs, tabs:Tabs, public nav: NavController) {
		this.searchData = "" 
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		// Set local variables and messages
		this.themeColor = config.themeColor;
		this.isEmployer = (this.projectTarget == 'employer');
		this.tabs=tabs;
		//get current employer data from params passed by phone/mail connection
		this.params = params;
		this.currentEmployer = this.params.data.currentEmployer;
		//geolocalisation alert
		this.displayRequestAlert();
	}
	
	displayRequestAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Localisation: êtes-vous dans votre lieu de départ au travail??",
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
						this.displayGeolocationAlert();
					}
				}
			]
		});
		this.nav.present(confirm);
	}
	
	displayGeolocationAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Si vous acceptez d'être localisé, vous n'aurez qu'à valider votre adresse de départ au travail.",
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
						this.geolocate();
					}
				}
			]
		});
		this.nav.present(confirm);
	}
	
	geolocate(){
		Geolocation.getCurrentPosition(
		{
			enableHighAccuracy:true, 
			timeout:5000, 
			maximumAge:0
		}
		).then(position => {
			console.log(position);
			this.getAddressFromGeolocation(position);
		});
	}
	
	getAddressFromGeolocation(position){
		let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		new google.maps.Geocoder().geocode({'location':latLng}, (results, status) =>{
			if(status === google.maps.GeocoderStatus.OK){
				console.log(results[0].formatted_address);
				//display geolocated address in the searchbar
				this.searchData = results[0].formatted_address;
				//this.selectedPlace = results[0];
			}
		});
	}
	/**
		* @description function to get the selected result in the google place autocomplete
	*/
	showResults(place) {
		this.selectedPlace = place;
	}
	
	/**
		* @description function that callsthe service to update job address for employers and jobyers
	*/
	 updateJobAddress(){
		if(!this.selectedPlace){
			return;
		}
		// put job address in session
		var address = this.selectedPlace.adr_address;
		this.authService.setObj('adr_address', this.selectedPlace);
		var id;
		if(this.isEmployer){
			var entreprises = this.currentEmployer.entreprises;  
			id = entreprises[0].entrepriseId;
		}else{
			id = this.currentEmployer.jobyerId;
		}
		// update job address
		this.authService.updateEmployerJobAddress(id, address, this.projectTarget)
		.then((data) => {
			if(this.isEmployer){
				var adresseTravail = {};
				if (this.selectedPlace){
					adresseTravail = {fullAddress: this.selectedPlace.formatted_address};
				}
				else{
					adresseTravail = {fullAddress: ""};
				}
				this.currentEmployer.adresseTravail = adresseTravail;
				this.authService.setObj('employeur', this.currentEmployer);
				
				var addresses = entreprises.adresses;
				if (!addresses)
				addresses = [];
				addresses.push(
				{
					"addressId": data.id,
					"siegeSocial": "true",
					"adresseTravail": "false",
					"fullAdress": this.selectedPlace.formatted_address
				}
				);
				entreprises.adresses = addresses;
				this.currentEmployer.entreprises = entreprises;
				//redirecting to offer list page
				this.nav.push(OfferListPage);
			}else{
				this.currentEmployer.adresseDepTravail = {
					"addressId": data.id,
					"fullAddress": this.selectedPlace.formatted_address
				};
			}
			this.authService.setObj('currentEmployer', this.currentEmployer);
			}).catch( error => {
			reject(error);
		});
	}
}	