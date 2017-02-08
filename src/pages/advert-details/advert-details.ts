import {Component} from "@angular/core";
import {NavController, NavParams, LoadingController, ToastController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AdvertService} from "../../providers/advert-service/advert-service";
import {Utils} from "../../utils/utils";
import {OfferDetailPage} from "../offer-detail/offer-detail";
import {FileUtils} from "../../utils/fileUtils";
import {Storage} from "@ionic/storage";

declare let cordova: any;
declare let window;

@Component({
  templateUrl: 'advert-details.html',
  selector: 'advert-details'
})
export class AdvertDetailsPage{

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

  constructor(public nav: NavController,
              public navParams: NavParams,
              public gc: GlobalConfigs,
              public advertService: AdvertService,
              public loadingCtrl: LoadingController,
              public toast: ToastController,
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
    this.advert = navParams.get('advert');
    this.advert.hasOffer = (this.advert.offerId != 0 && !Utils.isEmpty(this.advert.offerId) ? true : false);
    this.attachFilename = this.advert.attachement.fileContent.split(';')[0];
    this.contractForm = (Utils.isEmpty(this.advert.contractForm) ? [] : this.advert.contractForm.split(";"));

    //get currentuser
    this.storage.get(config.currentUserVar).then((value) => {
      if (value) {
        this.currentUser = JSON.parse(value);
        if(!this.isEmployer){
          this.setInterestButtonLabel();
        }
      }
    });
  }

  goToOffer() {
    let loading = this.loadingCtrl.create({content:"Merci de patienter..."});
    loading.present();
    this.advertService.getOfferById(this.advert.offerId).then((data: any) => {
      this.nav.push(OfferDetailPage, {selectedOffer: data, modifyOffer: false});
      loading.dismiss();
    })
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

  saveAdvertInterest(){
    let currentJobyerId = this.currentUser.jobyer.id;
    if(this.jobyerInterested){
      this.advertService.deleteAdvertInterest(this.advert.id, currentJobyerId).then((data: any) => {
        if(data && data.status == 'success') {
          this.jobyerInterestLabel = "Cette annonce m'intéresse";
          this.jobyerInterested = false;
        }
      });
    }else{
      this.advertService.saveAdvertInterest(this.advert.id, currentJobyerId).then((data: any) => {
        if(data && data.status == 'success'){
          this.jobyerInterestLabel = "Cette annonce ne m'intéresse plus";
          this.jobyerInterested = true;
        }
      });
    }
  }

  setInterestButtonLabel(){
    let currentJobyerId = this.currentUser.jobyer.id;
    this.advertService.getInterestAnnonce(this.advert.id, currentJobyerId).then((data: any) => {
      if(data && data.data && data.data.length  == 1){
        this.jobyerInterested = true;
        this.jobyerInterestLabel = "Cette annonce ne m'intéresse plus";
      }else{
        this.jobyerInterested = false;
        this.jobyerInterestLabel = "Cette annonce m'intéresse";
      }
    });
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
}