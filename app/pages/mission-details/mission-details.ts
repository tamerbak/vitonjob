import {NavController, NavParams, ActionSheet, Loading, Platform, Modal, Storage, LocalStorage} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {MissionService} from '../../providers/mission-service/mission-service';
import {PushNotificationService} from '../../providers/push-notification-service/push-notification-service';
import {DatePicker} from 'ionic-native';
import {HomePage} from '../home/home';
import {Component} from "@angular/core";
import {DateConverter} from '../../pipes/date-converter/date-converter';
import {TimeConverter} from '../../pipes/time-converter/time-converter';
import {GlobalService} from "../../providers/global.service";
import {ModalInvoicePage} from "../modal-invoice/modal-invoice";

/*
 Generated class for the MissionDetailsPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/mission-details/mission-details.html',
    pipes: [DateConverter, TimeConverter],
    providers: [GlobalService, PushNotificationService]
})
export class MissionDetailsPage {
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;

    contract:any;
    missionDetailsTitle:string;

    missionIndex:number;
    missionDayIndex:number;
    missionTimeIsFirst:boolean;
    missionTimeIsStart:boolean;
    //records of user_heure_mission of a contract
    missionHours = [];
    initialMissionHours = [];
    //two dimensional array of pauses of mission days
    startPauses = [['']];
    endPauses = [['']];
    isNewMission = true;
    contract;
    contractSigned = false;

    store : Storage;
    invoiceReady : boolean =  false;

    constructor(private platform:Platform,
                public gc: GlobalConfigs,
                public nav: NavController,
                public navParams:NavParams,
                private missionService:MissionService,
                private globalService: GlobalService,
                private pushNotificationService: PushNotificationService) {

        this.store = new Storage(LocalStorage);

        this.platform = platform;
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.missionDetailsTitle = "Gestion de la mission";
        this.isEmployer = (this.projectTarget=='employer');
        //get missions
        this.contract = navParams.get('contract');
        //verify if the mission has already pauses
        this.isNewMission = this.contract.vu == 'Oui' ? false : true;
        this.missionService.listMissionHours(this.contract).then((data) => {
            if(data.data){
                this.initialMissionHours = data.data;
                //initiate pauses array
                this.constructMissionHoursArray(this.initialMissionHours);
            }
        });

        debugger;
        if(this.contract.numero_de_facture && this.contract.numero_de_facture != 'null')
            this.invoiceReady = true;
    }

    constructMissionHoursArray(initialMissionArray){
        //index of pause :a mission can have many pauses
        var ids = [];
        this.missionHours = [];
        for(var i = 0; i < initialMissionArray.length; i++){
            var m = initialMissionArray[i];
            //if the mission is not yet pushed
            if(ids.indexOf(m.id) == -1){
                //push the mission
                this.missionHours.push(m);
                //push the id mission to not stock the same mission many time
                ids.push(m.id);
                //push the pauses
                this.startPauses[i] = [];
                this.endPauses[i] = [];
                if(m.pause_debut != "null"){
                    this.startPauses[i][0] = this.convertToFormattedHour(m.pause_debut);
                }
                if(m.pause_fin != "null"){
                    this.endPauses[i][0] = this.convertToFormattedHour(m.pause_fin);
                }
            }else{
                //if the mission is already pushed, just push its pause
                var idExistMission = ids.indexOf(m.id);
                var j = this.startPauses[idExistMission].length;
                this.startPauses[idExistMission][j] = this.convertToFormattedHour(m.pause_debut);
                this.endPauses[idExistMission][j] = this.convertToFormattedHour(m.pause_fin);
            }
        }
    }

    onCardClick(dayIndex){
        if(!this.isNewMission || !this.isEmployer){
            return;
        }
        //open action sheet menu
        let actionSheet = ActionSheet.create({
            title: 'Actions',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Ajouter une pause',
                    icon: 'add-circle',
                    handler: () => {
                        this.addPause(dayIndex);
                    }
                },
                {
                    text: 'Annuler',
                    role: 'cancel', // will always sort to be on the bottom
                    icon: 'close',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        this.nav.present(actionSheet);
    }

    onPauseClick(dayIndex, pauseIndex){
        if(!this.isNewMission || !this.isEmployer){
            return;
        }
        //open action sheet menu
        let actionSheet = ActionSheet.create({
            title: 'Actions',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Supprimer la pause',
                    icon: 'trash',
                    handler: () => {
                        this.deletePause(dayIndex, pauseIndex);
                    }
                },
                {
                    text: 'Annuler',
                    role: 'cancel', // will always sort to be on the bottom
                    icon: 'close',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        this.nav.present(actionSheet);
    }

    addPause(dayIndex){
        this.startPauses[dayIndex].push("");
        this.endPauses[dayIndex].push("");
    }

    deletePause(dayIndex, pauseIndex){
        this.startPauses[dayIndex].splice(pauseIndex, 1);
        this.endPauses[dayIndex].splice(pauseIndex, 1);
    }

    validatePauses(){
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner : 'hide'
        });
        this.nav.present(loading).then(()=> {
            this.missionService.addPauses(this.missionHours, this.startPauses, this.endPauses, this.contract.pk_user_contrat).then((data) => {
                if (!data || data.status == "failure") {
                    console.log(data.error);
                    loading.dismiss();
                    this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
                    return;
                }else{
                    // data saved
                    console.log("pauses saved successfully : " + data.status);
                }
            });
            loading.dismiss();
            this.sendPushNotification();
            this.nav.pop();
        });
    }

    sendPushNotification(){
        this.pushNotificationService.getTokenByJobyer(this.contract.fk_user_jobyer).then(token => {
            var message = "Horaire du contrat n°" + this.contract.numero + " validé";
            this.pushNotificationService.sendPushNotification(token, message, this.contract).then(data => {
                this.globalService.showAlertValidation("VitOnJob", "Notification envoyée.");
            });
        });
    }

    checkPauseHour(i, j, isStartPause){
        if(isStartPause){
            //start pause should be greater than start mission
            var startPause = this.missionService.convertHoursToMinutes(this.startPauses[i][j]);
            if(this.missionHours[i].heure_debut >= startPause){
                this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être supérieure à l'heure de début du travail");
                this.startPauses[i][j] = "";
                return;
            }
            //start pause should be less than end mission
            if(this.missionHours[i].heure_fin <= startPause){
                this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieur à l'heure de fin de travail");
                this.startPauses[i][j] = '';
                return;
            }
        }else{
            var endPause = this.missionService.convertHoursToMinutes(this.endPauses[i][j])
            //end pause should be greater than start mission
            if(this.missionHours[i].heure_debut >= endPause){
                this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure à l'heure de début du travail");
                this.endPauses[i][j] = '';
                return;
            }
            //end pause should be less than end mission
            if(this.missionHours[i].heure_fin <= endPause){
                this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être inférieur à l'heure de fin de travail");
                this.endPauses[i][j] = '';
                return;
            }
        }
        //start pause should be less than end pause
        if((this.startPauses[i][j]) && (this.endPauses[i][j]) &&(this.endPauses[i][j] <= this.startPauses[i][j])){
            this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieur à l'heure de fin de pause");
            if(isStartPause)
                this.startPauses[i][j] = '';
            else
                this.endPauses[i][j] = '';
            return;
        }
    }

    signSchedule(){
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner : 'hide'
        });

        this.nav.present(loading).then(()=> {
            this.missionService.signSchedule(this.contract.pk_user_contrat).then((data) => {
                if (!data || data.status == "failure") {
                    console.log(data.error);
                    loading.dismiss();
                    this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
                    return;
                }else{
                    // data saved
                    console.log("schedule signed : " + data.status);
                }
            });
            loading.dismiss();
            this.nav.pop();
        });
    }

    validateWork(){
        this.store.set('CONTRACT_INVOICE', JSON.stringify(this.contract)).then(data => {
            this.nav.push(ModalInvoicePage);
        });

    }

    resetForm(){
        this.constructMissionHoursArray(this.initialMissionHours);
    }

    goBack(){
        this.nav.pop();
    }

    convertToFormattedHour(value){
        var hours = Math.floor(value / 60);
        var minutes = value % 60;
        return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
    }

    watchSignedToggle(e){
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner : 'hide'
        });
        this.nav.present(loading).then(()=> {
            this.missionService.signContract(this.contract.pk_user_contrat).then((data) => {
                if (!data || data.status == "failure") {
                    console.log(data.error);
                    loading.dismiss();
                    this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
                    return;
                }else{
                    // data saved
                    console.log("contract signed : " + data.status);
                    this.contract.signature_jobyer = 'Oui';
                }
            });
            loading.dismiss();
        });
    }

    launchContractPage() {
        this.platform.ready().then(() => {
            cordova.InAppBrowser.open(this.contract.lien_jobyer, "_system", "location=true");
        });
    }
    /**
     * @author daoudi amine
     * @param currentTime string the current time value of the item
     * @param missionIndex number index of the selected mission
     * @param dayIndex number index of the day in the mission
     * @param isFirst boolean define if the selected time is the first object
     * @param isStart boolean define if the selected time is 'start' or 'end' value
     * @description fake function to change time value in a mission
     */

    updateTime(currentTime,missionIndex,dayIndex,isFirst,isStart){
        this.missionIndex = missionIndex;
        this.missionDayIndex = dayIndex;
        this.missionTimeIsFirst = isFirst;
        this.missionTimeIsStart = isStart;

        var timeParts = currentTime.split(":");
        var date = new Date();
        date.setHours(timeParts[0]);
        date.setMinutes(timeParts[1]);

        console.log(date);

        this.showTimePicker(date);

    }

    /**
     * @author daoudi amine
     * @description show date time picker and work only in device
     */
    showTimePicker(date){
        DatePicker.show({
            date: date,
            mode: 'time',
            is24Hour:true
        }).then(
            date => console.log("Got date: ", date),
            err => console.log("Error occurred while getting date:", err)
        );
    }


    goToHomePage(){
        this.nav.setRoot(HomePage);
    }
}
