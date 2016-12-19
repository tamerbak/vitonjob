import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";

@Injectable()
export class PushNotificationService {

    configuration;
    projectTarget;
    data:any;

    constructor(public http: Http, gc: GlobalConfigs) {

        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
    }

    getTokenByJobyerId(jobyerId) {
        var sql = "select a.device_token from user_account as a, user_jobyer as j where a.pk_user_account = j.fk_user_account and a.pk_user_account = '" + jobyerId + "';";

        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    getToken(id, who) {
        var sql = "";
        if (who == "toJobyer") {
            sql = "select a.device_token from user_account as a, user_jobyer as j where a.pk_user_account = j.fk_user_account and j.pk_user_jobyer = '" + id + "';";
        } else {
            sql = "select a.device_token from user_account as a, user_entreprise as e where a.pk_user_account = e.fk_user_account and e.pk_user_entreprise = '" + id + "';";
        }

        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        });
    }

    sendPushNotification(deviceToken, message, contract, objectNotif) {
        var url = "https://api.ionic.io/push/notifications";
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI4ZDE1NTA3Zi01YTU0LTRkNWYtODA0NC01MTljNGQ3MGI1NWEifQ.W0P2BHto56NA2UR8jvG-lfKEryMPFIu9m6b9nm21n0M");
        var body = {
            "tokens": [deviceToken.data[0].device_token],
            //"tokens": ["dzkrIrmFILU:APA91bFC68vWiF1mgcNRs1E0Y99B0c95ZfkPGZ9ibmpzQuDqZ8Or4yIP3LRnE51MjJH3VzsyVJgAjdRJRR_r9fu9Fx65rz0ppkLP7_JKRl5FzVWH9yIIIDF_o0ASQA8Jj1rjyA8sjf_3"],
            "profile": "Vit-On-Job",
            "notification": {
                "message": message,
                "android": {
                    "data": {
                        "contract": JSON.stringify(contract),
                        "objectNotif": objectNotif
                    }
                },
                "ios": {
                    "data": {
                        "contract": JSON.stringify(contract),
                        "objectNotif": objectNotif
                    }
                }
            }
        };
        console.log('notification body : ' + JSON.stringify(body));
        return new Promise(resolve => {
            this.http.post(url, JSON.stringify(body), {headers: headers}).map(res => res.json())
                .subscribe((data:any) => {
                        console.log('notification body : ' + JSON.stringify(data));
                        this.data = data;
                        console.log("push notification sent", data);
                        resolve(this.data);
                    },
                    err => console.log(err));
        });
    }

    sendSimplePushNotification(deviceToken, message) {
        var url = "https://api.ionic.io/push/notifications";
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI4ZDE1NTA3Zi01YTU0LTRkNWYtODA0NC01MTljNGQ3MGI1NWEifQ.W0P2BHto56NA2UR8jvG-lfKEryMPFIu9m6b9nm21n0M");
        var body = {
            "tokens": [deviceToken.data[0].device_token],
            //"tokens": ["dzkrIrmFILU:APA91bFC68vWiF1mgcNRs1E0Y99B0c95ZfkPGZ9ibmpzQuDqZ8Or4yIP3LRnE51MjJH3VzsyVJgAjdRJRR_r9fu9Fx65rz0ppkLP7_JKRl5FzVWH9yIIIDF_o0ASQA8Jj1rjyA8sjf_3"],
            "profile": "Vit-On-Job",
            "notification": {
                "message": message,
                "android": {},
                "ios": {}
            }
        };
        console.log('notification body : ' + JSON.stringify(body));
        return new Promise(resolve => {
            this.http.post(url, JSON.stringify(body), {headers: headers}).map(res => res.json())
                .subscribe((data:any) => {
                        console.log('notification body : ' + JSON.stringify(data));
                        this.data = data;
                        console.log("push notification sent", data);
                        resolve(this.data);
                    },
                    err => console.log(err));
        });
    }
}
