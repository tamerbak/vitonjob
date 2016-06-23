import {NavController, ActionSheet, Platform, Slides, Alert, Modal, NavParams, Toast} from 'ionic-angular';
import {Storage, SqlStorage, LocalStorage} from 'ionic-angular';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ViewChild, Component, OnInit} from '@angular/core'
import {SearchService} from "../../providers/search-service/search-service";
import {UserService} from "../../providers/user-service/user-service";
import {ContractPage} from '../contract/contract';
import {CivilityPage} from '../civility/civility';
import {JobAddressPage} from '../job-address/job-address';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {LoginsPage} from '../logins/logins';
import {isUndefined} from "ionic-angular/util";
import {OffersService} from "../../providers/offers-service/offers-service";
import {OfferAddPage} from "../offer-add/offer-add";
import {timeout} from "rxjs/operator/timeout";
import {InfoUserPage} from "../info-user/info-user";
import {ModalOfferPropositionPage} from "../modal-offer-proposition/modal-offer-proposition";


/**
 * @author jakjoud abdeslam
 * @description search results view
 * @module Search
 */
declare var google:any;

@Component({
    templateUrl: 'build/pages/search-results/search-results.html',
    providers : [OffersService]
})
export class SearchResultsPage implements OnInit {
    @ViewChild('cardSlider') slider: Slides;

    searchResults : any;
    listView : boolean = false;
    cardView : boolean = false;
    mapView : boolean = true;
    platform : Platform;
    map : any;
    cardsOptions= {
        loop: false
    };
    currentCardIndex : number = 0;
    projectTarget : any;
    avatar : string;
    resultsCount : number = 0;
    isUserAuthenticated : boolean;
    employer:any;
    isEmployer : boolean;

    //  Attributes for offer creation proposition
    proposedJob : any;
    proposedLanguages : any = [];
    proposedQualities : any = [];
    offerProposition : boolean = false;
    offersService : any;
    navParams : NavParams;

    toast : Toast;
    showingToast : boolean = false;



    /**
     * @description While constructing the view we get the last results of the search from the user
     * @param nav Navigation controller of the application
     * @param searchService the provider that allows us to get data from search service
     */
    constructor(public globalConfig: GlobalConfigs,
                public nav: NavController,
                navParams : NavParams,
                private searchService: SearchService,
                private userService:UserService,
                private offersService : OffersService,
                platform : Platform) {
        // Get target to determine configs
        this.projectTarget = globalConfig.getProjectTarget();
        this.avatar = this.projectTarget != 'jobyer' ? 'jobyer_avatar':'employer_avatar';
        this.platform = platform;
        this.isEmployer = this.projectTarget == 'employer';
        this.navParams = navParams;


        //  Retrieving last search
        searchService.retrieveLastSearch().then(results =>{

            let jsonResults = JSON.parse(results);
            if(jsonResults){
                this.searchResults = jsonResults;
                this.resultsCount = this.searchResults.length;
                for(let i = 0 ; i < this.searchResults.length ; i++){
                    let r = this.searchResults[i];
                    r.matching = Number(r.matching).toFixed(2);
                }
                console.log(this.searchResults);

                //  Determine constraints for proposed offer
                this.createCriteria();

            }
        });



        //get the connexion object and define if the there is a user connected
        userService.getConnexionObject().then(results =>{
            if(results && !isUndefined(results)){
                let connexion = JSON.parse(results);
                if(connexion && connexion.etat){
                    this.isUserAuthenticated = true;
                }else{
                    this.isUserAuthenticated = false;
                }
                console.log(connexion);
            }
        });



    }
    ngOnInit() {
        
        //get the currentEmployer
        this.userService.getCurrentUser().then(results =>{

            if(results && !isUndefined(results)){
                let currentEmployer = JSON.parse(results);
                if(currentEmployer){
                    this.employer = currentEmployer;
                }
                console.log(currentEmployer);
            }
            this.loadMap();
        });

    }

    loadMap() {
        
        let latLng = new google.maps.LatLng(48.855168, 2.344813);

        let mapOptions = {
            center: latLng,
            zoom:15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        let mapElement = document.getElementById("map");
        this.map = new google.maps.Map(mapElement, mapOptions);

        let addresses = [];
        let contentTable = [];
        for(let i = 0 ; i < this.searchResults.length ; i++){
            let r = this.searchResults[i];
            if(r.latitude=='0.0' && r.longitude=='0.0')
                continue;
            let latlng = new google.maps.LatLng(r.latitude, r.longitude);
            addresses.push(latlng);
            contentTable.push("<h4>"+r.titre+" "+r.prenom+" "+r.nom+ "</h4>" +
                "<ul>" +
                "<li>Tél : <a href='tel:" +r.tel+"'>"+r.tel+"</a></li>"+
                "<li>Email : <a href='mailto:" +r.email+"'>" +r.email+"</a></li>"+
                "</ul>");
        }
        let bounds = new google.maps.LatLngBounds();
        this.addMarkers(addresses, bounds, contentTable);
        /*let address = new google.maps.LatLng(this.opportunity.lat, this.opportunity.lng);
        let bounds = new google.maps.LatLngBounds();
        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: address
        });
        bounds.extend(marker.position);*/
    }

    addMarkers(addresses:any, bounds:any, contentTable : any) {

        for (let i = 0; i < addresses.length; i++) {
            let marker = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: addresses[i]
            });
            bounds.extend(marker.position);
            this.addInfoWindow(marker,contentTable[i]);
        }

