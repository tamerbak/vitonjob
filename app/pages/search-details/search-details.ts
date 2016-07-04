import {Component} from '@angular/core';
import {NavController, NavParams, Alert, Storage, SqlStorage} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {isUndefined} from "ionic-angular/util";
import {ContractPage} from "../contract/contract";
import {CivilityPage} from "../civility/civility";
import {LoginsPage} from "../logins/logins";
import {UserService} from "../../providers/user-service/user-service";

@Component({
    templateUrl: 'build/pages/search-details/search-details.html',
})
export class SearchDetailsPage {
    isEmployer : boolean = false;
    fullTitle : string = '';
    fullName : string = '';
    matching : string = '';
    telephone : string = '';
    email : string = '';
    projectTarget : any;
    result : any;
    userService : UserService;
    isUserAuthenticated : boolean;
    employer : any;

    constructor(public nav: NavController,
                public params : NavParams,
                public globalConfig: GlobalConfigs,
                userService : UserService) {
        // Get target to determine configs
        this.projectTarget = globalConfig.getProjectTarget();
        this.isEmployer = this.projectTarget == 'employer';
        this.result = params.data.searchResult;
        if(this.result.titreOffre)
            this.fullTitle = this.result.titreOffre;
        if(this.result.titreoffre)
            this.fullTitle = this.fullTitle+this.result.titreoffre;
        this.fullName = this.result.titre+' '+this.result.prenom+' '+this.result.nom;
        this.email = this.result.email;
        this.telephone = this.result.tel;

        //get the currentEmployer
        this.userService = userService;
        this.userService.getCurrentUser().then(results =>{

            if(results && !isUndefined(results)){
                let currentEmployer = JSON.parse(results);
                if(currentEmployer){
                    this.employer = currentEmployer;
                }
                console.log(currentEmployer);
            }

        });

        console.log(this.result);
    }

    call(){
        
        window.location = 'tel:'+ this.telephone;
    }

    sendEmail(){

        window.location = 'mailto:'+ this.email;
    }

    sendSMS(){
        var number = this.telephone;
        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
            }
        };
        var success = function () { console.log('Message sent successfully'); };
        var error = function (e) { console.log('Message Failed:' + e); };

        sms.send(number, "", options, success, error);
    }
    skype(){
        startApp.set({ /* params */
            "action": "ACTION_VIEW",
            "uri": "skype:"+this.telephone
        }).start(function(){
            console.log('starting skype');
        }, function(error){
            console.log('failed to start skype : '+error);
        });
    }
    googleHangout(){

    }

    contract(){

        if(this.isUserAuthenticated){

            let currentEmployer = this.employer.employer;
            console.log(currentEmployer);

            //verification of employer informations
            let redirectToCivility = (currentEmployer && currentEmployer.entreprises[0]) ?
            (currentEmployer.titre == "") ||
            (currentEmployer.prenom == "") ||
            (currentEmployer.nom == "") ||
            (currentEmployer.entreprises[0].name == "") ||
            (currentEmployer.entreprises[0].siret == "") ||
            (currentEmployer.entreprises[0].naf == "") ||
            (currentEmployer.entreprises[0].siegeAdress.id == 0) ||
            (currentEmployer.entreprises[0].workAdress.id == 0): true;

            let isDataValid = !redirectToCivility;

            if (isDataValid) {
                //navigate to contract page

                let o = this.params.get('currentOffer');
                if(o && !isUndefined(o)){
                    this.nav.push(ContractPage, {jobyer: this.result, currentOffer : o});
                }else{
                    this.nav.push(ContractPage, {jobyer: this.result});
                }


            } else {
                //redirect employer to fill the missing informations
                let alert = Alert.create({
                    title: 'Informations incomplètes',
                    subTitle: "Veuillez compléter votre profil avant d'établir votre premier contrat",
                    buttons: ['OK']
                });
                alert.onDismiss(()=>{
                    this.nav.push(CivilityPage, {currentUser: this.employer});
                });
                this.nav.present(alert);

            }
        }
        else
        {
            let alert = Alert.create({
                title: 'Attention',
                message: 'Pour contacter ce jobyer, vous devez être connectés.',
                buttons: [
                    {
                        text: 'Annuler',
                        role: 'cancel',
                    },
                    {
                        text: 'Connexion',
                        handler: () => {
                            this.nav.push(LoginsPage);
                        }
                    }
                ]
            });
            this.nav.present(alert);
        }
    }

    close(){
        this.nav.pop();
    }
}
