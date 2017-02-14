/**
 * Created by tim on 06/05/2016.
 */

import {Injectable} from "@angular/core";

@Injectable()
export class GlobalConfigs {

    //Project Target : employer or jobyer
    private projectTarget;
    //Name of the connexion button : Connexion or Deconnexion
    private cnxBtnName: string;
    // Avatars :
    private avatars: any;
    // 3rd Color for backgrounds
    private thirdThemeColor: string;
    // Instabug object
    private instabug: any;
    // mission mode
    private missionOption: any;
    // HunterMask
    private isHunter:boolean=false;
    // Google Analytics
    public googleAnalyticsID:string='';

    static global = {
        // strict-cni: force the user the enter the CNI key, the 13th number
        "strict-cni": false,
        "electronic-signature": "docusign", // "yousign", "docusign"
    };

    // DEV or PROD environment
    /**
     * Change here the env variable that indicates the nature of DB connections : PROD or DEV
     * @type {string}
     */
    static env:string = 'DEV'; // DEV ou PROD
    static DLMode:string = 'local';    //  remote or local
    static GA_APP_ID_EMP:string = 'UA-91039209-1';
    static GA_APP_ID_JOB:string = 'UA-91039209-2';

    constructor() {
        this.projectTarget = "employer"; // "jobyer" / "employer"
        this.cnxBtnName = "Se connecter / S'inscrire";
        this.thirdThemeColor = '#f4f4f4';
        this.googleAnalyticsID = this.projectTarget == "employer"?GlobalConfigs.GA_APP_ID_EMP:GlobalConfigs.GA_APP_ID_JOB;
    }

    setProjectTarget(value) {
        this.projectTarget = value;
    }

    getProjectTarget() {
        return this.projectTarget;
    }

    setAvatars(value) {
        this.avatars = value;
    }

    getAvatars() {
        return this.avatars;
    }

    setCnxBtnName(value) {
        this.cnxBtnName = value;
    }

    getCnxBtnName() {
        return this.cnxBtnName;
    }

    setThirdThemeColor(value) {
        this.thirdThemeColor = value;
    }

    getThirdThemeColor() {
        return this.thirdThemeColor;
    }

    setInstabug(value) {
        this.instabug = value;
    }

    getInstabug() {
        return this.instabug;
    }

    setMissionOption(value) {
        this.missionOption = value;
    }

    getMissionOption() {
        return this.missionOption;
    }

    setHunterMask(value){
        this.isHunter = value;
    }

    getHunterMask(){
        return this.isHunter;
    }

}
