import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Configs} from "../../configurations/configs";


@Injectable()
export class AddressService {
    data: any = null;

    constructor(public http: Http) {}

    /**
     * get latitude and langitude of a string address
     * @param address
     * @returns {Promise<T>}
     */
    getLatLng(address:string) {
        /*if (this.data) {
         // already loaded data
         return Promise.resolve(this.data);
         }*/

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=AIzaSyD6de5QuqKPECTwNSkmBfeRmiTb9147S_Y')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    getDistance(origine, destination){
        let bean = {
            'class' : 'com.vitonjob.callouts.recherche.SearchQuery',
            adresseOrigine : origine,
            adresseDest : destination
        };
        console.log(JSON.stringify(bean));
        let encodedArg = btoa(JSON.stringify(bean));
        var payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 184,
            'args': [
                {
                    'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Distance',
                    value: encodedArg
                }
            ]
        };

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = Configs.getHttpJsonHeaders();


            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    //debugger;
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        });
    }
}

