import {NavController, PickerController, ModalController, Events, ToastController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";
import {SettingsPage} from "../settings/settings";
import {ModalPicturePage} from "../modal-picture/modal-picture";
import {UserService} from "../../providers/user-service/user-service";
import {AddressService} from "../../providers/address-service/address-service";
import {CivilityPage} from "../civility/civility";
import {PersonalAddressPage} from "../personal-address/personal-address";
import {JobAddressPage} from "../job-address/job-address";
import {CorrespondenceAddressPage} from "../correspondence-address/correspondence-address";
import {BankAccountPage} from "../bank-account/bank-account";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {GlobalService} from "../../providers/global-service/global-service";
import {ImageService} from "../../providers/image-service/image-service";
import {ProfileQualitiesPage} from "../profile-qualities/profile-qualities";
import {ProfileLanguagesPage} from "../profile-languages/profile-languages";
import {ProfileSlotsPage} from "../profile-slots/profile-slots";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
import {Storage} from "@ionic/storage";
import {Utils} from "../../utils/utils";

/*
 Generated class for the ProfilePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */

declare let google: any;

@Component({
  templateUrl: 'profile.html',
  selector: 'profile'
})
export class ProfilePage {
  public themeColor: string;
  public inversedThemeColor: string;
  public isEmployer: boolean;
  public projectTarget: string;
  public userImageURL: string;
  public thirdThemeColor: string;
  public map: any;
  public swipEvent: any;
  public userData: any;
  public userService: any;
  public addrService: any;
  public backgroundImage: any;
  public noMainAddress = false;
  public noSecondAddress = false;
  public isRecruiter = false;
  public currentUserVar: string;
  public profilPictureVar: string;
  public defaultImage: string;
  public slots: any;
  public backGroundColor:string;
  public isNewUser: boolean = true;
  public toast: any;

  constructor(public nav: NavController,
              public gc: GlobalConfigs,
              userService: UserService,
              addrService: AddressService,
              private globalService: GlobalService,
              private profileService: ProfileService,
              private imageService: ImageService,
              public events: Events,
              public picker: PickerController,
              private _toast: ToastController,
              public modal: ModalController, public storage: Storage) {


    this.projectTarget = gc.getProjectTarget();


    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    //Initializing page:
    this.initializePage(config);
    this.thirdThemeColor = gc.getThirdThemeColor();
    this.userService = userService;
    this.addrService = addrService;
    this.defaultImage = config.userImageURL;
    this.userImageURL = "none";
    this.toast = _toast;
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
    this.backGroundColor = config.backGroundColor;
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
            siegeAdress: {fullAdress: ""},
            correspondanceAdress: {fullAdress: ""}
          }
        ]
      }
    }
  }

  ionViewWillEnter() {
    console.log('••• On Init');
    //Get User information
    this.storage.get(this.currentUserVar).then((data: any) => {
      if (data) {

        this.userData = JSON.parse(data);

        this.isNewUser = (this.isEmployer ? (Utils.isEmpty(this.userData.nom) || Utils.isEmpty(this.userData.prenom) || Utils.isEmpty(this.userData.employer.entreprises[0].nom)) : (Utils.isEmpty(this.userData.nom) || Utils.isEmpty(this.userData.prenom)))

        this.isRecruiter = this.userData.estRecruteur;
        if (!this.isRecruiter)
          this.loadMap(this.userData);

        //load profile picture
        this.storage.get(this.profilPictureVar).then((data: any) => {
          //if profile picture is not stored in local, retrieve it from server
          if (this.isEmpty(data)) {
            this.profileService.loadProfilePicture(this.userData.id, '', '').then((pic: {data: Array<any>}) => {
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

    let mainAddress: string;
    let secondaryAddress: string;
    let thirdAddress: string;
    if (data.estEmployeur) {
      mainAddress = data.employer.entreprises[0].siegeAdress.fullAdress;
      secondaryAddress = data.employer.entreprises[0].workAdress.fullAdress;
      thirdAddress = data.employer.entreprises[0].correspondanceAdress.fullAdress;
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
    let picker = this.picker.create();
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
    picker.present();
  }

  /**
   * writing stars
   * @param number of stars writed
   */
  writeStars(number: number): string {
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
    if (this.userImageURL == "assets/img/loading.gif") {
      return;
    }
    let pictureModel = this.modal.create(ModalPicturePage, {picture: this.userImageURL});
    pictureModel.onDidDismiss(params => {
      /*var compressed = this.imageService.compressImage(params.uri);
       let decompressed = this.imageService.decompressImage(compressed);
       return;
       */
      if (!params) {
        return;
      }
      if (params.type == "picture") {
        this.userImageURL = "assets/img/loading.gif";
        //save image locally
        // Split the base64 string in data and contentType
        /*var block = this.userImageURL.split(",");
         let successs = this.imageService.savebase64AsImageFile("assets/img/", this.userData.id + ".jpg", block[1], "image/jpg");
         if(!success){
         this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
         return;
         }*/
        this.profileService.uploadProfilePictureInServer(params.uri, this.userData.id).then((data: any) => {
          if (!data || data.status == "failure") {
            this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
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
    pictureModel.present();

  }

  goToBankAccount() {
    if(this.isNewUser){
      this.presentToast("Veuillez renseigner les informations de votre profil avant d'accéder aux coordonnées bancaires", 3);
    }else{
      this.nav.push(BankAccountPage, {currentUser: this.userData, fromPage: "profil"});
    }
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

  goToCorrespondenceAddressTab() {
    this.nav.push(CorrespondenceAddressPage, {currentUser: this.userData, fromPage: "profil", selectedTab: 3});
  }

  showProfileQualities() {
    this.nav.push(ProfileQualitiesPage, {currentUser: this.userData, isEmployer: this.isEmployer});
  }

  showProfileLanguages() {
    this.nav.push(ProfileLanguagesPage, {currentUser: this.userData, isEmployer: this.isEmployer});
  }

  showProfileSlots() {
    this.profileService.getUserDisponibilite(this.userData.jobyer.id).then((res: any) => {
      let modal = this.modal.create(ProfileSlotsPage, {savedSlots: res});
      modal.present();
      modal.onDidDismiss((data: any) => {
        this.slots = data.slots;
        this.profileService.deleteDisponibilites(this.userData.jobyer.id).then((data: any) => {
          if (data.status == 'success') {
            this.profileService.saveDisponibilites(this.userData.jobyer.id, this.slots);
          }
        })
      })
    })

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

  presentToast(message: string, duration?: number, position?: string) {
    if (!duration)
      duration = 3;
    let toast = this.toast.create({
      message: message,
      position: position,
      showCloseButton: true,
      closeButtonText: "Ok",
      duration: duration * 1000
    });
    toast.present();
  }
}
