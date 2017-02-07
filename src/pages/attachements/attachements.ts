import {Component} from "@angular/core";
import {NavController, ModalController, AlertController} from "ionic-angular";
import {AttachementsService} from "../../providers/attachements-service/attachements-service";
import {ModalAttachementPage} from "../modal-attachement/modal-attachement";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Storage} from "@ionic/storage";

@Component({
  templateUrl: 'attachements.html'
})
export class AttachementsPage {
  public attachments: any = [];
  public user: any;
  public projectTarget: string;
  public isEmployer: boolean;
  public backgroundImage: string;
  public themeColor: string;
  public emptySafe: boolean;
  public modal: any;
  public alert: any;
  public backGroundColor:string;

  constructor(private nav: NavController,
              private service: AttachementsService,
              public globalConfig: GlobalConfigs, _modal: ModalController, _alert: AlertController, public db: Storage) {
    this.modal = _modal;
    this.alert = _alert;
    this.projectTarget = globalConfig.getProjectTarget();
    this.isEmployer = this.projectTarget === 'employer';
    let config = Configs.setConfigs(this.projectTarget);
    this.backGroundColor= config.backGroundColor;
    this.themeColor = config.themeColor;
    this.backgroundImage = config.backgroundImage;
    let currentUserVar = config.currentUserVar;
    this.emptySafe = false;
    this.db.get(currentUserVar).then(usr => {
      if (usr) {
        this.user = JSON.parse(usr);
        this.service.loadAttachements(this.user).then((data: any) => {
          this.attachments = data;
          if (!this.attachments || this.attachments.length == 0) {
            this.emptySafe = true;
          }
        });
      }
    });
  }

  downloadAttachement(a) {
    this.service.downloadActualFile(a.id, a.fileName).then((data: {stream: any}) => {
      let scan = data.stream;
      let modal = this.modal.create(ModalGalleryPage, {scanUri: scan});
      modal.present();
    })
  }

  deleteAttachment(a) {
    let alert = this.alert.create({
      title: 'Supprimer ce document',
      message: 'Etes-vous sûr de vouloir supprimer ce document ?',
      buttons: [{
        text: 'Annuler',
        role: 'cancel'
      },
        {
          text: 'Supprimer',
          handler: () => {
            this.service.deleteAttachement(a);
            let i = this.attachments.indexOf(a);
            this.attachments.splice(i, 1);
          }
        }]
    });
    alert.present();
  }

  newAttachement() {
    this.nav.push(ModalAttachementPage, {handler: this});
  }

  appendFile(a) {
    this.attachments.push(a);
  }
}
