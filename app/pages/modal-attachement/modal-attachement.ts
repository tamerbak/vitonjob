import {Component} from '@angular/core';
import {NavController, Modal, Storage, SqlStorage, NavParams} from 'ionic-angular';
import {ModalGalleryPage} from "../modal-gallery/modal-gallery";
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Camera} from "ionic-native/dist/index";
import {NgZone} from '@angular/core';
import {AttachementsService} from "../../providers/attachements-service/attachements-service";
import {AttachementsPage} from "../attachements/attachements";


@Component({
    templateUrl: 'build/pages/modal-attachement/modal-attachement.html',
    providers : [GlobalConfigs, AttachementsService]
})
export class ModalAttachementPage {

    scanUri : string;
    fileName : string;
    scanTitle : string;
    themeColor : string;
    projectTarget : any;
    db : Storage;
    user : any;
    handler : AttachementsPage;
    isEmployer:boolean;
    constructor(private nav: NavController,
                private zone: NgZone,
                public gc: GlobalConfigs,
                private service : AttachementsService, private params : NavParams) {
       
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        this.isEmployer = this.projectTarget === 'employer';

        // Set local variables and messages
        this.themeColor = config.themeColor;
		let currentUserVar = config.currentUserVar;
        
		this.db = new Storage(SqlStorage);
        this.db.get(currentUserVar).then(usr => {
            if(usr){
                this.user = JSON.parse(usr);
            }
        });

        this.handler = this.params.data.handler;
    }

    onChangeUpload(e){
        let file = e.target.files[0];
        let myReader = new FileReader();
        this.zone.run(()=>{
            myReader.onloadend = (e) =>{
                this.scanUri = myReader.result;
            };
            myReader.readAsDataURL(file);
        });
    }

    takePicture(){
        Camera.getPicture({
            destinationType: Camera.DestinationType.DATA_URL,
            targetWidth: 1000,
            targetHeight: 1000
        }).then((imageData) => {
            this.zone.run(()=>{
                // imageData is a base64 encoded string
                this.scanUri = "data:image/jpeg;base64," + imageData;
            });
        }, (err) => {
            console.log(err);
        });
    }

    showModal(){
        let modal = Modal.create(ModalGalleryPage, {scanUri: this.scanUri});
        this.nav.present(modal);
    }

    onDelete(e){
        this.scanUri= null;
    }

    saveFile(){
        if(!this.scanUri || this.scanUri == null){
            this.nav.pop();
            return;
        }

        this.service.uploadFile(this.user, this.fileName, this.scanUri).then(data =>{
            this.handler.appendFile(data);
            this.nav.pop();
        });


    }
}
