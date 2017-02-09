import {Component} from "@angular/core";
import {NavController, NavParams, ViewController, ModalController, ToastController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {Utils} from "../../utils/utils";
import {FileUtils} from "../../utils/fileUtils";
import {DateUtils} from "../../utils/date-utils";

declare var cordova: any;
declare var window;

@Component({
  templateUrl: 'modal-profile-jobyer.html',
  selector:'modal-profile-jobyer'
})

export class ModalProfileJobyerPage {
  public projectTarget: string;
  public themeColor: string;
  public isEmployer: boolean;
  public viewCtrl: ViewController;

  public jobyer: any;
  public scanTitle: string;
  public isFrench: boolean = true;
  public isEuropean: boolean = true;
  public isCIN: any;
  public scanUri: string;

  constructor(public nav: NavController,
              viewCtrl: ViewController,
              public gc: GlobalConfigs,
              public navParams: NavParams,
              private profileService: ProfileService,
              public modal: ModalController,
              public toast: ToastController) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget == 'employer');
    this.viewCtrl = viewCtrl;

    this.jobyer = this.navParams.data.jobyer;
  }

  /**
   * @description show modal
   */
  showModal() {
    let m = this.modal.create(ModalGalleryPage, {scanUri: this.scanUri});
    m.present();
  }

  downloadCV(){
    let contentArray = this.jobyer.cv.split(';');
    let content = contentArray[1];
    let contentType = contentArray[0].split('.')[1];
    let folderpath = cordova.file.externalRootDirectory;

    // Convert the base64 string in a Blob
    var DataBlob = FileUtils.b64toBlob(content, contentType);
    console.log("Starting to write the file");
    window.resolveLocalFileSystemURL(folderpath, (dir) => {
      console.log("Access to the directory granted succesfully");
      dir.getFile(contentArray[0], {create: true}, (file) => {
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

  closeModal() {
    this.viewCtrl.dismiss();
  }

  isEmpty(str) {
    return Utils.isEmpty(str);
  }

  toDateString(d: number){
    return DateUtils.toDateString(d);
  }

  parseInt(n){
    return parseInt(n);
  }
}
