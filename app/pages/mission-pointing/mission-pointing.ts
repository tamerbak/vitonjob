import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {MissionService} from "../../providers/mission-service/mission-service";
import {DateConverter} from "../../pipes/date-converter/date-converter";
import {TimeConverter} from "../../pipes/time-converter/time-converter";

/*
 Generated class for the MissionPointingPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/mission-pointing/mission-pointing.html',
    providers: [MissionService],
    pipes: [DateConverter, TimeConverter]
})
export class MissionPointingPage {
    projectTarget: string;
    isEmployer: boolean;
    themeColor: string;

    contract;
    missionHours = [];
    missionPauses = [];
    //startPauses = [['']];
    //endPauses = [['']];
    //startPausesPointe = [['']];
    //endPausesPointe = [['']];
    //idPauses = [];
    nextPointing;
    disableBtnPointing = true;

    constructor(private nav: NavController,
                public gc: GlobalConfigs,
                public navParams: NavParams,
                private missionService: MissionService) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget == 'employer');
        this.contract = navParams.get('contract');
        //retrieve mission hours of tody
        this.missionService.listMissionHours(this.contract, true).then((data:{data:any}) => {
            if (data.data) {
                var missionHoursTemp = data.data;
                var array = this.getTodayMission(missionHoursTemp);
                this.missionHours = array[0];
                this.missionPauses = array[1];
                this.disableBtnPointing = this.disablePointing();
                var autoPointing = navParams.get('autoPointing');
                if (autoPointing) {
                    this.nextPointing = navParams.get('nextPointing');
                    this.pointHour(true);
                }
            }
        });
    }

    getTodayMission(missionHoursTemp) {
        var now = new Date().setHours(0, 0, 0, 0);
        var missionHoursToday = [];
        for (var i = 0; i < missionHoursTemp.length; i++) {
            if (new Date(missionHoursTemp[i].jour_debut.replace(' ', 'T')).setHours(0, 0, 0, 0) == now || new Date(missionHoursTemp[i].jour_fin.replace(' ', 'T')).setHours(0, 0, 0, 0) == now) {
                missionHoursToday.push(missionHoursTemp[i]);
            }
        }
        let array = this.missionService.constructMissionHoursArray(missionHoursToday);
        return array;
    }

    pointHour(autoPointing) {
        if (this.nextPointing) {
            var h = new Date().getHours();
            var m = new Date().getMinutes();
            var minutesNow = this.missionService.convertHoursToMinutes(h + ':' + m);
            this.nextPointing.pointe = minutesNow;
            this.missionService.savePointing(this.nextPointing).then((data:any) => {
                //retrieve mission hours of tody
                this.missionService.listMissionHours(this.contract, true).then((data:{data:any}) => {
                    if (data.data) {
                        var missionHoursTemp = data.data;
                        var array = this.getTodayMission(missionHoursTemp);
                        this.missionHours = array[0];
                        this.missionPauses = array[1];
                        this.disableBtnPointing = true;
                    }
                });
            });
        }
    }

    disablePointing() {
        var disabled = true;
        var h = new Date().getHours();
        var m = new Date().getMinutes();
        var minutesNow = this.missionService.convertHoursToMinutes(h + ':' + m);
        for (var i = 0; i < this.missionHours.length; i++) {
            var scheduledHour = this.isEmpty(this.missionHours[i].heure_debut_new) ? this.missionHours[i].heure_debut : this.missionHours[i].heure_debut_new;
            if (scheduledHour - minutesNow <= 10 && scheduledHour - minutesNow >= 0 && this.isEmpty(this.missionHours[i].heure_debut_pointe)) {
                disabled = false;
                this.nextPointing = {id: this.missionHours[i].id, start: true};
                return disabled;
            }
            scheduledHour = this.isEmpty(this.missionHours[i].heure_fin_new) ? this.missionHours[i].heure_fin : this.missionHours[i].heure_fin_new;
            if (scheduledHour - minutesNow <= 10 && scheduledHour - minutesNow >= 0 && (this.isEmpty(this.missionHours[i].heure_fin_pointe))) {
                disabled = false;
                this.nextPointing = {id: this.missionHours[i].id, start: false};
                return disabled;
            }
            for (var j = 0; j < this.missionPauses[i].length; j++) {
                var p = this.missionPauses[i][j];
                var minutesPause;
                if (this.isEmpty(p.pause_debut_new)) {
                    let h:string = (p.pause_debut).split(":")[0];
                    let m:string = (p.pause_debut).split(":")[1];
                    minutesPause = this.missionService.convertHoursToMinutes(h + ':' + m);
                } else {
                    minutesPause = p.pause_debut_new;
                }
                if (minutesPause - minutesNow <= 10 && minutesPause - minutesNow >= 0 && this.isEmpty(p.pause_debut_pointe)) {
                    disabled = false;
                    this.nextPointing = {id: this.missionHours[i].id, start: true, id_pause: p.id};
                    return disabled;
                }
                if (this.isEmpty(p.pause_fin_new)) {
                    let h:string = (p.pause_fin).split(":")[0];
                    let m:string = (p.pause_fin).split(":")[1];
                    minutesPause = this.missionService.convertHoursToMinutes(h + ':' + m);
                } else {
                    minutesPause = p.pause_fin_new;
                }
                if (minutesPause - minutesNow <= 10 && minutesPause - minutesNow >= 0 && this.isEmpty(p.pause_fin_pointe)) {
                    disabled = false;
                    this.nextPointing = {id: this.missionHours[i].id, start: false, id_pause: p.id};
                    return disabled;
                }
            }
        }
        return disabled;
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}