import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {BankService} from "../../providers/bank-service/bank-service";

@Component({
    templateUrl: 'build/pages/bank-account/bank-account.html',
    providers: [GlobalConfigs, BankService]
})
export class BankAccountPage {
    bank: any;
    isEmployer: boolean;
    themeColor: string;
    projectTarget: any;
    service: BankService;
    voidAccount: boolean = true;

    constructor(public nav: NavController,
                public gc: GlobalConfigs,
                service: BankService,
                public navParams: NavParams) {
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget == 'employer');

        this.service = service;

        this.bank = {
            nom_de_banque: '',
            detenteur_du_compte: '',
            iban: '',
            bic: ''
        };

        let id = 0;
        let table = '';
        if (this.projectTarget == 'jobyer') {
            id = this.navParams.data.currentUser.jobyer.id;
            table = 'fk_user_jobyer';
        } else {
            id = this.navParams.data.currentUser.employer.entreprises[0].id;
            table = 'fk_user_entreprise';
        }

        this.service.loadBankAccount(id, table, this.projectTarget).then((data: Array<any>) => {
            if (data && data.length > 0) {
                this.bank = data[0];
                this.voidAccount = false;
            } else
                this.voidAccount = true;
        });
    }

    updateBankData() {
        let id = 0;
        let table = '';
        if (this.projectTarget == 'jobyer') {
            id = this.navParams.data.currentUser.jobyer.id;
            table = 'fk_user_jobyer';
        } else {
            id = this.navParams.data.currentUser.employer.entreprises[0].id;
            table = 'fk_user_entreprise';
        }
        this.service.saveBankAccount(id, table, this.voidAccount, this.bank).then((data:any) => {
            this.nav.pop();
        });
    }

    isValidIBANNumber(input) {
        let CODE_LENGTHS = {
            AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
            CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
            FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
            HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
            LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
            MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
            RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
        };
        let iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
            code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
            digits;
        // check syntax and length
        if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
            return false;
        }
        // rearrange country code and check digits, and convert chars to ints
        digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
            return (letter.charCodeAt(0) - 55).toString();
        });
        // final check
        return this.mod97(digits);
    }

    letterProcessing(letter) {
        return letter.charCodeAt(0) - 55;
    }

    mod97(string) {
        let checksum = string.slice(0, 2), fragment;
        for (let offset = 2; offset < string.length; offset += 7) {
            fragment = String(checksum) + string.substring(offset, offset + 7);
            checksum = parseInt(fragment, 10) % 97;
        }
        return checksum;
    }

    showIBANError() {
        if (!this.bank.iban || this.bank.iban.length == 0)
            return false;
        let check = this.isValidIBANNumber(this.bank.iban);
        if (check == false)
            return true;
        return check != 1;
    }

    showBICError() {
        if (!this.bank.bic || this.bank.bic.length == 0)
            return false;
        let regSWIFT = /^([a-zA-Z]){4}([a-zA-Z]){2}([0-9a-zA-Z]){2}([0-9a-zA-Z]{3})?$/;
        return !regSWIFT.test(this.bank.bic);
    }

    isUpdateDisabled() {

        if (!this.bank)
            return true;
        if (!this.bank.detenteur_du_compte)
            return true;
        if (!this.bank.nom_de_banque)
            return true;
        if (this.bank.nom_de_banque == '')
            return true;

        if (this.showBICError())
            return true;
        if (this.showIBANError())
            return true;

        return false;
    }
}
