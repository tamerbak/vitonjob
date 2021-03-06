import {Component, NgZone} from "@angular/core";
import {NavController, NavParams, AlertController, LoadingController, ToastController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {GlobalService} from "../../providers/global-service/global-service";
import {Geolocation} from "ionic-native";
import {SearchResultsPage} from "../search-results/search-results";
import {OfferAddPage} from "../offer-add/offer-add";
import {HomePage} from "../home/home";
import {AuthenticationService} from "../../providers/authentication-service/authentication-service";
import {Storage} from "@ionic/storage";

declare let google;

/**
 * @author Amal ROCHD
 * @description update job address for employers and jobyers
 * @module Authentication
 */
@Component({
  templateUrl: 'correspondence-address.html'
})
export class CorrespondenceAddressPage {
  public searchData: string;
  public geolocAddress;
  public geolocResult;
  public titlePage: string;
  public fromPage: string;
  public name: string;
  public street: string;
  public streetNumber: string;
  public zipCode;
  public city: string;
  public country: string;
  public isGooglePlaceHidden = true;
  public generalLoading;
  public projectTarget: string;
  //isAdrFormHidden = true;
  public currentUserVar: string;
  public isZipCodeValid = true;
  public nav: any;
  public themeColor: string;
  public isEmployer: boolean;
  public params: any;
  public currentUser: any;
  public selectedPlace: any;
  public alert: any;
  public loading: any;
  public toast: any;

  /**
   * @description While constructing the view, we get the currentEmployer passed as parameter from the connection page
   */
  constructor(public authService: AuthenticationService,
              params: NavParams,
              public gc: GlobalConfigs,
              nav: NavController,
              private globalService: GlobalService,
              private zone: NgZone, _alert: AlertController, _loading: LoadingController, _toast: ToastController, public storage: Storage) {
    this.nav = nav;
    //manually entered address
    this.searchData = "";
    //formatted geolocated address
    this.geolocAddress = "";
    //geolocated result
    this.geolocResult = null;
    this.alert = _alert;
    this.loading = _loading;
    this.toast = _toast;

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();
    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables and messages
    this.themeColor = config.themeColor;
    this.currentUserVar = config.currentUserVar;
    this.isEmployer = (this.projectTarget == 'employer');
    this.titlePage = "Adresse de correspondance";
    //this.tabs=tabs;
    //get current employer data from params passed by phone/mail connection
    this.params = params;
    this.currentUser = this.params.data.currentUser;
    this.fromPage = this.params.data.fromPage;
  }

  ionViewDidEnter() {
    //in case of user has already signed up
    this.initCorrespondenceAddressForm();
  }

  /**
   * @description initiate the job address form with data of the logged user
   */
  initCorrespondenceAddressForm() {
    this.storage.get(this.currentUserVar).then((value) => {
      //if user has already signed up, fill the address field with his data
      if (value) {
        this.currentUser = JSON.parse(value);
        if (this.isEmployer) {
          this.searchData = this.currentUser.employer.entreprises[0].correspondanceAdress.fullAdress;
          this.name = this.currentUser.employer.entreprises[0].correspondanceAdress.name;
          this.streetNumber = this.currentUser.employer.entreprises[0].correspondanceAdress.streetNumber;
          this.street = this.currentUser.employer.entreprises[0].correspondanceAdress.street;
          this.zipCode = this.currentUser.employer.entreprises[0].correspondanceAdress.zipCode;
          this.city = this.currentUser.employer.entreprises[0].correspondanceAdress.city;
          this.country = this.currentUser.employer.entreprises[0].correspondanceAdress.country;
          //for old users, retrieve address components from server bd and stocke them in local db
          if (!this.country && this.searchData) {
            this.authService.getAddressByUser(this.currentUser.employer.entreprises[0].id).then((data: any) => {
              this.name = data[2].name;
              this.streetNumber = data[2].streetNumber;
              this.street = data[2].street;
              this.zipCode = data[2].zipCode;
              this.city = data[2].city;
              this.country = data[2].country;
            });
          }
        }
        if (this.city) {
          //this.isAdrFormHidden = false;
          this.isGooglePlaceHidden = true;
        }
      }
      //if there is not a logged user or there is no address saced in the user data
      if (!value || !this.searchData) {
        //if(this.fromPage != "profil"){
        //geolocalisation alert
        this.displayRequestAlert();
      }
    });
  }

  /**
   * @description display the first request alert for geolocation
   */
  displayRequestAlert() {
    let confirm = this.alert.create({
      title: "Vit-On-Job",
      message: "Géolocalisation : êtes-vous connecté depuis votre lieu de correspondance" + "?",
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
    confirm.present();
  }

  /**
   * @description display the second request alert for geolocation
   */
  displayGeolocationAlert() {
    let confirm = this.alert.create({
      title: "Vit-On-Job",
      message: "Acceptez-vous d'être géolocalisé? Si oui, vous n'aurez qu'à valider votre adresse de correspondance",
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
    confirm.present();
  }

  /**
   * @description geolocate current user
   */
  geolocate() {
    this.generalLoading = this.loading.create({content:"Merci de patienter..."});
    this.generalLoading.present();
    let options = {timeout: 5000, enableHighAccuracy: true, maximumAge: 0};
    Geolocation.getCurrentPosition(options)
      .then((position) => {
        console.log(position);
        this.getAddressFromGeolocation(position);
      })
      .catch((error) => {
        console.log(error);
        this.generalLoading.dismiss();
        this.globalService.showAlertValidation("Vit-On-Job", "Impossible de vous localiser. Veuillez vérifier vos paramètres de localisation, ou saisissez votre adresse manuellement");
      });
  }

  /**
   * @description get formatted address from gps coordinates
   */
  getAddressFromGeolocation(position) {
    let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    new google.maps.Geocoder().geocode({'location': latLng}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        console.log(results[0].formatted_address);
        this.zone.run(() => {
          //display geolocated address in the searchbar
          this.searchData = results[0].formatted_address;
          //display geolocated address below the input
          this.geolocResult = results[0];
          this.geolocAddress = results[0].formatted_address;
          //display address components in appropriate inputs
          let adrObj: any = this.authService.decorticateGeolocAddress(this.geolocResult);
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
      } else {
        console.log(status);
        this.generalLoading.dismiss();
        this.globalService.showAlertValidation("Vit-On-Job", "Impossible de vous localiser. Veuillez vérifier vos paramètres de localisation, ou saisissez votre adresse manuellement");
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
    let adrObj: any = this.authService.decorticateGeolocAddress(this.selectedPlace);
    this.zone.run(() => {
      this.name = !adrObj.name ? '' : adrObj.name.replace("&#39;", "'");
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
  updateCorrespondenceAddress() {
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present().then(() => {
      if (this.isEmployer) {
        let entreprise = this.currentUser.employer.entreprises[0];
        let eid = "" + entreprise.id + "";
        // update job address
        this.authService.updateUserCorrespondenceAddress(eid, this.name, this.streetNumber, this.street, this.zipCode, this.city, this.country)
          .then((data: {status: string, error: string, _body: any}) => {
            if (!data || data.status == "failure") {
              console.log(data.error);
              loading.dismiss();
              this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
              return;
            } else {
              //id address not send by server
              entreprise.correspondanceAdress.id = JSON.parse(data._body).id;
              entreprise.correspondanceAdress.fullAdress = (this.name ? this.name + ", " : "") + (this.streetNumber ? this.streetNumber + ", " : "") + (this.street ? this.street + ", " : "") + (this.zipCode ? this.zipCode + ", " : "") + this.city + ", " + this.country;
              entreprise.correspondanceAdress.name = this.name;
              entreprise.correspondanceAdress.streetNumber = this.streetNumber;
              entreprise.correspondanceAdress.street = this.street;
              entreprise.correspondanceAdress.zipCode = this.zipCode;
              entreprise.correspondanceAdress.city = this.city;
              entreprise.correspondanceAdress.country = this.country;
              this.currentUser.employer.entreprises[0] = entreprise;
              this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
              loading.dismiss();
              if (this.fromPage == "profil") {
                this.nav.pop();
              } else {
                let jobyer = this.params.data.jobyer;
                let searchIndex = this.params.data.searchIndex;
                let obj = this.params.data.obj;
                let offer = this.params.data.currentOffer;
                if (obj == "profileInompleted") {
                  this.nav.push(SearchResultsPage, {
                    jobyer: jobyer,
                    obj: obj,
                    searchIndex: searchIndex,
                    currentOffer: offer
                  });
                  return;
                }
                if (obj == "forRecruitment") {
                  this.nav.push(OfferAddPage, {jobyer: jobyer, obj: obj, searchIndex: searchIndex});
                } else {
                  //redirecting to offer list page
                  this.nav.setRoot(HomePage).then(() => {
                    this.presentToast("Félicitations, vous venez de créer votre compte avec succès. Vous pouvez maintenant créer vos offres de service.", 7);
                  });
                }
              }
            }
          });
      }
    });
  }

  copyPersonalAddress() {
    if (this.isEmployer) {
      this.searchData = this.currentUser.employer.entreprises[0].siegeAdress.fullAdress;
      this.name = this.currentUser.employer.entreprises[0].siegeAdress.name;
      this.streetNumber = this.currentUser.employer.entreprises[0].siegeAdress.streetNumber;
      this.street = this.currentUser.employer.entreprises[0].siegeAdress.street;
      this.zipCode = this.currentUser.employer.entreprises[0].siegeAdress.zipCode;
      this.city = this.currentUser.employer.entreprises[0].siegeAdress.city;
      this.country = this.currentUser.employer.entreprises[0].siegeAdress.country;
    }
    this.isGooglePlaceHidden = true;
    //this.isAdrFormHidden = false;
  }

  isAddressModified() {
    if (this.isEmployer) {
      return (this.searchData != this.currentUser.employer.entreprises[0].workAdress.fullAdress) || (this.selectedPlace != this.currentUser.employer.entreprises[0].workAdress.fullAdress);
    }
  }

  showGooglePlaceInput() {
    this.isGooglePlaceHidden = false;
  }

  isBtnDisabled() {
    if (this.city && this.country && this.zipCode && this.isZipCodeValid) {
      return false;
    } else {
      return true;
    }
  }

  watchZipCode(e) {
    if (this.zipCode) {
      if (e.target.value.indexOf('.') != -1) {
        e.target.value = e.target.value.replace('.', '');
        this.zipCode = e.target.value;
        return;
      }
      if (e.target.value.length > 5) {
        e.target.value = e.target.value.substring(0, 5);
        this.zipCode = e.target.value;
        return;
      }
    }
  }

  validateZipCode(e) {
    if (e.target.value.length == 5) {
      this.isZipCodeValid = true;
    } else {
      this.isZipCodeValid = false;
    }
  }

  presentToast(message: string, duration: number) {
    let toast = this.toast.create({
      message: message,
      duration: duration * 1000
    });
    toast.present();
  }
}
