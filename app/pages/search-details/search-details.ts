import {Component, OnInit} from '@angular/core';
import {NavController, NavParams, Alert, Storage, SqlStorage, Platform} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {isUndefined} from "ionic-angular/util";
import {ContractPage} from "../contract/contract";
import {CivilityPage} from "../civility/civility";
import {LoginsPage} from "../logins/logins";
import {UserService} from "../../providers/user-service/user-service";
import {GlobalService} from "../../providers/global.service";
import {OffersService} from "../../providers/offers-service/offers-service";
import {AddressService} from "../../providers/address-service/address-service";
import {NotationService} from "../../providers/notation-service/notation-service";


declare var google:any;

@Component({
    templateUrl: 'build/pages/search-details/search-details.html',
	providers: [GlobalService, OffersService, AddressService, NotationService]
})
export class SearchDetailsPage implements OnInit {
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
    contratsAttente : any = [];
    db : Storage;
    offersService : OffersService;
    languages : any[];
    qualities : any[];
    map : any;
    availability : any;
    addressService : AddressService;
    videoPresent : boolean = false;
    videoLink : string;
    starsText : string = '';
    rating : number = 0;
    platform : any;

    constructor(public nav: NavController,
                public params : NavParams,
                public globalConfig: GlobalConfigs,
                userService : UserService,
				private globalService: GlobalService,
				platform: Platform,
                offersService : OffersService,
                addressService : AddressService,
                private notationService : NotationService) {

        // Get target to determine configs
        this.projectTarget = globalConfig.getProjectTarget();
        this.isEmployer = this.projectTarget == 'employer';
		this.platform = platform;
        this.result = params.data.searchResult;
        if(this.result.titreOffre)
            this.fullTitle = this.result.titreOffre;
        if(this.result.titreoffre)
            this.fullTitle = this.fullTitle+this.result.titreoffre;

        if(!this.isEmployer)
            this.fullName = this.result.entreprise;
        else
            this.fullName = this.result.titre+' '+this.result.prenom+' '+this.result.nom;
        this.email = this.result.email;
        this.telephone = this.result.tel;
        this.matching = this.result.matching+"%";

        this.availability = {
            duree : 0,
            code : 'vert'
        };

        //get the currentEmployer
        this.userService = userService;
        this.addressService = addressService;
        this.userService.getCurrentUser().then(results =>{

            if(results && !isUndefined(results)){
                let currentEmployer = JSON.parse(results);
                if(currentEmployer){
                    this.employer = currentEmployer;
                }
                console.log(currentEmployer);
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

        console.log(JSON.stringify(this.result));

        this.db = new Storage(SqlStorage);
        this.db.get('PENDING_CONTRACTS').then(contrats => {

            if (contrats) {
                this.contratsAttente = JSON.parse(contrats);
            } else {
                this.contratsAttente = [];
                this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));
            }
        });

        this.offersService = offersService;
        let table = this.isEmployer?'user_offre_jobyer':'user_offre_entreprise';
        let idOffers = [];
        idOffers.push(this.result.idOffre);
        this.offersService.getOffersLanguages(idOffers, table).then(data=>{
            if(data)
                this.languages = data;
        });
        this.offersService.getOffersQualities(idOffers, table).then(data=>{
            if(data)
                this.qualities = data;
        });
        this.offersService.getOfferVideo(this.result.idOffre, table).then(data=>{
            this.videoPresent = false;
            if(data && data != null && data.video && data.video != "null"){
                this.videoPresent = true;
                this.videoLink = data.video;
            }

        });

        //  Loading score
        let resultType = !this.isEmployer;
        let id = this.result.idOffre;
        this.notationService.loadSearchNotation(resultType, id).then(score=>{
            debugger;
            this.rating = score;
            this.starsText = this.writeStars(this.rating);
        });
    }

    writeStars(number:number):string {
        let starText = '';
        for (let i = 0; i < number; i++) {
            starText += '\u2605'
        }
        return starText;
    }

    ngOnInit() {
        //get the currentEmployer
        this.userService.getCurrentUser().then(results => {

            this.loadMap();

            if (results) {
                let user = JSON.parse(results);
                let addressOffer = this.result.address;
                let addressUser = '';
                if (this.isEmployer)
                    addressUser = user.employer.entreprises[0].workAdress.fullAdress;
                else
                    addressUser = user.jobyer.workAdress.fullAdress;

                this.addressService.getDistance(addressOffer, addressUser).then(data=> {
                    this.availability = data;
                });
            }
        });

    }

    loadMap() {
        let latLng = new google.maps.LatLng(48.855168, 2.344813);

        let mapOptions = {
            center: latLng,
            zoom:15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        let mapElement = document.getElementById("map_canvas");
        this.map = new google.maps.Map(mapElement, mapOptions);

        let addresses = [];

        if(this.result.latitude == "0" && this.result.longitude == "0")
            return;
        
        let latlng = new google.maps.LatLng(this.result.latitude , this.result.longitude);
        console.log(JSON.stringify(latlng));
        addresses.push(latlng);

        let bounds = new google.maps.LatLngBounds();
        this.addMarkers(addresses, bounds);

    }

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
		var sApp;
		if(this.platform.is('ios')){
			sApp = startApp.set("skype://" + this.telephone);
		}else{
			sApp = startApp.set({ 
				"action": "ACTION_VIEW",
				"uri": "skype:" + this.telephone
			});
		}
		sApp.start(() => {
			console.log('starting skype');
		}, (error) => {
			this.globalService.showAlertValidation("VitOnJob", "Erreur lors du lancement de Skype. Vérifiez que l'application est bien installée.");
		});
	}
	
    googleHangout(){
		var sApp = startApp.set({ 
			"action": "ACTION_VIEW",
			"uri": "gtalk:"+this.telephone
		});
		sApp.check((values) => { /* success */
			console.log("OK");
		}, (error) => { /* fail */
			this.globalService.showAlertValidation("VitOnJob", "Hangout n'est pas installé.");
		});	
		sApp.start(() => {
			console.log('starting hangout');
		}, (error) => {
			this.globalService.showAlertValidation("VitOnJob", "Erreur lors du lancement de Hangout.");
		});
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

    selectContract(){
        this.result.checkedContract = true;

        this.contratsAttente.push(this.result);
        this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));
    }
}
