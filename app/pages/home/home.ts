import {Page, IonicApp, IonicApp, NavParams, NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from "../../providers/search-service/search-service";
import {LoginsPage} from "../logins/logins";

@Page({
    templateUrl: 'build/pages/home/home.html',
    providers: [GlobalConfigs, SearchService]
})
export class HomePage {
    private projectName:string;
    private themeColor:string;
    private isEmployer:string;
    private imageURL:string;
    private searchPlaceHolder:string;
    private projectTarget:string;
    private highlightSentence:string;
    private search : any;

    static get parameters() {
        return [[GlobalConfigs], [IonicApp], [NavController], [NavParams], [SearchService]];
    }

    constructor(public gc: GlobalConfigs,
                private app: IonicApp,
                private nav: NavController,
                private navParams: NavParams,
                private ss: SearchService) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        //Initialize controller variables :
        this.projectName = config.projectName;
        this.themeColor = config.themeColor;
        this.imageURL = config.imageURL;
        this.highlightSentence = config.highlightSentence;
        this.isEmployer = this.projectTarget == 'employer';
        this.searchPlaceHolder = "Veuillez saisir votre recherche...";

        this.nav = nav;
        // If we navigated to this page, we will have an item available as a nav param
        this.selectedItem = navParams.get('item');
        this.search = ss;
    }

    onFocus() {
        if (this.projectTarget == 'employer')
            this.searchPlaceHolder = "Ex : Je cherche un serveur débutant disponible demain sur Villepinte";
        else
            this.searchPlaceHolder = "Ex : Je cherche une offre d'emploi pour serveur débutant demain sur Villepinte";
    }

    onBlur() {
        this.searchPlaceHolder = "Veuillez saisir votre recherche...";
    }

    openLoginsPage() {
        this.nav.push(LoginsPage);
    }
}
