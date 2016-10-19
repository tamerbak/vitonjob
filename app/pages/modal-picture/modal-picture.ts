import {Component, NgZone} from "@angular/core";
import {NavController, NavParams, ViewController, Events, Alert} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Camera} from "ionic-native";

/*
 Generated class for the ModalPicturePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-picture/modal-picture.html',
})
export class ModalPicturePage {

    viewCtrl: any;
    avatars: any;
    projectTarget: string;
    themeColor: string;
    inversedTemeColor: string;
    isEmployer: boolean;
    config: any;
    event: any;
    thirdThemeColor: string;
    pictureUri: string;
    isPictureChanged = false;
    defaultImage: string;
    imgCrop;
    hideCropBtn = true;

    constructor(public nav: NavController,
                view: ViewController,
                gc: GlobalConfigs,
                event: Events,
                private zone: NgZone,
                params: NavParams) {
        this.viewCtrl = view;
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        this.config = Configs.setConfigs(this.projectTarget);
        this.isEmployer = (this.projectTarget == 'employer');
        this.themeColor = this.config.themeColor;
        this.inversedThemeColor = this.config.inversedThemeColor;
        this.thirdThemeColor = gc.getThirdThemeColor();
        this.avatars = this.config.avatars;
        this.event = event;
        this.pictureUri = params.data.picture;
        this.defaultImage = this.config.userImageURL
    }

    /**
     * @Description : Closing the modal page
     */
    closeModal() {
        if (this.isPictureChanged && !this.hideCropBtn) {
            let confirm = Alert.create({
                title: "VitOnJob",
                message: "Voulez-vous valider votre photo de profil?",
                buttons: [
                    {
                        text: 'Oui',
                        handler: () => {
                            console.log('Yes selected');
                            this.validateCrop();
                        }
                    },
                    {
                        text: 'Non',
                        handler: () => {
                            console.log('Non selected');
                            this.viewCtrl.dismiss();
                        }
                    }
                ]
            });
            this.nav.present(confirm);
        } else {
            if (!this.isPictureChanged) {
                this.viewCtrl.dismiss();
                return;
            }
            if (this.hideCropBtn) {
                this.pictureUri = this.resize(this.pictureUri, 100, 100);
                this.viewCtrl.dismiss({uri: this.pictureUri, type: "picture"});
                return;
            }
        }
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
        this.isPictureChanged = true;
        var file = e.target.files[0];
        if (!file.type.match(/image.*/)) {
            console.log("not an image!");
            return;
        }
        ;
        if (!this.hideCropBtn)
            this.imgCrop.destroy();
        var myReader = new FileReader();
        this.zone.run(()=> {
            myReader.onloadend = (e) => {
                console.log("initial length : " + myReader.result.length);
                this.loadPictureForCropping(myReader.result);
                this.pictureUri = null;
            }
            myReader.readAsDataURL(file);
        });
        this.resetFileInput();
    }

    takePicture() {
        if (!this.hideCropBtn)
            this.imgCrop.destroy();
        this.isPictureChanged = true;
        Camera.getPicture({
            destinationType: Camera.DestinationType.DATA_URL,
            targetWidth: 1000,
            targetHeight: 1000,
            correctOrientation: true
        }).then((imageData) => {
            this.zone.run(()=> {
                // imageData is a base64 encoded string
                var imgBase64 = "data:image/jpeg;base64," + imageData;
                this.loadPictureForCropping(imgBase64);
                this.pictureUri = null;
            });
        }, (err) => {
            console.log(err);
        });
        this.resetFileInput();
    }

    deletePicture() {
        if (!this.hideCropBtn)
            this.imgCrop.destroy();
        this.isPictureChanged = true;
        this.pictureUri = "";
        this.hideCropBtn = true;
        this.resetFileInput();
    }

    loadPictureForCropping(img) {
        var el = document.getElementById('profile-picture');
        this.imgCrop = new Croppie(el, {
            viewport: {width: 100, height: 100, type: 'circle'},
            boundary: {width: 250, height: 250},
            showZoomer: false,
        });
        this.imgCrop.bind({
            url: img,
        });
        this.hideCropBtn = false;
    }

    validateCrop() {
        this.imgCrop.result('canvas').then(base64Image => {
            console.log("initial length : " + base64Image.length);
            this.pictureUri = base64Image;
            this.imgCrop.destroy();
        });
        this.hideCropBtn = true;
        this.resetFileInput();

    }

    //resize picture to compress it
    resize(base64Img, width, height) {
        var img = new Image();
        img.src = base64Img;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        console.log(canvas.toDataURL("image/jpeg").length);
        return canvas.toDataURL("image/jpeg");
    }

    //initialize fileinput (bug in navigator)
    resetFileInput() {
        var fileinput = document.getElementById('fileinput');
        fileinput.value = "";
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}