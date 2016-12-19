import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Vitonjob } from './app.component';
import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import {AdvancedSearchPage} from "../pages/advanced-search/advanced-search";
import {AttachementsPage} from "../pages/attachements/attachements";
import {BankAccountPage} from "../pages/bank-account/bank-account";
import {CivilityPage} from "../pages/civility/civility";
import {ContractPage} from "../pages/contract/contract";
import {ContractWizardPage} from "../pages/contract-wizard/contract-wizard";
import {ContractualisationPage} from "../pages/contractualisation/contractualisation";
import {CorrespondenceAddressPage} from "../pages/correspondence-address/correspondence-address";
import {GeneralConditionsPage} from "../pages/general-conditions/general-conditions";
import {InfoUserPage} from "../pages/info-user/info-user";
import {JobAddressPage} from "../pages/job-address/job-address";
import {LoginsPage} from "../pages/logins/logins";
import {MailPage} from "../pages/mail/mail";
import {MissionDetailsPage} from "../pages/mission-details/mission-details";
import {MissionEndInvoicePage} from "../pages/mission-end-invoice/mission-end-invoice";
import {MissionEndRelevePage} from "../pages/mission-end-releve/mission-end-releve";
import {MissionListPage} from "../pages/mission-list/mission-list";
import {MissionPointingPage} from "../pages/mission-pointing/mission-pointing";
import {ModalAttachementPage} from "../pages/modal-attachement/modal-attachement";
import {ModalCalendarPage} from "../pages/modal-calendar/modal-calendar";
import {ModalCorporamaSearchPage} from "../pages/modal-corporama-search/modal-corporama-search";
import {ModalGalleryPage} from "../pages/modal-gallery/modal-gallery";
import {ModalInvoicePage} from "../pages/modal-invoice/modal-invoice";
import {ModalJobPage} from "../pages/modal-job/modal-job";
import {ModalLanguagePage} from "../pages/modal-language/modal-language";
import {ModalOfferPropositionPage} from "../pages/modal-offer-proposition/modal-offer-proposition";
import {ModalOffersPage} from "../pages/modal-offers/modal-offers";
import {ModalPicturePage} from "../pages/modal-picture/modal-picture";
import {ModalQualityPage} from "../pages/modal-quality/modal-quality";
import {ModalRecruiterManualPage} from "../pages/modal-recruiter-manual/modal-recruiter-manual";
import {ModalRecruiterRepertoryPage} from "../pages/modal-recruiter-repertory/modal-recruiter-repertory";
import {ModalSelectionPage} from "../pages/modal-selection/modal-selection";
import {ModalSlotPage} from "../pages/modal-slot/modal-slot";
import {ModalTrackMissionPage} from "../pages/modal-track-mission/modal-track-mission";
import {ModalUpdatePassword} from "../pages/modal-update-password/modal-update-password";
import {NotificationContractPage} from "../pages/notification-contract/notification-contract";
import {OfferAddPage} from "../pages/offer-add/offer-add";
import {OfferDetailPage} from "../pages/offer-detail/offer-detail";
import {OfferListPage} from "../pages/offer-list/offer-list";
import {OfferQuotePage} from "../pages/offer-quote/offer-quote";
import {OfferTempQuotePage} from "../pages/offer-temp-quote/offer-temp-quote";
import {PaymentPage} from "../pages/payment/payment";
import {PendingContractsPage} from "../pages/pending-contracts/pending-contracts";
import {PendingContratDetailsPage} from "../pages/pending-contrat-details/pending-contrat-details";
import {PersonalAddressPage} from "../pages/personal-address/personal-address";
import {PhonePage} from "../pages/phone/phone";
import {PopoverAutocompletePage} from "../pages/popover-autocomplete/popover-autocomplete";
import {PopoverOfferDetailPage} from "../pages/popover-offer-detail/popover-offer-detail";
import {PopoverRecruiterPage} from "../pages/popover-recruiter/popover-recruiter";
import {PopoverSearchPage} from "../pages/popover-search/popover-search";
import {ProfilePage} from "../pages/profile/profile";
import {ProfileLanguagesPage} from "../pages/profile-languages/profile-languages";
import {ProfileQualitiesPage} from "../pages/profile-qualities/profile-qualities";
import {ProfileSlotsPage} from "../pages/profile-slots/profile-slots";
import {RecruiterListPage} from "../pages/recruiter-list/recruiter-list";
import {SearchAutoPage} from "../pages/search-auto/search-auto";
import {SearchCriteriaPage} from "../pages/search-criteria/search-criteria";
import {SearchDetailsPage} from "../pages/search-details/search-details";
import {SearchGuidePage} from "../pages/search-guide/search-guide";
import {SearchResultsPage} from "../pages/search-results/search-results";
import {SettingsPage} from "../pages/settings/settings";
import {SettingPasswordPage} from "../pages/setting-password/setting-password";
import {SlimPayPage} from "../pages/slimPay/slimPay";
import {WalletCreatePage} from "../pages/wallet-create/wallet-create";
import {YousignPage} from "../pages/yousign/yousign";
import {GooglePlaces} from "../components/google-places/google-places";
import {SwipeVertical} from "../components/swipe-vertical/swipe-vertical";
import {Configs} from "../configurations/configs";
import {GlobalConfigs} from "../configurations/globalConfigs";
import {AddressUtils} from "../utils/addressUtils";
import {DateUtils} from "../utils/date-utils";
import {Utils} from "../utils/utils";
import {AccountConstraints} from "../validators/account-constraints";
import {NumSSConstraints} from "../validators/numss-constraints";
import {AddressService} from "../providers/address-service/address-service";
import {AttachementsService} from "../providers/attachements-service/attachements-service";
import {BankService} from "../providers/bank-service/bank-service";
import {CommunesService} from "../providers/communes-service/communes-service";
import {ContractService} from "../providers/contract-service/contract-service";
import {CorporamaService} from "../providers/corporama-service/corporama-service";
import {FinanceService} from "../providers/finance-service/finance-service";
import {HomeService} from "../providers/home-service/home-service";
import {ImageService} from "../providers/image-service/image-service";
import {MedecineService} from "../providers/medecine-service/medecine-service";
import {MissionService} from "../providers/mission-service/mission-service";
import {NetworkService} from "../providers/network-service/network-service";
import {NotationService} from "../providers/notation-service/notation-service";
import {OffersService} from "../providers/offers-service/offers-service";
import {ParametersService} from "../providers/parameters-service/parameters-service";
import {PaylineServices} from "../providers/payline-services/payline-services";
import {PaymentService} from "../providers/payment-service/payment-service";
import {ProfileService} from "../providers/profile-service/profile-service";
import {PushNotificationService} from "../providers/push-notification-service/push-notification-service";
import {RecruiterService} from "../providers/recruiter-service/recruiter-service";
import {SearchService} from "../providers/search-service/search-service";
import {SmsService} from "../providers/sms-service/sms-service";
import {UserService} from "../providers/user-service/user-service";
import {AuthenticationService} from "../providers/authentication-service/authentication-service";
import {DataProviderService} from "../providers/data-provider-service/data-provider-service";
import {GlobalService} from "../providers/global-service/global-service";
import {Helpers} from "../providers/helpers-service/helpers-service";
import {LoadListService} from "../providers/load-list-service/load-list-service";
import {SqlStorageService} from "../providers/sql-storage-service/sql-storage-service";
import {ValidationDataService} from "../providers/validation-data-service/validation-data-service";
import {Storage} from "@ionic/storage";
import {DateConverter} from "../pipes/date-converter/date-converter";
import {TimeConverter} from "../pipes/time-converter/time-converter";

