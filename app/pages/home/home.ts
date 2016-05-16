import {Page, IonicApp, IonicApp, NavParams, NavController, Loading} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from "../../providers/search-service/search-service";
import {LoginsPage} from "../logins/logins";
import {SearchResultsPage} from "../search-results/search-results";

@Page({
    templateUrl: 'build/pages/home/home.html',
    providers: [GlobalConfigs]
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
    private selectedItem : any;

    scQuery : string;

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

    /**
     * @author abdeslam jakjoud
     * @description perform semantic search and pushes the results view
     */
    doSemanticSearch(){
        let loading = Loading.create({
            content: ` 
                <div>
                    <img src='img/loading.gif' />
                </div>
                `,
            spinner : 'hide'
        });
        this.nav.present(loading);
        console.log('Initiating search for '+this.scQuery);
        this.ss.semanticSearch(this.scQuery, 0, this.projectTarget).then((data) => {
            this.ss.persistLastSearch(data);
            loading.dismiss();
            this.nav.push(SearchResultsPage);
        });
    }

    /**
     * @author abdeslam jakjoud
     * @description checking whether the user used the enter button to startup the semantic search
     * @param e Key Up javascript event allowing us to access the keyboard used key
     */
    checkForEnterKey(e){
        if(e.code != "Enter")
            return;

        this.doSemanticSearch();
    }
}
