import {Component} from "@angular/core";
import {NavController, NavParams, Loading, Toast, Platform} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AdvertService} from "../../providers/advert.service";
import {Utils} from "../../utils/utils";
import {OfferDetailPage} from "../offer-detail/offer-detail";
import {Transfer} from 'ionic-native';
import {FileUtils} from "../../utils/fileUtils";
declare var cordova: any;

@Component({
  templateUrl: 'build/pages/advert-edit/advert-edit.html',
  providers: [AdvertService]
})
export class AdvertEditPage{

  projectTarget: string;
  backgroundImage: any;
  db: Storage;
  isHunter: boolean = false;
  isEmployer: boolean;
  themeColor: any;
  advert: any;
  attachFilename: string;

  constructor(public nav: NavController,
              public navParams: NavParams,
              public gc: GlobalConfigs,
              private advertService: AdvertService,
              private platform: Platform) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    this.isHunter = gc.getHunterMask();

    // Set local variables and messages
    this.isEmployer = (this.projectTarget == 'employer');
    this.themeColor = config.themeColor;
    this.backgroundImage = config.backgroundImage;
    this.platform = platform;
    this.advert = navParams.get('advert');
    this.advert.hasOffer = (this.advert.offerId != 0 && !Utils.isEmpty(this.advert.offerId) ? true : false);
    this.attachFilename = this.advert.attachement.fileContent.split(';')[0];
  }

  goToOffer() {
    let loading = Loading.create({
      content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
      spinner: 'hide',
    });
    this.nav.present(loading).then(() => {
      this.advertService.getOfferById(this.advert.offerId).then((data: any) => {
        this.nav.push(OfferDetailPage, {selectedOffer: data, obj: "detail"});
        loading.dismiss();
      })
    });
  }

  downloadAttachement() {
    let isSuccess = false;
    let content = this.advert.attachement.fileContent.split(';')[1];
    let contentType = "";
    let folderpath = cordova.file.externalRootDirectory;

    // Convert the base64 string in a Blob
    var DataBlob = FileUtils.b64toBlob(content, contentType);
    console.log("Starting to write the file");
    window.resolveLocalFileSystemURL(folderpath, (dir) => {
      console.log("Access to the directory granted succesfully");
      dir.getFile(this.attachFilename, {create: true}, (file) => {
        console.log("File created succesfully.");
        file.createWriter((fileWriter) => {
          console.log("Writing content to file");
          fileWriter.write(DataBlob);
          this.presentToast("Document sauvegardé dans le stockage local de votre appareil.", 3);
        }, () => {
          this.presentToast("Une erreur est survenue lors du téléchargement. Veuillez réessayer.", 3);
        });
      });
    });
  }

  presentToast(message: string, duration: number) {
    let toast = Toast.create({
      message: message,
      duration: duration * 1000
    });
    this.nav.present(toast);
  }
}