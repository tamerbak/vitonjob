import { Component } from '@angular/core';
import {NavController, Storage, SqlStorage, Modal, Alert, Loading} from 'ionic-angular';
import {AttachementsService} from "../../providers/attachements-service/attachements-service";
import {ModalAttachementPage} from "../modal-attachement/modal-attachement";
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";

@Component({
    templateUrl: 'build/pages/attachements/attachements.html',
    providers:[AttachementsService]
})
export class AttachementsPage {
    attachments : any =[];
    db : Storage;
    user : any;

    constructor(private nav: NavController,
                private service : AttachementsService ) {
        this.db = new Storage(SqlStorage);
        this.db.get("currentUser").then(usr => {
            if(usr){
                this.user = JSON.parse(usr);
                this.service.loadAttachements(this.user).then(data=>{
                    this.attachments = data;
                });
            }
        });
    }

    downloadAttachement(a){
        this.service.downloadActualFile(a.id, a.fileName).then(data => {
            let scan = data.stream;
            let modal = Modal.create(ModalGalleryPage, {scanUri: scan});
            this.nav.present(modal);
        })
    }

    deleteAttachment(a){
        /*let alert = Alert.create({
            title : 'Supprimer ce document',
            message : '',
        });*/
    }

    newAttachement(){
        this.nav.push(ModalAttachementPage, {handler : this});
    }

    appendFile(a){
        this.attachments.push(a);
    }
}
