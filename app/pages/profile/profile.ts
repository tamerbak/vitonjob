import {NavController, Picker, PickerColumnOption, Modal, Events, Storage, SqlStorage} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModelLockScreenPage} from "../model-lock-screen/model-lock-screen";
import {OnInit, Component} from "@angular/core";
import {SettingsPage} from "../settings/settings";
import {ModalPicturePage} from "../modal-picture/modal-picture";
import {UserService} from "../../providers/user-service/user-service";
import {AddressService} from "../../providers/address-service/address-service";
import {DateConverter} from "../../pipes/date-converter/date-converter";
import {CivilityPage} from "../civility/civility";
import {PersonalAddressPage} from "../personal-address/personal-address";
import {JobAddressPage} from "../job-address/job-address";
import {BankAccountPage} from "../bank-account/bank-account";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {GlobalService} from "../../providers/global.service";
import {ImageService} from "../../providers/image-service/image-service";
//import {InfoUserPage} from "../info-user/info-user"

/*
 Generated class for the ProfilePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
declare var google: any;

@Component({
    templateUrl: 'build/pages/profile/profile.html',
    providers: [GlobalConfigs, UserService, AddressService, ProfileService, GlobalService, ImageService],
    pipes: [DateConverter],
})
export class ProfilePage implements OnInit {
    themeColor: string;
    inversedThemeColor: string;
    isEmployer: boolean;
    projectTarget: string;
    userImageURL: string;
    thirdThemeColor: string;
    map: any;
    swipEvent: any;
    userData: any;
    userService: any;
    addrService: any;
    backgroundImage: any;
    noMainAddress = false;
    noSecondAddress = false;
    isRecruiter = false;
    currentUserVar: string;
    profilPictureVar: string;
    storage: Storage;
    defaultImage: string;

    constructor(public nav: NavController,
                public gc: GlobalConfigs,
                userService: UserService,
                addrService: AddressService,
                private globalService: GlobalService,
                private profileService: ProfileService,
                private imageService: ImageService,
                public events: Events) {


        this.projectTarget = gc.getProjectTarget();
        this.storage = new Storage(SqlStorage);

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        //Initializing page:
        this.initializePage(config);
        this.thirdThemeColor = gc.getThirdThemeColor();
        this.userService = userService;
        this.addrService = addrService;
        this.defaultImage = config.userImageURL;
        this.userImageURL = "img/loading.gif";
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
        this.backgroundImage = config.backgroundImage;
        this.currentUserVar = config.currentUserVar;
        this.profilPictureVar = config.profilPictureVar;
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
        this.storage.get(this.currentUserVar).then(data => {
            if (data) {

                this.userData = JSON.parse(data);
                this.isRecruiter = this.userData.estRecruteur;
                if (!this.isRecruiter)
                    this.loadMap(this.userData);

                //load profile picture
                this.storage.get(this.profilPictureVar).then(data => {
                    //if profile picture is not stored in local, retrieve it from server
                    if (this.isEmpty(data)) {
                        this.profileService.loadProfilePicture(this.userData.id).then(pic => {
                            if (!this.isEmpty(pic.data[0].encode)) {
                                this.userImageURL = pic.data[0].encode;
                                this.profileService.uploadProfilePictureInLocal(pic.data[0].encode);
                            } else {
                                this.userImageURL = this.defaultImage;
                            }
                        });
                    } else {
                        this.userImageURL = data;
                    }
                });
            }
        });
    }

    /**
     * @description : Loading addresses on the map
     */
    loadMap(data: any) {

        var mainAddress: string;
        var secondaryAddress: string;
        if (data.estEmployeur) {
            mainAddress = data.employer.entreprises[0].siegeAdress.fullAdress;
            secondaryAddress = data.employer.entreprises[0].workAdress.fullAdress;
        } else {
            mainAddress = data.jobyer.personnalAdress.fullAdress;
            secondaryAddress = data.jobyer.workAdress.fullAdress;
        }

        if (mainAddress) {
            this.addrService.getLatLng(mainAddress).then(gData => {
                if (gData && gData.results && gData.results.length > 0) {
                    let latLng1 = new google.maps.LatLng(gData.results[0].geometry.location.lat,
                        gData.results[0].geometry.location.lng);
                    let mapOptions = {
                        //center: latLng1,
                        //zoom: 10,
                        draggable: false,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                    this.noMainAddress = false;
                    if (secondaryAddress) {

                        this.addrService.getLatLng(secondaryAddress).then(gData => {
                            if (gData && gData.results && gData.results.length > 0) {
                                let latLng2 = new google.maps.LatLng(gData.results[0].geometry.location.lat,
                                    gData.results[0].geometry.location.lng);
                                //new google.maps.LatLng(48.8762300, 2.3617500);
                                let addresses = [latLng1, latLng2];
                                let bounds = new google.maps.LatLngBounds();
                                this.addMarkers(addresses, bounds);
                                this.noSecondAddress = false;
                            } else {
                                this.noSecondAddress = true;
                                let addresses = [latLng1];
                                let bounds = new google.maps.LatLngBounds();
                                this.addMarkers(addresses, bounds);
                            }
                        });
                    } else {
                        this.noSecondAddress = true;
                        let addresses = [latLng1];
                        let bounds = new google.maps.LatLngBounds();
                        this.addMarkers(addresses, bounds);
                    }
                } else {
                    this.noMainAddress = true;
                    this.addrService.getLatLng(secondaryAddress).then(gData => {
                        if (gData && gData.results && gData.results.length > 0) {
                            let latLng2 = new google.maps.LatLng(gData.results[0].geometry.location.lat,
                                gData.results[0].geometry.location.lng);
                            let mapOptions = {
                                draggable: false,
                                //zoom: 5,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                            //new google.maps.LatLng(48.8762300, 2.3617500);
                            let addresses = [latLng2];
                            let bounds = new google.maps.LatLngBounds();
                            this.addMarkers(addresses, bounds);
                            this.noSecondAddress = false;
                        } else {
                            // No addresses
                            this.noSecondAddress = true;
                            let mapOptions = {
                                draggable: false,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                        }
                    });
                }
            });
        } else {
            this.noMainAddress = true;
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
                    this.noSecondAddress = false;
                } else {
                    // No addresses
                    this.noSecondAddress = true;
                    let mapOptions = {
                        draggable: false,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                }
            });
        }
    }

    /**
     * @description adding markers to map
     * @param addresses
     * @param bounds
     */
    addMarkers(addresses: any, bounds: any) {

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
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();
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
    writeStars(number: string): string {
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
        //dont go to picture modal if the picture is not yet uploaded in server
        if (this.userImageURL == "img/loading.gif") {
            return;
        }
        let pictureModel = Modal.create(ModalPicturePage, {picture: this.userImageURL});
        pictureModel.onDismiss(params => {
            /*var compressed = this.imageService.compressImage(params.uri);
             var decompressed = this.imageService.decompressImage(compressed);
             return;
             */
            if (!params) {
                return;
            }
            if (params.type == "picture") {
                this.userImageURL = "img/loading.gif";
                //save image locally
                // Split the base64 string in data and contentType
                /*var block = this.userImageURL.split(",");
                 var successs = this.imageService.savebase64AsImageFile("img/", this.userData.id + ".jpg", block[1], "image/jpg");
                 if(!success){
                 this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
                 return;
                 }*/
                this.profileService.uploadProfilePictureInServer(params.uri, this.userData.id).then(data => {
                    if (!data || data.status == "failure") {
                        this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
                        return;
                    } else {
                        //display new img
                        this.userImageURL = params.uri;
                        //if no image is chosen, display default avatar
                        if (params.uri == "") {
                            this.userImageURL = this.defaultImage;
                        }
                        //upload img in local storage
                        this.profileService.uploadProfilePictureInLocal(params.uri);
                        //publish event to change the picture in side manu
                        this.events.publish('picture-change', this.userImageURL);
                        console.log("profile picture successfuly uploaded");
                    }
                });
            }
            if (params.type == "avatar") {
                this.userImageURL = params.uri;
            }
        });
        this.nav.present(pictureModel);

    }

    goToBankAccount() {
        this.nav.push(BankAccountPage, {currentUser: this.userData, fromPage: "profil"});
    }

    goToInfoUserTabs() {
        this.nav.push(CivilityPage, {currentUser: this.userData, fromPage: "profil"});
    }

    goToPersonalAddressTab() {
        this.nav.push(PersonalAddressPage, {currentUser: this.userData, fromPage: "profil", selectedTab: 1});
    }

    goToJobAddressTab() {
        this.nav.push(JobAddressPage, {currentUser: this.userData, fromPage: "profil", selectedTab: 2});
    }

    isMapHidden() {
        if (this.noMainAddress && this.noSecondAddress) {
            return true;
        }
        if (this.isEmployer) {
            if (this.userData.employer.entreprises.length == 0) {
                return true;
            } else {
                if (!this.userData.employer.entreprises[0].siegeAdress.fullAdress && !this.userData.employer.entreprises[0].workAdress.fullAdress) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            if (!this.userData.jobyer.personnalAdress.fullAdress && !this.userData.jobyer.workAdress.fullAdress) {
                return true;
            } else {
                return false;
            }
        }
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}