import {Component} from '@angular/core';
import {NavController, ViewController, Events} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

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

    constructor(public nav:NavController, view:ViewController, gc: GlobalConfigs, event:Events) {
        this.viewCtrl = view;
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        this.config = Configs.setConfigs(this.projectTarget);
        this.isEmployer = (this.projectTarget=='employer');
        this.themeColor= this.config.themeColor;
        this.thirdThemeColor = gc.getThirdThemeColor();
        this.avatars = this.config.avatars;
        this.event = event;
    }

    /**
     * @Description : Closing the modal page
     */
    closeModal() {
        this.viewCtrl.dismiss();
    }

    /**
     * @Description : Validating slot modal
     */
    validateModal(item) {
        this.config.imageURL = item.url;
        this.event.publish('picture-change', item.url);
        this.viewCtrl.dismiss({url:item.url});
    }

    /**
     * Load a picture
     */
    loadPicture() {

    }
}