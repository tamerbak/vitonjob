/**
 * Created by tim on 06/05/2016.
 */

import {Injectable} from '@angular/core';

@Injectable()
export class GlobalConfigs {

    //Project Target : employer or jobyer
    private projectTarget;
    //Name of the connexion button : Connexion or Deconnexion
    private cnxBtnName: string;
    // Avatars :
    private avatars:any;
    // 3rd Color for backgrounds
    private thirdThemeColor:string;

    constructor() {
        this.projectTarget = "employer";
        this.cnxBtnName = "Se connecter / S'inscrire";
        this.thirdThemeColor = '#f4f4f4';
        this.avatars = {
            jobyer: [
                {
                    url: 'img/jobyer.png'
                },
                {
                    url: 'img/jobyer2.png'
                },
                {
                    url: 'img/jobyer3.png'
                },
                {
                    url: 'img/jobyer4.png'
                }
            ],
            employer: [
                {
                    url: 'img/employer.png'
                },
                {
                    url: 'img/employer2.png'
                },
                {
                    url: 'img/employer3.png'
                }
            ]
        }
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

}