import {Injectable} from '@angular/core';
//import {Configs} from '../../configurations/configs';
import {Http, Headers} from '@angular/http';


/**
 * @author daoudi amine
 * @description services for contracts yousign
 * @module Contract
 */
@Injectable()
export class SmsService {

    constructor(public http: Http) {
        

    }


    /**
     * @description call yousign service
     * @param employer
     * @param jobyer
     * @return JSON results in form of offers
    */
    sendSms(phoneNumber:String,message:String){
        
        if(phoneNumber.charAt( 0 ) == '+' ){
            phoneNumber = phoneNumber.substring(1);
        }
        
        phoneNumber = "00" + phoneNumber;
        
        //only for test 
        //phoneNumber = "00212672435408";
        var soapMessage=
            '<fr.protogen.connector.model.SmsModel>'+
                '<telephone>'+phoneNumber+'</telephone>'+
                '<text>'+message+'</text>'+
            '</fr.protogen.connector.model.SmsModel>';

        
        
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", "text/xml");
            
            this.http.post('http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoisms', soapMessage, {headers:headers})
                .map(res => res)
                .subscribe(data => {
                    resolve(data);
                });
        });
  }

}

