import {Component, NgZone} from "@angular/core";
import {NavController, NavParams, LoadingController, ToastController, ModalController, AlertController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AdvertService} from "../../providers/advert-service/advert-service";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Utils} from "../../utils/utils";
import {Storage} from "@ionic/storage";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {FileUtils} from "../../utils/fileUtils";
import {AdvertListPage} from "../advert-list/advert-list";
import {GlobalService} from "../../providers/global-service/global-service";
import {OfferAddPage} from "../offer-add/offer-add";
import {OfferDetailPage} from "../offer-detail/offer-detail";

declare let cordova, window: any;

@Component({
  templateUrl: 'advert-edit.html',
  selector: 'advert-edit'
})
export class AdvertEditPage{

  public projectTarget: string;
  public backgroundImage: any;
  public isEmployer: boolean;
  public themeColor: any;
  public advert: any;
  public attachFilename: string;
  public contractForm = [];
  public jobyerInterestLabel: string;
  public currentUser: any;
  public jobyerInterested: boolean;
  public contractFormArray: any[] = [];
  public modal: any;
  public idAdvert: string;
  public IdOffer: any;

  constructor(public nav: NavController,
              public navParams: NavParams,
              public gc: GlobalConfigs,
              public advertService: AdvertService,
              public offerService: OffersService,
              public loadingCtrl: LoadingController,
              public toast: ToastController,
              private _modal: ModalController,
              private zone: NgZone,
              public globalService: GlobalService,
              public alert: AlertController,
              public storage: Storage) {

  // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.isEmployer = (this.projectTarget == 'employer');
    this.themeColor = config.themeColor;
    this.backgroundImage = config.backgroundImage;
    this.modal = _modal;
    this.advert = {
      'class': 'com.vitonjob.annonces.Annonce',
      idEntreprise: 0,
      titre: '',
      description: '',
      attachement: {
        'class': 'com.vitonjob.annonces.Attachement',
        code: 0,
        status: '',
        fileContent: ''
      },
      thumbnail: {
        'class': 'com.vitonjob.annonces.Attachement',
        code: 0,
        status: '',
        fileContent: ''
      },
      imgbg: {
        'class': 'com.vitonjob.annonces.Attachement',
        code: 0,
        status: '',
        fileContent: ''
      },
      contractForm: ''
    };

    if(navParams.get('fromPage')=="offer-details" && !Utils.isEmpty(navParams.get('idOffer'))){
      this.IdOffer = navParams.get('idOffer');
    }
    //in the case of editing an existing advert
    if(navParams.get('advert')){
      //javascript passes objects by reference, therefore advert param must be cloned to prevent modifying it
      let clonedAdvert = (JSON.parse(JSON.stringify(navParams.get('advert'))));
      this.advert = clonedAdvert;

      this.idAdvert = this.advert.id;
      this.advert.hasOffer = (this.advert.offerId != 0 && !Utils.isEmpty(this.advert.offerId) ? true : false);
      this.attachFilename = this.advert.attachement.fileContent.split(';')[0];
      this.contractFormArray = (Utils.isEmpty(this.advert.contractForm) ? [] : this.advert.contractForm.split(";"));
    }

    this.storage.get(config.currentUserVar).then((value) => {
      if (value) {
        this.currentUser = JSON.parse(value);
        this.advert.idEntreprise = this.currentUser.employer.entreprises[0].id;
      }
    });
  }

  prepareImageForSaving(obj, name) {
    let content = obj.fileContent;
    if (!this.isEmpty(content)) {
      let prefix = content.split(',')[0];
      prefix = prefix.split(';')[0];
      let ext = prefix.split('/')[1];
      let base64 = name + '.' + ext + ";" + content.split(',')[1];
      obj.fileContent = base64;
      obj.fileName = name + '.' + ext;
    }
  }

  prepareDataForSaving(advert) {
    //description
    advert.description = btoa(advert.description);

    //contract form
    advert.contractForm = this.contractFormArray.join(';');
  }

  /**
   * @description read the file to upload and convert it to base64
   */
  onChangeUpload(e, obj) {
    let file = e.target.files[0];
    let myReader = new FileReader();
    this.zone.run(() => {
      myReader.onloadend = (e) => {
        let fileContent = myReader.result;
        let content = fileContent.split(',')[1];
        let base64 = file.name + ";" + content;

        if(obj == 'thumb'){
          this.advert.thumbnail.fileName = file.name;
          this.advert.thumbnail.fileContent = myReader.result;
        }
        if(obj == 'cover'){
          this.advert.imgbg.fileName = file.name;
          this.advert.imgbg.fileContent = myReader.result;
        }
        if(obj == 'pj'){
          this.advert.attachement.fileContent = base64;
          this.advert.attachement.fileName = file.name;
        }
      }
      myReader.readAsDataURL(file);
    });
  }

