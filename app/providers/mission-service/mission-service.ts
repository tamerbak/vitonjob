import {Injectable} from 'angular2/core';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Http, Headers} from 'angular2/http';
import {Storage, SqlStorage} from 'ionic-angular';


/**
 * @author daoudi amine
 * @description ???
 * @module Mission
 */
@Injectable()
export class MissionService {
    configuration : any;
    projectTarget:string;
    db:any;
    
    constructor(public http: Http,public gc: GlobalConfigs) {
        this.db = new Storage(SqlStorage);

    }

    
    setMissions(){
        var missionsEmplyer = [
            {
                index:1,contratId:"1342567",stat:"Confirmation Horaire en attente",
                days:[
                    {
                        index:1,
                        date:"23/05/2016",
                        startHour: "15:00",
                        time:[
                            {start:"08:00",end:"12:00"}
                        ]
                    },
                    {
                        index:2,
                        date:"24/05/2016",
                        time:[
                            {start:"13:00",end:"19:00"}
                        ]
                    },
                ]
            },
            {
                index:2,contratId:"7987363",stat:"en cours de mission",
                days:[
                    {
                        index:1,
                        date:"26/05/2016",
                        time:[
                            {start:"08:00",end:"12:00"}
                        ]
                    }
                ]
            }
        ];
            
        var missionsJobyer = [
            {
                index:1,contratId:"1567893",stat:"Confirmation Horaire en attente",
                days:[
                    {
                        index:1,
                        date:"23/05/2016",
                        time:[
                            {start:"15:00",end:"17:00"}
                        ]
                        
                    },
                    {
                        index:2,
                        date:"24/05/2016",
                        time:[
                            {start:"13:00",end:"19:00"}
                        ]
                        
                    },
                ]
            },
            {index:2,contratId:"5109335",stat:"en cours de mission",
                days:[
                    {
                        index:1,
                        date:"26/05/2016",
                        time:[
                            {start:"08:00",end:"12:00"}
                        ]
                    }
                ]    
            }
        ];
            
            
            
        this.db.set("missionsEmployer",JSON.stringify(missionsEmplyer));
        this.db.set("missionsJobyer",JSON.stringify(missionsJobyer));
        
    }
    
        /**
     * @description fake Service to get missions
     * @return JSON results in form of youSign Object
         */
    getMissions(){
        
        //get current user type
        this.projectTarget = this.gc.getProjectTarget();
        
        
        if(this.projectTarget == 'employer')
        {
            return this.db.get("missionsEmployer");
        }
        else if(this.projectTarget == 'jobyer')
        {
            return this.db.get("missionsJobyer");
        }
        
        // var jsonData = {
        //     
        // };

        // var payload = {
        //     'class': 'fr.protogen.masterdata.model.CCallout',
        //     'id': 93,
        //     'args': [
        //         {
        //             'class': 'fr.protogen.masterdata.model.CCalloutArguments',
        //             label: 'Signature electronique',
        //             value: btoa(jsonData)
        //         }
        //     ]
        // };
        
        // return new Promise(resolve => {
        //     
        //     let headers = new Headers();
        //     headers.append("Content-Type", 'application/json');
        //     
        //     
        //     
        //     this.http.post('http://ns389914.ovh.net:8080/vitonjobv1/api/callout', JSON.stringify(payload), {headers:headers})
        //         .map(res => res.json())
        //         .subscribe(data => {
        //             resolve(data);
        //         });
        // });
        
        
  }

}

