import {Component} from "@angular/core";
import {NavController, Storage, SqlStorage, Modal, Alert} from "ionic-angular";
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

    constructor(private nav: NavController,
                private service: AttachementsService,
                public globalConfig: GlobalConfigs) {
        this.db = new Storage(SqlStorage);
        this.projectTarget = globalConfig.getProjectTarget();
        this.isEmployer = this.projectTarget === 'employer';
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        let currentUserVar = config.currentUserVar;
        this.db.get(currentUserVar).then(usr => {
            if (usr) {
                this.user = JSON.parse(usr);
                this.service.loadAttachements(this.user).then(data=> {
                    this.attachments = data;
                });
            }
        });
    }

    downloadAttachement(a) {
        this.service.downloadActualFile(a.id, a.fileName).then(data => {
            let scan = data.stream;
            let modal = Modal.create(ModalGalleryPage, {scanUri: scan});
            this.nav.present(modal);
        })
    }

    deleteAttachment(a) {
        let alert = Alert.create({
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
        this.nav.present(alert);
    }

    newAttachement() {
        this.nav.push(ModalAttachementPage, {handler: this});
    }

    appendFile(a) {
        this.attachments.push(a);
    }
}