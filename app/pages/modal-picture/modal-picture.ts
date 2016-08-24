import {Component} from '@angular/core';
import {NavController, NavParams, ViewController, Events} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {NgZone} from '@angular/core';
import {Camera} from 'ionic-native';

/*
 Generated class for the ModalPicturePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-picture/modal-picture.html',
})
export class ModalPicturePage {

    viewCtrl:any;
    avatars:any;
    projectTarget: string;
    themeColor:string;
    isEmployer: boolean;
    config: any;
    event:any;
    thirdThemeColor:string;
	pictureUri: string;

    constructor(public nav:NavController, 
				view:ViewController, 
				gc: GlobalConfigs, 
				event:Events, 
				private zone:NgZone,
				params: NavParams) {
        this.viewCtrl = view;
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        this.config = Configs.setConfigs(this.projectTarget);
        this.isEmployer = (this.projectTarget=='employer');
        this.themeColor= this.config.themeColor;
        this.thirdThemeColor = gc.getThirdThemeColor();
        this.avatars = this.config.avatars;
        this.event = event;
		this.pictureUri = params.data.picture;
    }

    /**
     * @Description : Closing the modal page
     */
    closeModal() {
		this.viewCtrl.dismiss({uri: this.pictureUri, type: "picture"});
    }

    /**
     * @Description : Validating slot modal
     */
    validateModal(item) {
        this.config.imageURL = item.url;
        this.event.publish('picture-change', item.url);
        this.viewCtrl.dismiss({uri: item.url, type: "avatar"});
    }

    /**
     * Load a picture
     */
    uploadPicture() {
		/*if (this.pictureUri) {
            this.currentUser.scanUploaded = true;
            this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
            this.authService.uploadScan(this.scanUri, userId, 'scan', 'upload')
                .then((data) => {
                    if (!data || data.status == "failure") {
                        console.log("Scan upload failed !");
                        //this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde du scan");
                        this.currentUser.scanUploaded = false;
                        this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
                    }
                    else {
                        console.log("Scan uploaded !");
                    }

                });
            this.storage.get(this.currentUserVar).then(usr => {
                if (usr) {
                    let user = JSON.parse(usr);
                    this.attachementService.uploadFile(user, 'scan ' + this.scanTitle, this.scanUri);
                }
            });

        }*/
    }
	
	/**
     * @description read the file to upload and convert it to base64
     */
    onChangeUpload(e) {
        var file = e.target.files[0];
        var myReader = new FileReader();
        this.zone.run(()=> {
            myReader.onloadend = (e) => {
                this.pictureUri = myReader.result;
            }
            myReader.readAsDataURL(file);
        });
    }
	
	takePicture() {
        Camera.getPicture({
            destinationType: Camera.DestinationType.DATA_URL,
            targetWidth: 1000,
            targetHeight: 1000
        }).then((imageData) => {
            this.zone.run(()=> {
                // imageData is a base64 encoded string
                this.pictureUri = "data:image/jpeg;base64," + imageData;
            });
        }, (err) => {
            console.log(err);
        });
    }
	
	deletePicture(){
		this.pictureUri = "";
	}
}