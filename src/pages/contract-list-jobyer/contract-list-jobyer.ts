import {Component} from "@angular/core";
import {NavController, NavParams, LoadingController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Utils} from "../../utils/utils";
import {UserService} from "../../providers/user-service/user-service";
import {ContractService} from "../../providers/contract-service/contract-service";
import {Contract} from "../../dto/contract";
import {OffersService} from "../../providers/offers-service/offers-service";
import {DateUtils} from "../../utils/date-utils";
import {YousignPage} from "../yousign/yousign";
import {MissionListJobyerPage} from "../mission-list-jobyer/mission-list-jobyer";
import {InAppBrowser} from "ionic-native";
import {MissionService} from "../../providers/mission-service/mission-service";

@Component({
    templateUrl: 'contract-list-jobyer.html',
    selector: 'contract-list-jobyer'
})

export class ContractListJobyerPage {
    public projectTarget: string;
    public isEmployer: boolean;
    public themeColor: string;
    public contractList: Contract[] = [];
    public backgroundImage: string;
    public currentUser: any;
    public today: Date = new Date();

    constructor(public gc: GlobalConfigs,
                public navParams: NavParams,
                public nav: NavController,
                private contractService: ContractService,
                public offerService: OffersService,
                private userService: UserService,
                private missionService: MissionService,
                public loading: LoadingController) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        this.isEmployer = (this.projectTarget == 'employer');
    }

    ngOnInit(){
        let loading = this.loading.create({content:"Merci de patienter..."});
        loading.present();
        this.userService.getCurrentUser(this.projectTarget).then(results => {
            this.currentUser = JSON.parse(results);
            if(this.isEmployer){
                this.contractService.getNonSignedContracts(this.currentUser.employer.entreprises[0].id).then((data: any) => {
                    if (data && data.status == "success" && data.data) {
                        this.contractList = data.data;
                        loading.dismiss();
                    }
                });
            }else{
                this.contractService.getNonSignedJobyerContracts(this.currentUser.jobyer.id).then((data: any) => {
                    if (data && data.status == "success" && data.data) {
                        this.contractList = data.data;
                        loading.dismiss();
                    }
                });
            }
        });
    }

    goToDocusignPage(contract) {
        //les recruteurs n'ont pas le droit de signer des contrats
        if(this.currentUser.estRecruteur){
            return;
        }

        if(!this.isEmployer){
            //set variables in local storage and navigate to docusign page
            this.setDocusignFrame(contract);
        }else{
            let loading = this.loading.create({content:"Merci de patienter..."});
            loading.present();

            //get offer info of the selected contract
            this.offerService.getOffer(contract.idOffer, this.projectTarget).then((data: any) => {
                let offer = data;

                //initalize jobyer object
                let jobyer = {
                    prenom: contract.prenom,
                    nom: contract.nom,
                    numSS: contract.numSS,
                    lieuNaissance: contract.lieuNaissance,
                    nationaliteLibelle: contract.nationaliteLibelle,
                    email: contract.email,
                    tel: contract.tel,
                    address: ''
                };

                //get jobyer address
                this.contractService.getJobyerAdress(contract.jobyerId).then((address: string) => {
                    jobyer.address = address;

                    //specify if horaire fixes ou variables
                    contract.isScheduleFixed = (contract.isScheduleFixed.toUpperCase() == 'OUI' ? 'true' : 'false');

                    //attach the company name to the contract object
                    contract.companyName = this.currentUser.employer.entreprises[0].nom;

                    //attach offer remuneration to contract object
                    contract.salaryNHours = Utils.parseNumber(offer.jobData.remuneration).toFixed(2) + " € B/H";

                    //convert epiString to epi list and attach it to the contract object
                    contract.epiList = [];
                    if (contract.epiString && contract.epiString.split(';').length != 0) {
                        let epiArray = contract.epiString.split(';');
                        for (let i = 0; i < epiArray.length; i++) {
                            if (!Utils.isEmpty(epiArray[i])) {
                                contract.epiList.push(epiArray[i]);
                            }
                        }
                    }

                    //specify equipement string
                    if(contract.epiList && contract.epiList.length > 0) {
                        contract.equipements = '(Voir annexe)';
                    } else {
                        contract.equipements = "Aucun";
                    }

                    //these infos are not filled or readonly in the contract
                    contract.salarySH35 = "+00%";
                    contract.salarySH43 = "+00%";
                    contract.restRight = "00%";
                    contract.customer = "";
                    contract.primes = 0;
                    contract.indemniteCongesPayes = "10.00%";
                    contract.centreMedecineETT = "CMIE";
                    contract.adresseCentreMedecineETT = "4 rue de La Haye – 95731 ROISSY EN FRANCE";

                    //load prerequis of the currrent offer and attach them to contract object
                    this.offerService.loadOfferPrerequisObligatoires(contract.idOffer).then((data:any)=>{
                        offer.jobData.prerequisObligatoires = [];
                        for(let j = 0 ; j < data.length ; j++){
                            offer.jobData.prerequisObligatoires.push(data[j].libelle);
                        }
                        contract.prerequis = offer.jobData.prerequisObligatoires;

                        //load offer address and attach it to contract object
                        this.offerService.loadOfferAdress(contract.idOffer, "employeur").then((data: any) => {
                            contract.adresseInterim = data;
                            contract.workAdress = data;

                            loading.dismiss();

                            //set variables in local storage and navigate to docusign page
                            this.nav.push(YousignPage, {jobyer: jobyer, currentOffer: offer, contractData: contract});
                        });
                    });
                });
            });
        }
    }

    setDocusignFrame(contract){
        if(!this.isEmployer) {
            let link = contract.partnerJobyerLink;

            let browser = new InAppBrowser(link, '_blank', 'hardwareback=no');
            browser.on('exit').subscribe(() => {
                this.missionService.checkSignature(contract.id, this.projectTarget).then((signed: boolean) => {
                    if (signed) {
                        this.nav.push(MissionListJobyerPage);
                    }
                });
            }, (err) => {
                console.log(err);
            });
        }
    }

    preventNull(str) {
        return Utils.preventNull(str);
    }

    toDateString(d){
        return DateUtils.toDateString(d);
    }

    toHourString(m){
        return DateUtils.toHourString(m);
    }

    convertToDate(d){
        return DateUtils.convertToDate(d);
    }

    upperCase(str) {
        return Utils.upperCase(str);
    }
}