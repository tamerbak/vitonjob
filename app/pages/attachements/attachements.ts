import {Component} from "@angular/core";
import {NavController, Storage, SqlStorage, ModalController, AlertController} from "ionic-angular";
import {AttachementsService} from "../../providers/attachements-service/attachements-service";
import {ModalAttachementPage} from "../modal-attachement/modal-attachement";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

@Component({
    templateUrl: 'build/pages/attachements/attachements.html',
    providers: [AttachementsService]
})
export class AttachementsPage {
    attachments: any = [];
    db: Storage;
    user: any;
    projectTarget: string;
    isEmployer: boolean;
    backgroundImage: string;
    themeColor: string;
    emptySafe:boolean;
    modal:any;
    alert:any;

    constructor(private nav: NavController,
                private service: AttachementsService,
                public globalConfig: GlobalConfigs, _modal:ModalController, _alert: AlertController) {
        this.db = new Storage(SqlStorage);
        this.modal = _modal;
        this.alert = _alert;
        this.projectTarget = globalConfig.getProjectTarget();
        this.isEmployer = this.projectTarget === 'employer';
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        let currentUserVar = config.currentUserVar;
        this.emptySafe  = false;
        this.db.get(currentUserVar).then(usr => {
            if (usr) {
                this.user = JSON.parse(usr);
                this.service.loadAttachements(this.user).then((data:any) => {
                    this.attachments = data;
                    if(!this.attachments || this.attachments.length == 0){
                        this.emptySafe = true;
                    }
                });
            }
        });
    }

    downloadAttachement(a) {
        this.service.downloadActualFile(a.id, a.fileName).then((data: {stream:any}) => {
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