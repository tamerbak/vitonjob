import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ProfileService} from "../../providers/profile-service/profile-service";
import {LoadListService} from "../../providers/load-list.service";

@Component({
    templateUrl: 'build/pages/profile-qualities/profile-qualities.html',
    providers: [ProfileService, LoadListService]
})
export class ProfileQualitiesPage {
    selectedQuality : string;
    qualities : any = [];
    savedQualities : any = [];
    currentUser : any;
    isEmployer : boolean;

    constructor(private nav: NavController,
                private navParams: NavParams,
                private profileService : ProfileService,
                private listService : LoadListService) {
        this.currentUser = navParams.data.currentUser;
        this.isEmployer = navParams.data.isEmployer;
        let type = this.isEmployer?"employeur":"jobyer";
        this.listService.loadQualities(type).then((results:any)=>{
            if(results.data)
                this.qualities = results.data;
        });

        let idUser = this.isEmployer?
            this.currentUser.employer.entreprises[0].id:
            this.currentUser.jobyer.id;
        let projectType = this.isEmployer?'employer':'jobyer';
        this.profileService.getUserQualities(idUser, projectType).then((results:any)=>{
            this.savedQualities = results;
        });
    }

    addQuality(){
        let found = false;
        let q = null;
        for(let i = 0 ; i < this.qualities.length ; i++)
            if(this.selectedQuality == this.qualities[i].id){
                found = true;
                q = this.qualities[i];
                break;
            }

        if(!found)
            return;

        for(let i = 0 ; i < this.savedQualities.length ; i++)
            if(this.savedQualities[i].id == q.id)
                return;

        this.savedQualities.push(q);
        let idUser = this.isEmployer?
            this.currentUser.employer.entreprises[0].id:
            this.currentUser.jobyer.id;
        let projectType = this.isEmployer?'employer':'jobyer';
        this.profileService.saveQualities(this.savedQualities, idUser, projectType);
    }

    removeQuality(q){
        let index = this.savedQualities.indexOf(q);
        this.savedQualities.splice(index, 1);
        let idUser = this.isEmployer?
            this.currentUser.employer.entreprises[0].id:
            this.currentUser.jobyer.id;
        let projectType = this.isEmployer?'employer':'jobyer';
        this.profileService.saveQualities(this.savedQualities, idUser, projectType);
    }
}
