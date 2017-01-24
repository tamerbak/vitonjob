import {NavController, ModalController, LoadingController, } from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {RecruiterService} from "../../providers/recruiter-service/recruiter-service";
import {Component} from "@angular/core";
import {ModalRecruiterRepertoryPage} from "../modal-recruiter-repertory/modal-recruiter-repertory";
import {ModalRecruiterManualPage} from "../modal-recruiter-manual/modal-recruiter-manual";
import {GlobalService} from "../../providers/global-service/global-service";
import {Storage} from "@ionic/storage";

@Component({
    templateUrl: 'recruiter-list.html',
  selector: 'recruiter-list'
})

export class RecruiterListPage {
    public projectTarget: string;
    public isEmployer: boolean;
    public themeColor: string;
    public recruiterList: any;
    public currentUser: any;
    public backgroundImage: string;
    public currentUserVar:any;
    public backGroundColor:string;

    constructor(public gc: GlobalConfigs,
                public nav: NavController,
                private globalService: GlobalService,
                private recruiterService: RecruiterService,
                public modal:ModalController,
                public loading:LoadingController,
                public storage:Storage) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        this.isEmployer = (this.projectTarget == 'employer');
        this.backGroundColor = config.backGroundColor;

        let currentUserVar = config.currentUserVar;

        this.storage.get(currentUserVar).then((value) => {
            if (value) {
                this.currentUser = JSON.parse(value);
            }
        });
    }

    ionViewWillEnter() {
        //if db local contains recruiter list, retrieve it
        this.storage.get("RECRUITER_LIST").then((value) => {
            if (value) {
                this.recruiterList = JSON.parse(value);
                //if db local does not contain recruiter list, retrieve it from server
            } else {
                if (!this.recruiterList || this.recruiterList.length == 0) {
                    this.recruiterService.loadRecruiters(this.currentUser.employer.id).then((data:any)=> {
                        if (data && data.status == "success") {
                            this.recruiterList = data.data;
                            this.storage.set('RECRUITER_LIST', JSON.stringify(this.recruiterList));
                        }
                    });
                }
            }
        });

    }

    showRecruiterRepertoryModal() {
        let modal = this.modal.create(ModalRecruiterRepertoryPage);
        modal.present();
        modal.onDidDismiss(contacts => {
            if (contacts) {
                this.recruiterService.insertRecruiters(contacts, this.currentUser.employer.id, 'repertory').then((data:any) => {
                    if (!data || data.status == 'failure') {
                        this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
                    } else {
                        console.log("recruiter saved successfully");
                        this.recruiterService.updateRecruiterListInLocal(data).then(() => {
                            this.ionViewWillEnter();
                        });
                    }
                });
            }
        });
    }

    showRecruiterManualModal(contact?:any) {
        let modal = this.modal.create(ModalRecruiterManualPage, {contact: contact});
        modal.present();
        modal.onDidDismiss(recruiter => {
            if (!recruiter) {
                this.ionViewWillEnter();
                return;
            }
            //if validate button was clicked, and a new recruiter was entered
            this.saveNewContact(recruiter, contact);
            //if validate button was clicked and an existant recruiter was modified
            this.saveExistantContact(recruiter, contact);
            //if the send notification button was clicked
            if (Array.isArray(recruiter) && recruiter[0] && recruiter[1] == "notification") {
                let loading = this.loading.create({content:"Merci de patienter..."});
                loading.present();
                var tel = recruiter[0].phone;
                //save existant contact
                if (contact && (recruiter[0].firstname != contact.firstname || recruiter[0].lastname != contact.lastname || tel != contact.phone)) {
                    this.recruiterService.updateRecruiter(recruiter[0], this.currentUser.employer.id).then((data:any) => {
                        console.log("recruiter modified successfully");
                        this.recruiterService.updateRecruiterListInLocal([recruiter[0]]).then(() => {
                            this.ionViewWillEnter();
                        });
                        this.sendNotification(recruiter[0].accountid, tel);
                        loading.dismiss();
                    });
                    return;
                }
                //save new contact
                if (!contact) {
                    if (recruiter[0] && !contact && !Array.isArray(recruiter[0])) {
                        this.recruiterService.insertRecruiters([recruiter[0]], this.currentUser.employer.id, 'manual').then((data:any) => {
                            console.log("recruiter saved successfully");
                            this.recruiterService.updateRecruiterListInLocal(data).then(() => {
                                this.ionViewWillEnter();
                            });
                            this.sendNotification(data[0].accountid, tel);
                            loading.dismiss();
                        });
                        return;
                    }
                }
            }
        });
    }

    sendNotification(accountid, tel) {
        this.recruiterService.generatePasswd(accountid).then((passwd) => {
            this.recruiterService.sendNotificationBySMS(tel, this.currentUser, passwd).then((data:any) => {
                if (!data || data.status != 200) {
                    this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                    return;
                }
            });
        });
    }

    saveNewContact(recruiter, contact) {
        if (recruiter && !contact && !Array.isArray(recruiter)) {
            this.recruiterService.insertRecruiters([recruiter], this.currentUser.employer.id, 'manual').then((data:any) => {
                console.log("recruiter saved successfully");
                this.recruiterService.updateRecruiterListInLocal(data).then(() => {
                    this.ionViewWillEnter();
                });
            });
            return;
        }
    }

    saveExistantContact(recruiter, contact) {
        if (recruiter && contact && !Array.isArray(recruiter)) {
            this.recruiterService.updateRecruiter(recruiter, this.currentUser.employer.id).then((data:any) => {
                console.log("recruiter modified successfully");
                this.recruiterService.updateRecruiterListInLocal([recruiter]).then(() => {
                    this.ionViewWillEnter();
                });
            });
            return;
        }
    }
}