        this.map.fitBounds(bounds);

    }

    addInfoWindow(marker, content){

        let infoWindow = new google.maps.InfoWindow({
            content: content
        });

        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.open(this.map, marker);
        });

    }

    /**
     * @description Detecting the motion of cards to the right or to the left in order to decide if we add or reject the candidate
     */
    onSlideChanged(){
        let currentIndex = this.slider.getActiveIndex();
        if(currentIndex > this.currentCardIndex){
            console.log("went right");
        } else {
            console.log("went left");
        }
        this.currentCardIndex = currentIndex;
    }

    /**
     * @description Selecting an item allows to call an action sheet for communications and contract
     * @param item the selected Employer/Jobyer
     */
    itemSelected(item){
        let actionSheet = ActionSheet.create({
            title: 'Options',
            buttons: [
                {
                    text: 'Envoyer SMS',
                    icon: 'md-mail',
                    handler: () => {
                        this.sendSMS(item);
                    }
                },{
                    text: 'Appeler',
                    icon: 'md-call',
                    handler: () => {
                        this.dialNumber(item);
                    }
                },{
                    text: 'Annuler',
                    role: 'cancel',
                    icon: 'md-close',
                    handler: () => {

                    }
                }
            ]
        });
        this.nav.present(actionSheet);

    }

    contract(item){
        console.log('Contract');
    }

    /**
     * @description This function allows to select the candidate for a group recruitment
     * @param item the selected Employer/Jobyer
     */
    addGroupContract(item){
        console.log(item);
    }

    /**
     * @description changing layout of results
     * @param mode
     */
    changeViewMode(mode){

        if(mode == 1){          //  List view
            this.listView = true;
            this.cardView = false;
            this.mapView = false;
        } else if (mode == 2){  //  Cards view
            this.listView = false;
            this.cardView = true;
            this.mapView = false;
        } else {                //  Map view
            this.listView = false;
            this.cardView = false;
            this.mapView = true;
        }
    }


    /**
     * @description verify informations of Employer/Jobyer and redirect to recruitement contract
     * @param item the selected Employer/Jobyer
     */
    recruitJobyer(jobyer){


        //init local database
        let storage = new Storage(SqlStorage);

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
                
                let o = this.navParams.get('currentOffer');
                if(o && !isUndefined(o)){
                    this.nav.push(ContractPage, {jobyer: jobyer, currentOffer : o});
                }else{
                    this.nav.push(ContractPage, {jobyer: jobyer});
                }


            } else {
                //redirect employer to fill the missing informations
                this.nav.push(InfoUserPage, {currentUser: this.employer});
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

    /**
     * @description Create a draggable widget to propose criteria for creating an offer from search results
     */
    createCriteria(){
        debugger;
        if(!this.searchResults || isUndefined(this.searchResults) || this.searchResults.length == 0)
            return;

        this.offerProposition = true;

        /*
         *  We will start by identifying the proposed job
         *  by using the first result and getting job details
         */
        let table = this.projectTarget == 'jobyer'?'user_offre_entreprise':'user_offre_jobyer';
        console.log(JSON.stringify(this.searchResults[0]));
        let idOffer = this.searchResults[0].idOffre;
        this.proposedJob = {
            id : 0,
            libellejob : '',
            idmetier : 0,
            libellemetier : 0
        };

        this.offersService.getOffersJob(idOffer,table).then(data =>{
            if(data && data.length>0)
                this.proposedJob = data[0];
            else
                this.offerProposition = false;
        });

        //  To manage resources and calls we will group offers ids
        let listOffersId = [];
        for(let i = 0 ; i < this.searchResults.length ; i++){
            let o = this.searchResults[i];
            listOffersId.push(o.idOffre);

        }

        //  Now let us get the list of languages and qualities
        this.offersService.getOffersLanguages(listOffersId, table).then(data =>{
            this.proposedLanguages = data;
        });

        this.offersService.getOffersQualities(listOffersId, table).then(data =>{
            this.proposedQualities = data;
        });

        this.toast = Toast.create({
            message: 'Vous pouvez utiliser ces critères de recherche pour créer une nouvelle offre',
            showCloseButton: true,
            closeButtonText: 'Créer'
        });

        this.toast.onDismiss(() => {
            if(this.showingToast)
                this.toggleProposition();
            this.showingToast = false;
        });

        //this.nav.present(this.toast);
        this.showingToast = true;
    }

    /**
     * @description removes from the proposition list a specific language
     * @param language
     */
    deleteLanguage(language){
        let index = this.proposedLanguages.indexOf(language);
        this.proposedLanguages.splice(index, 1);
        console.log(this.proposedLanguages);
    }

    /**
     * @description removes from the proposition list a specific quality
     * @param quality
     */
    deleteQuality(quality){
        let index = this.proposedQualities.indexOf(quality);
        this.proposedQualities.splice(index, 1);
        console.log(this.proposedQualities);
    }

    /**
     * @description dial number of jobyer/employer
     */
    dialNumber(item){
        console.log("dial number : " + item.tel);
        window.location = 'tel:'+ item.tel;
    }

    /**
     * @description send sms to jobyer/employer
     */
    sendSMS(item){
        console.log("sending SMS to : " + item.tel);
        var number = item.tel;
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

    toggleProposition(){
        debugger;
        let proposition = {
            proposedJob : this.proposedJob,
            proposedLanguages : this.proposedLanguages,
            proposedQualities : this.proposedQualities
        };

        let propositionModal = Modal.create(ModalOfferPropositionPage, proposition);
        propositionModal.onDismiss(ret =>{
            if(ret.status == true){
                this.nav.push(OfferAddPage);
            }
        });
        this.nav.present(propositionModal);
    }
}
