import {Page, NavController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModelLockScreenPage} from "../model-lock-screen/model-lock-screen";

/*
 Generated class for the ProfilePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */

@Page({
    templateUrl: 'build/pages/profile/profile.html',
    providers: [GlobalConfigs]
})
export class ProfilePage {
    themeColor:string;
    inversedThemeColor:string;
    isEmployer:boolean;
    projectTarget:string;
    userImageURL:string;
    map: any;

    swipEvent:any;

    constructor(public nav:NavController, public gc:GlobalConfigs) {

        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        //Initializing page:
        this.initializePage(config);


    }

    /**
     * @Author : TEL
     * @Description : Initializing Offer adding buttons
     */
    initializePage(config) {
        // Set local variables
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.userImageURL = config.userImageURL;
        this.swipEvent = '';
    }

    onPageLoaded() {
        console.log('page loaded');
        this.loadMap();
    }

    /**
     * @description : Loading addresses on the map
     */
    loadMap() {

        //document.getElementById("map").children.length == 0
        if (true) {
            let latLng = new google.maps.LatLng(48.8785618, 2.3603689);

            let mapOptions = {
                center: latLng,
                //zoom: 5,
                draggable : false,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            //debugger;
            this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
            let address1 = new google.maps.LatLng(48.8785618, 2.3603689);
            let address2 = new google.maps.LatLng(48.8762300, 2.3617500);
            let addresses = [address1, address2];
            let bounds = new google.maps.LatLngBounds();
            this.addMarkers(addresses, bounds);
        } else {

        }

    }

    /**
     * @description adding markers to map
     * @param addresses
     * @param bounds
     */
    addMarkers(addresses:any, bounds:any) {

        for (let i = 0; i < addresses.length; i++) {
            let marker = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: addresses[i]
            });
            bounds.extend(marker.position);
        }

        this.map.fitBounds(bounds);



        /*let content = "<h4>Information!</h4>";

        this.addInfoWindow(marker, content);*/


    }
    
}