  showModal(obj) {
    let uri = '';
    if(obj == 'thumb'){
      uri = this.advert.thumbnail.fileContent;
    }
    if(obj == 'cover'){
      uri = this.advert.imgbg.fileContent;
    }
    let modal = this.modal.create(ModalGalleryPage, {scanUri: uri});
    modal.present();
  }

  onDelete(e, obj) {
    let fileinput;
    if(obj == 'thumb'){
      this.advert.thumbnail.fileContent = null;
      fileinput = document.getElementById('fileinputThumb');
    }
    if(obj == 'cover'){
      this.advert.imgbg.fileContent = null;
      fileinput = document.getElementById('fileinputCover');
    }

    if(obj == 'pj'){
      this.advert.attachement.fileContent = null;
      fileinput = document.getElementById('pjInput');
    }

    (<HTMLInputElement>fileinput).value = "";
  }

  downloadAttachement() {
    let content = this.advert.attachement.fileContent.split(';')[1];
    let contentType = "";
    let folderpath = cordova.file.externalRootDirectory;

    // Convert the base64 string in a Blob
    let DataBlob = FileUtils.b64toBlob(content, contentType);
    console.log("Starting to write the file");
    window.resolveLocalFileSystemURL(folderpath, (dir) => {
      console.log("Access to the directory granted succesfully");
      dir.getFile(this.attachFilename, {create: true}, (file) => {
        console.log("File created succesfully.");
        file.createWriter((fileWriter) => {
          console.log("Writing content to file");
          fileWriter.write(DataBlob);
          this.presentToast("Document sauvegardé dans le stockage local de votre appareil.", 7);
        }, () => {
          this.presentToast("Une erreur est survenue lors du téléchargement. Veuillez réessayer.", 7);
        });
      });
    });
  }

  saveAdvert(){
    //let loading = this.loadingCtrl.create({content:"Merci de patienter..."});
    //loading.present();
    let clonedAdvert = (JSON.parse(JSON.stringify(this.advert)));
    this.prepareDataForSaving(clonedAdvert);
    this.prepareImageForSaving(clonedAdvert.thumbnail, 'thumbnail');
    this.prepareImageForSaving(clonedAdvert.imgbg, 'cover');
    if(!Utils.isEmpty(clonedAdvert.id)) {
      this.advertService.updateAdvert(clonedAdvert).then((result: any) => {
        if (result && result.status == 'success') {
          //loading.dismiss();
          //this.displayRequestAlert();
          this.nav.pop();
          //this.nav.popTo(OfferAddPage,{advertId: clonedAdvert});
        } else {
          //loading.dismiss();
          this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
          return;
        }
      });
    }else{
      
      this.advertService.saveAdvert(clonedAdvert).then((result: any) => {
        if(result.id != 0) {
          this.idAdvert = result.id;
          //loading.dismiss();
          //this.displayRequestAlert();
          if(this.navParams.get("fromPage")=='offer-details'){
            this.advertService.updateOfferWithAdvert(this.idAdvert, this.IdOffer).then((data: any) => {
              console.log("offer updated with advert id");
              this.nav.pop();
            });
            
          }else{
            this.storage.set('advert', {id: this.idAdvert, value:clonedAdvert}).then(()=>{
            this.nav.pop();
            clonedAdvert.id = result.id;
              // Now saving the heavy part of request via an update request
              this.advertService.updateAdvert(clonedAdvert).then((result: any) => {
                if (result && result.status == 'success') {
                  console.log('Advert number '+ this.idAdvert + ' is updated with files contents');
                } else {
                  //loading.dismiss();
                  this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                  return;
                }
              });
            });
          }
        } else {
          //loading.dismiss();
          this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
          return;
        }
      });
    }
  }

  displayRequestAlert() {
    let confirm = this.alert.create({
      title: "Vit-On-Job",
      message: "Offre : Voulez-vous " + ((Utils.isEmpty(this.idAdvert) || Utils.isEmpty(this.advert.offerId)) ? "créer une offre et l'associer à cette annonce " : " modifier l'offre associée à cette annonce" ) + " ?",
      buttons: [
        {
          text: 'Non',
          handler: () => {
            console.log('No clicked');
            this.nav.push(AdvertListPage);
          }
        },
        {
          text: 'Oui',
          handler: () => {
            console.log('Yes clicked');
            this.gotoOffer();
          }
        }
      ]
    });
    confirm.present();
  }

  gotoOffer(){
    if (Utils.isEmpty(this.advert.offerId)) {
      this.nav.push(OfferAddPage, {adv: this.idAdvert});
    } else {
      let offer = this.offerService.getOfferByIdFromLocal(this.currentUser, this.advert.offerId);
      this.nav.push(OfferDetailPage, {selectedOffer: offer});
    }
  }

  isUpdateDisabled(){
    return this.isEmpty(this.advert.titre);
  }

  presentToast(message: string, duration: number) {
    let toast = this.toast.create({
      message: message,
      duration: duration * 1000
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  isEmpty(str){
    return Utils.isEmpty(str);
  }
}

