import {NavController, Page, IonicApp, NavParams, Tabs, Alert} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {GooglePlaces} from '../../components/google-places/google-places';
import {AuthenticationService} from "../../providers/authentication.service";
import {Geolocation} from 'ionic-native';
import {enableProdMode, ElementRef, Renderer} from 'angular2/core'; 
enableProdMode();

/**
	* @author Amal ROCHD
	* @description update personal address for employers and jobyers
	* @module Authentication
*/
@Page({
	directives: [GooglePlaces],
	templateUrl: 'build/pages/personal-address/personal-address.html',
	providers: [AuthenticationService]
})
export class PersonalAddressPage {
	searchData : string;
	geolocAddress;
	/**
		* @description While constructing the view, we get the currentEmployer passed as parameter from the connection page
	*/
	constructor(private authService: AuthenticationService, params: NavParams, public gc: GlobalConfigs, tabs:Tabs, public nav: NavController, public elementRef: ElementRef, public renderer: Renderer) {
		this.searchData = "";
		this.geolocAddress = "";
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
			message: "Localisation: êtes-vous dans votre domicile?",
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
			message: "Si vous acceptez d'être localisé, vous n'aurez qu'à valider votre adresse personnelle.",
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
				this.geolocAddress = results[0].formatted_address;
				//this.selectedPlace = results[0];
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
	}
	
	/**
		* @description function that calls the service to update personal address for employers and jobyers
	*/
	updatePersonalAddress(){
		if(!this.selectedPlace){
			//temporarely, erase after saving the geolocating address
			this.tabs.select(2);
			return;
		}
		// put personal address in session
		var address = this.selectedPlace.adr_address;
		this.authService.setObj('adr_address', this.selectedPlace);
		var roleId = (this.isEmployer ? this.currentEmployer.employerId : this.currentEmployer.jobyerId);
		// update personal address
		this.authService.updateEmployerPersonalAddress(roleId, address, this.projectTarget)
		.then((data) => {
			if (!data || data.status == "failure") {
				console.log(data.error);
				this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
				return;
			}else{
				if(this.isEmployer){
					var entreprises = this.currentEmployer.entreprises;  
					var eid = entreprises[0].entrepriseId;
					var addresses = entreprises.adresses;
					if (!addresses)
					addresses = [];
					addresses.push(
					{
						"addressId": data.id,
						"siegeSocial": "false",
						"adresseTravail": "true",
						"fullAdress": this.selectedPlace.formatted_address
					}
					);
					entreprises.adresses = addresses;
					this.currentEmployer.entreprises = entreprises;
					}else{
					this.currentEmployer.adressePersonelle = {
						"addressId": data.id,
						"fullAddress": this.selectedPlace.formatted_address
					};
				}
				this.authService.setObj('currentUser', this.currentEmployer);
				//redirecting to job address tab
				this.tabs.select(2);
			}
		});
	}
}	