@NgModule({
  declarations: [
    Vitonjob,
    AboutPage,
    AdvancedSearchPage,
    AttachementsPage,
    BankAccountPage,
    CivilityPage,
    ContractPage,
    ContractWizardPage,
    ContractualisationPage,
    CorrespondenceAddressPage,
    GeneralConditionsPage,
    HomePage,
    InfoUserPage,
    JobAddressPage,
    LoginsPage,
    MailPage,
    MissionDetailsPage,
    MissionEndInvoicePage,
    MissionEndRelevePage,
    MissionListPage,
    MissionPointingPage,
    ModalAttachementPage,
    ModalCalendarPage,
    ModalCorporamaSearchPage,
    ModalGalleryPage,
    ModalInvoicePage,
    ModalJobPage,
    ModalLanguagePage,
    ModalOfferPropositionPage,
    ModalOffersPage,
    ModalPicturePage,
    ModalQualityPage,
    ModalRecruiterManualPage,
    ModalRecruiterRepertoryPage,
    ModalSelectionPage,
    ModalSlotPage,
    ModalTrackMissionPage,
    ModalUpdatePassword,
    NotificationContractPage,
    OfferAddPage,
    OfferDetailPage,
    OfferListPage,
    OfferQuotePage,
    OfferTempQuotePage,
    PaymentPage,
    PendingContractsPage,
    PendingContratDetailsPage,
    PersonalAddressPage,
    PhonePage,
    PopoverAutocompletePage,
    PopoverOfferDetailPage,
    PopoverRecruiterPage,
    PopoverSearchPage,
    ProfilePage,
    ProfileLanguagesPage,
    ProfileQualitiesPage,
    ProfileSlotsPage,
    RecruiterListPage,
    SearchAutoPage,
    SearchCriteriaPage,
    SearchDetailsPage,
    SearchGuidePage,
    SearchResultsPage,
    SettingPasswordPage,
    SettingsPage,
    SlimPayPage,
    WalletCreatePage,
    YousignPage,
    // Custom components
    GooglePlaces,
    SwipeVertical,
    DateConverter,
    TimeConverter

  ],
  imports: [
    IonicModule.forRoot(Vitonjob, {
      backButtonText: ''
    }, {})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Vitonjob,
    AboutPage,
    AdvancedSearchPage,
    AttachementsPage,
    BankAccountPage,
    CivilityPage,
    ContractPage,
    ContractWizardPage,
    ContractualisationPage,
    CorrespondenceAddressPage,
    GeneralConditionsPage,
    HomePage,
    InfoUserPage,
    JobAddressPage,
    LoginsPage,
    MailPage,
    MissionDetailsPage,
    MissionEndInvoicePage,
    MissionEndRelevePage,
    MissionListPage,
    MissionPointingPage,
    ModalAttachementPage,
    ModalCalendarPage,
    ModalCorporamaSearchPage,
    ModalGalleryPage,
    ModalInvoicePage,
    ModalJobPage,
    ModalLanguagePage,
    ModalOfferPropositionPage,
    ModalOffersPage,
    ModalPicturePage,
    ModalQualityPage,
    ModalRecruiterManualPage,
    ModalRecruiterRepertoryPage,
    ModalSelectionPage,
    ModalSlotPage,
    ModalTrackMissionPage,
    ModalUpdatePassword,
    NotificationContractPage,
    OfferAddPage,
    OfferDetailPage,
    OfferListPage,
    OfferQuotePage,
    OfferTempQuotePage,
    PaymentPage,
    PendingContractsPage,
    PendingContratDetailsPage,
    PersonalAddressPage,
    PhonePage,
    PopoverAutocompletePage,
    PopoverOfferDetailPage,
    PopoverRecruiterPage,
    PopoverSearchPage,
    ProfilePage,
    ProfileLanguagesPage,
    ProfileQualitiesPage,
    ProfileSlotsPage,
    RecruiterListPage,
    SearchAutoPage,
    SearchCriteriaPage,
    SearchDetailsPage,
    SearchGuidePage,
    SearchResultsPage,
    SettingPasswordPage,
    SettingsPage,
    SlimPayPage,
    WalletCreatePage,
    YousignPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AddressService,
    AttachementsService,
    AuthenticationService,
    BankService,
    CommunesService,
    ContractService,
    CorporamaService,
    DataProviderService,
    FinanceService,
    GlobalService,
    Helpers,
    HomeService,
    ImageService,
    LoadListService,
    MedecineService,
    MissionService,
    NetworkService,
    NotationService,
    OffersService,
    ParametersService,
    PaylineServices,
    PaymentService,
    ProfileService,
    PushNotificationService,
    RecruiterService,
    SearchService,
    SmsService,
    SqlStorageService,
    UserService,
    ValidationDataService,
    Storage,
    Configs,
    GlobalConfigs,
    AddressUtils,
    DateUtils,
    Utils,
    AccountConstraints,
    NumSSConstraints
  ]
})
export class AppModule {}
