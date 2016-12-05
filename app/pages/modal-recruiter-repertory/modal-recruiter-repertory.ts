import {Component} from "@angular/core";
import {NavController, ViewController, ToastController, Platform} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Contacts} from "ionic-native";
import {DataProviderService} from "../../providers/data-provider.service";
import {GlobalService} from "../../providers/global.service";

/*
 Generated class for the RecruiterRepertoryPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/modal-recruiter-repertory/modal-recruiter-repertory.html',
    providers: [DataProviderService, GlobalService]
})
export class ModalRecruiterRepertoryPage {
    projectTarget: string;
    isEmployer: boolean;
    themeColor: string;
    currentUser: any;
    checkedContacts = [];
    contactsfound = [];
    search:boolean = false;

    constructor(public nav: NavController,
                public gc: GlobalConfigs,
                private viewCtrl: ViewController,
                private dataProviderService: DataProviderService,
                private globalService: GlobalService,
                private platform: Platform, public toast:ToastController) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget == 'employer');
        this.platform = platform;
        this.contactsfound = [];
        this.search = false;
    }

    getContacts(ev) {
        this.platform.ready().then(() => {
            Contacts.find(['*'], {filter: ev.target.value}).then((contacts) => {
                //in birthday is always invalid date, and displayname is null
                for (let i = 0; i < contacts.length; i++) {
                    contacts[i].birthday = null;
                    if (this.isEmpty(contacts[i].displayName))
                        contacts[i].displayName = contacts[i].name.formatted;
                }
                this.contactsfound = contacts;
            })
            this.search = true;
        });
    }

    verifyContact(contact) {
        var phoneExist = false;
        if (contact.checked == true) {
            var tel = contact.phoneNumbers[0].value;
            var telArray = this.splitPhoneNumber(tel);
            tel = "+" + telArray[0] + telArray[1];
            this.dataProviderService.getUserByPhone(tel, this.projectTarget).then((data:{status:string, data:Array<any>}) => {
                if (!data || data.status == "failure") {
                    console.log(data);
                    this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                    return;
                }
                if (!data || data.data.length == 0) {
                    phoneExist = false;
                    this.checkedContacts.push(contact);
                } else {
                    phoneExist = true;
                    contact.checked = false;
                    contact.disabled = true;
                    let toast = this.toast.create({
                        message: 'Ce contact existe déjà. Veuillez en choisir un autre.',
                        duration: 5000
                    });
                    toast.present();
                    return;
                }
            });
        } else {
            for (var i = 0; i < this.checkedContacts.length; i++) {
                if (contact == this.checkedContacts[i]) {
                    this.checkedContacts.splice(i, 1);
                    return;
                }
            }
        }
    }

    selectContacts() {
        this.viewCtrl.dismiss(this.checkedContacts);
    }

    splitPhoneNumber(num) {
        var len = num.length;
        var index = num.substring(0, len - 9);
        if (index.startsWith("00")) {
            index = index.substring(2, len - 9);
        }
        if (index.startsWith("+")) {
            index = index.replace("+", "");
        }
        if (index == 0 || index == "") {
            index = "33";
        }
        var phone = num.substring(len - 9, len);
        return [index, phone];
    }

    closeModal() {
        this.viewCtrl.dismiss();
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}