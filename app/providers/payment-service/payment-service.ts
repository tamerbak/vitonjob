import {Injectable} from 'angular2/core';
//import {Configs} from '../../configurations/configs';
import {Http, Headers} from 'angular2/http';


/**
 * @author daoudi amine
 * @description services for contracts yousign
 * @module Contract
 */
@Injectable()
export class PaymentService {

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
            
            this.http.post('http://vps259989.ovh.net:8080/vitonjobv1/api/envoisms', soapMessage, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                });
        });
  }

}

