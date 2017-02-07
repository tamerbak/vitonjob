import {Component, NgZone} from "@angular/core";
import {NavController, ModalController, NavParams} from "ionic-angular";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Camera} from "ionic-native";
import {AttachementsService} from "../../providers/attachements-service/attachements-service";
import {AttachementsPage} from "../attachements/attachements";
import {Utils} from "../../utils/utils";
import {Storage} from "@ionic/storage";


@Component({
  templateUrl: 'modal-attachement.html'
})
export class ModalAttachementPage {

  public scanUri: string;
  public fileName: string;
  //scanTitle: string;
  public themeColor: string;
  public projectTarget: any;
  public user: any;
  public handler: AttachementsPage;
  public isEmployer: boolean;

  constructor(private nav: NavController,
              private zone: NgZone,
              public gc: GlobalConfigs,
              private service: AttachementsService, private params: NavParams, public modal: ModalController, public db: Storage) {

    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    this.isEmployer = this.projectTarget === 'employer';

    // Set local variables and messages
    this.themeColor = config.themeColor;
    let currentUserVar = config.currentUserVar;

    this.db.get(currentUserVar).then(usr => {
      if (usr) {
        this.user = JSON.parse(usr);
      }
    });

    this.handler = this.params.data.handler;
  }

  onChangeUpload(e) {
    let file = e.target.files[0];
    let myReader = new FileReader();
    this.zone.run(() => {
      myReader.onloadend = (e) => {
        this.scanUri = myReader.result;
      };
      myReader.readAsDataURL(file);
    });
  }

  takePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
      this.zone.run(() => {
        // imageData is a base64 encoded string
        this.scanUri = "data:image/jpeg;base64," + imageData;
      });
    }, (err) => {
      console.log(err);
    });
  }

  showModal() {
    let modal = this.modal.create(ModalGalleryPage, {scanUri: this.scanUri});
    modal.present();
  }

  onDelete(e) {
    this.scanUri = null;
  }

  saveFile() {
    if (!this.scanUri || this.scanUri == null) {
      this.nav.pop();
      return;
    }

    this.service.uploadFile(this.user, this.fileName, this.scanUri).then((data: any) => {
      this.handler.appendFile(data);
      this.nav.pop();
    });
  }

  isEmpty(str) {
    return Utils.isEmpty(str);
  }
}
