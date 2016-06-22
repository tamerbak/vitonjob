import {NavController, Picker, PickerColumnOption, Modal} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModelLockScreenPage} from "../model-lock-screen/model-lock-screen";
import {OnInit, Component} from "@angular/core";
import {SettingsPage} from "../settings/settings";
import {ModalPicturePage} from "../modal-picture/modal-picture";
import {UserService} from "../../providers/user-service/user-service";
import {AddressService} from "../../providers/address-service/address-service";
import {Storage, SqlStorage} from 'ionic-angular';
import {DateConverter} from '../../pipes/date-converter/date-converter';
//import {InfoUserPage} from "../info-user/info-user"
import {CivilityPage} from "../civility/civility";
import {PersonalAddressPage} from "../personal-address/personal-address";
import {JobAddressPage} from "../job-address/job-address";

/*
 Generated class for the ProfilePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
declare var google:any;

@Component({
    templateUrl: 'build/pages/profile/profile.html',
    providers: [GlobalConfigs, UserService, AddressService],
	pipes: [DateConverter],
})
export class ProfilePage implements OnInit {
    themeColor:string;
    inversedThemeColor:string;
    isEmployer:boolean;
    projectTarget:string;
    userImageURL:string;
    thirdThemeColor:string;
    map:any;
    swipEvent:any;
    userData:any;
    userService:any;
    addrService:any;
    backgroundImage: any;

    constructor(public nav:NavController, public gc:GlobalConfigs,
                userService:UserService, addrService:AddressService) {

        this.projectTarget = gc.getProjectTarget();
		this.storage = new Storage(SqlStorage);
		
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        //Initializing page:
        this.initializePage(config);
        this.thirdThemeColor = gc.getThirdThemeColor();
        this.userService = userService;
        this.addrService = addrService;
    }

    /**
     * @Author : TEL
     * @Description : Initializing profile page
     */
    initializePage(config) {
        // Set local variables
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.userImageURL = config.userImageURL;
        this.backgroundImage = config.backgroundImage;
        this.swipEvent = '';
        this.userData = {
            titre: "Ajouter mon nom et prénom",
            nom: "",
            prenom: "",
            nationalite: "",
            jobyer: {
                numSS: "",
                cni: "",
                dateNaissance: "",
                lieuNaissance: "",
                natId: "",
                workAdress: {fullAdress: ""},
                personnalAdress: {fullAdress: ""}
            },
            employer: {
                entreprises: [
                    {
                        nom: "",
                        siret: "",
                        naf: "",
                        workAdress: {fullAdress: ""},
                        siegeAdress: {fullAdress: ""}
                    }
                ]
            }
        }

    }

    onPageWillEnter() {
        console.log('••• On Init');
        //Get User information
        this.storage.get("currentUser").then(data => {
            if (data) {
                this.userData = JSON.parse(data);
                this.loadMap(this.userData);
            }
        });
    }

    /**
     * @description : Loading addresses on the map
     */
    loadMap(data:any) {

        var mainAddress:string;
        var secondaryAddress:string;
        if (data.estEmployeur) {
            mainAddress = data.employer.entreprises[0].siegeAdress.fullAdress;
            secondaryAddress = data.employer.entreprises[0].workAdress.fullAdress;
        } else {
            mainAddress = data.jobyer.personnalAdress.fullAdress;
            secondaryAddress = data.jobyer.workAdress.fullAdress;
        }

		if(mainAddress){
			this.addrService.getLatLng(mainAddress).then(gData => {
				if (gData && gData.results && gData.results.length > 0) {
					let latLng1 = new google.maps.LatLng(gData.results[0].geometry.location.lat,
						gData.results[0].geometry.location.lng);
					let mapOptions = {
						//center: latLng1,
						//zoom: 5,
						draggable: false,
						mapTypeId: google.maps.MapTypeId.ROADMAP
					};
					//debugger;
					this.addrService.getLatLng(secondaryAddress).then(gData => {
						if (gData && gData.results && gData.results.length > 0) {
							let latLng2 = new google.maps.LatLng(gData.results[0].geometry.location.lat,
								gData.results[0].geometry.location.lng);
							this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
							//new google.maps.LatLng(48.8762300, 2.3617500);
							let addresses = [latLng1, latLng2];
							let bounds = new google.maps.LatLngBounds();
							this.addMarkers(addresses, bounds);
						} else {
							let addresses = [latLng1];
							let bounds = new google.maps.LatLngBounds();
							this.addMarkers(addresses, bounds);
						}
					});
				} else {
					//let latLng1 = new google.maps.LatLng(48.8785618, 2.3603689);
					this.addrService.getLatLng(secondaryAddress).then(gData => {
						if (gData && gData.results && gData.results.length > 0) {
							let latLng2 = new google.maps.LatLng(gData.results[0].geometry.location.lat,
								gData.results[0].geometry.location.lng);
							let mapOptions = {
								draggable: false,
								mapTypeId: google.maps.MapTypeId.ROADMAP
							};
							this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
							//new google.maps.LatLng(48.8762300, 2.3617500);
							let addresses = [latLng2];
							let bounds = new google.maps.LatLngBounds();
							this.addMarkers(addresses, bounds);
						} else {
							// No addresses
							let mapOptions = {
								draggable: false,
								mapTypeId: google.maps.MapTypeId.ROADMAP
							};
							this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
						}
					});
				}
			});
		}

    }

    /**
     * @description adding markers to map
     * @param addresses
     * @param bounds
     */
    addMarkers(addresses:any, bounds:any) {

        for (let i = 0; i < addresses.length; i++) {
            let marker = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: addresses[i]
            });
            bounds.extend(marker.position);
        }

        this.map.fitBounds(bounds);


        /*let content = "<h4>Information!</h4>";

         this.addInfoWindow(marker, content);*/


    }

    /**
     * Stars picker
     */
    setStarPicker() {
        let rating = 0;
        let picker = Picker.create();
        let options:PickerColumnOption[] = new Array<PickerColumnOption>();
        for (let i = 1; i <= 5; i++) {
            options.push({
                value: i,
                text: this.writeStars(i)
            })
        }

        let column = {
            selectedIndex: rating,
            options: options
        };
        picker.addColumn(column);
        picker.addButton('Annuler');
        picker.addButton({
            text: 'Ok',
            handler: data => {
                rating = data;
            }
        });
        this.nav.present(picker);
    }

    /**
     * writing stars
     * @param number of stars writed
     */
    writeStars(number:string):string {
        let starText = '';
        for (let i = 0; i < number; i++) {
            starText += '\u2605'
        }

        return starText;

    }

    goToSettings() {
        this.nav.push(SettingsPage);
    }

    showPictureModel() {
        let pictureModel = Modal.create(ModalPicturePage);
        pictureModel.onDismiss(picture => {
            if (picture) {
                this.userImageURL = picture.url;
            }
        });
        this.nav.present(pictureModel);

    }
	
	goToInfoUserTabs(){
		this.nav.push(CivilityPage, {currentUser: this.userData, fromPage: "profil"});	
	}
	
	goToPersonalAddressTab(){
		this.nav.push(PersonalAddressPage, {currentUser: this.userData, fromPage: "profil", selectedTab: 1});	
	}

	goToJobAddressTab(){
		this.nav.push(JobAddressPage, {currentUser: this.userData, fromPage: "profil", selectedTab: 2});	
	}
	
}