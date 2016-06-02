import {Page, IonicApp, NavParams, NavController, Loading, Modal} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from "../../providers/search-service/search-service";
import {LoginsPage} from "../logins/logins";
import {SearchResultsPage} from "../search-results/search-results";
import {SearchCriteriaPage} from "../search-criteria/search-criteria";
import {SearchGuidePage} from "../search-guide/search-guide";
import {NetworkService} from "../../providers/network-service/network-service";
import {InfoUserPage} from "../info-user/info-user";
import {Storage, SqlStorage} from 'ionic-angular';
import {Events} from 'ionic-angular';
import {Keyboard} from "ionic-native/dist/index";


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
	private cnxBtnName : string;
	private scQuery : string;
	private popinCrietria : boolean = false;
	private isConnected : boolean;
	private recording:boolean;
	private recognition:any;


	static get parameters() {
		return [[GlobalConfigs], [IonicApp], [NavController], [NavParams], [SearchService],[NetworkService], [Events]];
	}

	constructor(public globalConfig: GlobalConfigs,
				private app: IonicApp,
				private nav: NavController,
				private navParams: NavParams,
				private searchService: SearchService,
				public networkService: NetworkService,
				public events: Events, private kb:Keyboard) {

		// Get target to determine configs
		this.projectTarget = globalConfig.getProjectTarget();
		this.storage = new Storage(SqlStorage);
		this.keyboard = kb;
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);

		//Initialize controller variables :
		this.projectName = config.projectName;
		this.themeColor = config.themeColor;
		this.imageURL = config.imageURL;
		this.highlightSentence = config.highlightSentence;
		this.isEmployer = this.projectTarget == 'employer';
		this.searchPlaceHolder = "Veuillez saisir votre recherche...";
		this.recording = false;
		this.nav = nav;
		// If we navigated to this page, we will have an item available as a nav param
		this.selectedItem = navParams.get('item');
		this.search = searchService;
		//verify if the user is already connected
		this.storage.get("currentUser").then((value) => {
			if(value){
				this.cnxBtnName = "Déconnexion";
				this.isConnected = true;
			}else{
				this.cnxBtnName = "Se connecter / S'inscrire";
				this.isConnected = false;
			}
		});


	}

	/**
	 * @description Launching semantic search from voice recognition
	 */
	launchVoiceRecognition(){

		this.recognition = new SpeechRecognition();
		this.recording = true;
		this.recognition.lang = 'fr';
		this.recognition.onresult = function(event) {

			this.recording = false;
			if (event.results.length > 0) {
				this.scQuery = event.results[0][0].transcript;
				this.doSemanticSearch();
			}
		}.bind(this);

		this.recognition.start();
	}

	stopRecognition(){
		
		this.recognition.stop();
		this.recording = false;
		this.recognition.onend = function (event) {
			this.recording = false;
		}.bind(this);
		this.recognition.onerror = function (event) {
			this.recording = false;
		}.bind(this);
		this.recognition.onnomatch = function (event) {
			this.recording = false;
		}.bind(this);
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
		if(this.isConnected){
			this.storage.set("currentUser", null);
			this.cnxBtnName = "Se connecter / S'inscrire";
			this.isConnected = false;
			this.events.publish('user:logout');
		}else{
			this.nav.push(LoginsPage);
		}
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
		this.searchService.semanticSearch(this.scQuery, 0, this.projectTarget).then((data) => {
			this.searchService.persistLastSearch(data);
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

	/**
	 * @description this method allows to render the multicriteria modal component
	 */
	showCriteriaModal(){
		var dismissedModal = function(){
			this.popinCrietria = false;
		};

		if(this.popinCrietria)
			return;
		let m = new Modal(SearchCriteriaPage);
		m.onDismiss(dismissedModal.bind(this));
		this.popinCrietria = true;
		this.nav.present(m);
	}

	/**
	 * @description this method allows to render the guided search modal component
	 */
	showGuideModal(){
		var dismissedModal = function(){
			this.popinCrietria = false;
		};

		if(this.popinCrietria)
			return;
		let m = new Modal(SearchGuidePage);
		m.onDismiss(dismissedModal.bind(this));
		this.popinCrietria = true;
		this.nav.present(m);
	}

}
