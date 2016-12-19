import {Component} from "@angular/core";
import {NavController, ViewController, ToastController, LoadingController, App} from "ionic-angular";
import {MissionService} from "../../providers/mission-service/mission-service";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {PaylineServices} from "../../providers/payline-services/payline-services";
import {MissionListPage} from "../mission-list/mission-list";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Storage} from "@ionic/storage";

@Component({
  templateUrl: 'modal-invoice.html'
})
export class ModalInvoicePage {
  public invoice: any;
  public contract: any;
  public viewCtrl: ViewController;
  public service: MissionService;
  public paid: boolean = false;
  public walletId: any;
  public payService: PaylineServices;
  public paymentMessage: string;
  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;

  constructor(public nav: NavController,
              viewCtrl: ViewController,
              service: MissionService,
              payService: PaylineServices,
              public globalConfig: GlobalConfigs,
              public loading: LoadingController,
              public toast: ToastController,
              public app: App,
              public storage: Storage) {
    this.payService = payService;
    this.viewCtrl = viewCtrl;
    this.service = service;
    this.invoice = {
      class: "com.vitonjob.tetra.model.PaiementClient",
      numeroContrat: "",
      numeroSiret: "",
      numeroFacture: "",
      datePaiement: "",
      montantAPayerParClient: 0.0,
      montantPayeParClient: 0.0
    };

    this.storage.get('CONTRACT_INVOICE').then((data: any) => {
      this.contract = JSON.parse(data);
      this.invoice = {
        class: "com.vitonjob.tetra.model.PaiementClient",
        numeroContrat: this.contract.numero,
        numeroSiret: "",
        numeroFacture: this.contract.numero_de_facture,
        datePaiement: this.parseDate(this.contract.date_paiement_client),
        montantAPayerParClient: this.parseNumber(this.contract.montant_a_payer_par_client),
        montantPayeParClient: this.parseNumber(this.contract.montant_paye_par_client)
      };

      this.paymentMessage = '';

      if (!isUndefined(this.contract.date_paiement_client) && this.contract.date_paiement_client != 'null') {
        this.paymentMessage = 'Paiement effectué le ' + this.displayDate(this.contract.date_paiement_client);
      }

      if (this.invoice.datePaiement)
        this.paid = true;
    });
    this.projectTarget = globalConfig.getProjectTarget();
    this.isEmployer = (this.projectTarget === 'employer');
    let config = Configs.setConfigs(this.projectTarget);
    let currentUserVar = config.currentUserVar;
    this.themeColor = config.themeColor;
    this.storage.get(currentUserVar).then((data: any) => {

      let user = JSON.parse(data);
      this.payService.checkWallet(user).then((walletId: {length: number}) => {

        if (walletId && walletId != 'null' && walletId.length > 0) {
          this.walletId = walletId;
        }
      });
    });
  }

  performPayment() {
    let now = new Date();
    let payConfig = {
      class: "com.vitonjob.payline.PaylineConfig",
      walletId: this.walletId,
      amount: '' + this.invoice.montantAPayerParClient,
      orderDate: this.dateStr(now),
      orderRef: this.invoice.numeroFacture,
      contractReference: this.invoice.numeroContrat
    };
    let loading = this.loading.create({
      content: ` 
			<div>
			<img src='assets/img/loading.gif' />
			</div>
			`,
      spinner: 'hide'
    });
    loading.present();
    this.service.validateWork(payConfig).then((data: {code: any}) => {

      loading.dismiss().then(() => {
        if (data.code == '00000') {
          let toast = this.toast.create({
            message: 'Le paiement a été effectué avec succès',
            duration: 5000
          });
          toast.present();
        } else {
          let toast = this.toast.create({
            message: 'Le paiement a été rejeté, veuillez vérifier la validité de votre carte',
            duration: 5000
          });
          toast.present();
        }
        this.nav.setRoot(MissionListPage);
      });

    });
  }

  cancelPayment() {
    this.nav.pop();
  }

  parseNumber(str) {
    if (!str || isUndefined(str) || str == 'null') {
      return 0.0;
    }

    return parseFloat(str);
  }

  parseDate(str) {
    if (!str || isUndefined(str) || str == 'null') {
      return null;
    }

    str = str.split(' ')[0];
    let d = new Date(str);

    return d;
  }

  dateStr(date) {
    let m = (date.getMonth() + 1);
    let sm = m < 10 ? '0' + m : '' + m;
    let d = date.getDate();
    let sd = d < 10 ? '0' + d : '' + d;
    let h = date.getHours();
    let sh = h < 10 ? '0' + h : '' + h;

    let min = date.getMinutes();
    let smin = min < 10 ? '0' + min : '' + min;

    let str = sd + "/" + sm + "/" + date.getFullYear() + " " + sh + ":" + smin;
    return str;
  }

  displayDate(sdate) {
    let date = sdate.split(' ')[0];
    let time = sdate.split(' ')[1];
    let formattedDate = date.split('-')[2] + '/' + date.split('-')[1] + '/' + date.split('-')[0] + ' à ' + time.split(':')[0] + ':' + time.split(':')[1];
    return formattedDate;
  }
}
