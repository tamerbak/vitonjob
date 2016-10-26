import {Component} from "@angular/core";
import {NavController, SqlStorage, Storage, ViewController, Platform, NavParams, Events, Alert} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {HomePage} from "../home/home";
import {CivilityPage} from "../civility/civility";
import {UserService} from "../../providers/user-service/user-service";

/*
 Generated class for the GeneralConditionsPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/general-conditions/general-conditions.html',
    providers: [UserService]
})
export class GeneralConditionsPage {

    private currentUserVar:string;
    private profilPictureVar:string;
    private currentUser:any;
    private storage:any;
    private projectTarget:string;
    private backgroundImage: any;
    private viewCtrl : ViewController;
    private platform:Platform;
    private params:NavParams;
    private nav:NavController;
    private events: any;
    private userService: UserService;
    private gConditions:{
        title:string,
        legalInformation:{title:string, content:string },
        preamble:{title:string, content:string},
        object:{title:string, content:string},
        articles:Array<{title:string, code:number,content:Array<{subTitle:string,subCode:number,subContent:string}>}>,
        footer:string
    };
    
    constructor(private _nav:NavController, private globalConfig:GlobalConfigs,
                private _viewCtrl: ViewController, private _platform: Platform,
                private _params: NavParams, _events: Events, private _userService: UserService) {

        this.viewCtrl = _viewCtrl;
        this.platform = _platform;
        this.params = _params;
        this.nav = _nav;
        this.events = _events;
        this.userService = _userService;
        this.projectTarget = globalConfig.getProjectTarget();
        this.storage = new Storage(SqlStorage);
        let config = Configs.setConfigs(this.projectTarget);
        this.currentUserVar = config.currentUserVar;
        this.profilPictureVar = config.profilPictureVar;
        this.backgroundImage = config.backgroundImage;

        if (this.projectTarget === 'employer') {
            // CGV
            this.gConditions = {
                title: "Conditions Générales de Vente Vit-On-Job",
                legalInformation: {
                    title: "Informations légales",
                    content: "« Vit-On-Job » est une suite d’applications mobiles développées par la Société " +
                    "MANAONA, Société par Actions simplifiée à associé unique, immatriculée au " +
                    "Registre du Commerce et des Sociétés de Bobigny sous le numéro 814 360 830, au " +
                    "capital social de 11 125,00 Euros, dont le siège social est situé au Bâtiment Aéronef, " +
                    "BP 13918, 5 rue de Copenhague, Roissypôle, 93290 – Tremblay en France, ciaprès « Manaona »."
                },
                preamble: {
                    title: "Préambule",
                    content: "« Vit-On-Job » est une suite d’applications mobiles permettant la mise en relation de " +
                    "demandeurs d’emplois avec des entreprise utilisatrices en demande de recrutement. " +
                    "La solution « Vit-On-Job » est porteuse de quatre valeurs : « Simplicité », dans la " +
                    "mesure où quelques clics suffisent à trouver un emploi / un employé ; « Innovation », " +
                    "du fait du fort apport des nouvelles technologies au service ; « Performance », car " +
                    "« Vit-On-Job » se place comme partenaire du développement des utilisateurs de " +
                    "l’application ; et « Progrès social », car le service permet d’apporter une solution " +
                    "concrète et pragmatique aux recherches et aux demandes d’emploi."
                },
                object: {
                    title: "Objet des présentes Conditions Générales de Vente",
                    content: "Les présentes Conditions Générales de Vente régissent l’utilisation de l’application " +
                    "mobile « Vit-On-Job », ciaprès Vit-On-Job, pour l’« Entreprise Utilisatrice », c’està dire " +
                    "l’entreprise en recherche de jobyers. " +
                    "Vit-On-Job est une plateforme de mise en relation d’Entreprise Utilisatrices et de Jobyers. " +
                    "Manaona est un prestataire de service et de portage salarial pour des entreprises de travail temporaire."
                },
                articles: [
                    {
                        // article 1
                        title: "Définitions",
                        code: 1,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: " « Application » : désigne l’application mobile « Vit-On-Job Entreprise Utilisatrice » ; " +
                                " « Coffrefort numérique » : caractérise le lieu de stockage personnel de " +
                                "l’Entreprise utilisatrice. Les données sont accessibles pour une durée de 10 ans. Pour davantage " +
                                "d’informations, nous vous prions de bien vouloir vous référer aux conditions générales de vente et " +
                                "d’utilisation du prestataire Yousign disponibles sur le lien suivant : XXX. " +
                                " « Compte » : désigne le compte utilisateur personnel créé par l’utilisateur de l’Application ; " +
                                " « Conditions Générales de Vente » : présentes conditions générales de vente; " +
                                " « Entreprise de Travail Temporaire », ciaprès « ETT » : désigne l’entreprise type agence d’intérim " +
                                "mettant un Jobyer à disposition d’une entreprise utilisatrice; " +
                                " « Entreprise Utilisatrice » : ciaprès « EU » : désigne l’entreprise type utilisateur des services " +
                                "proposés par Vit-On-Job ; " +
                                " « Job » : désigne la mission temporaire à destination du Jobyer ; " +
                                " « Jobyer » : utilisateur de l’Application en recherche d’emploi ; " +
                                " « Site » : désigne le site Internet www.Vit-On-Job.com ; " +
                                " « Service » : désigne le service de recrutement et demande d’emploi proposé par Manaona, accessible " +
                                "par l’Application ou le Site ; " +
                                " « Utilisateur » : désigne l’Entreprise Utilisatrice, le Jobyer, ou tout autre " +
                                "utilisateur de l’un des services proposés par Vit-On-Job."
                            }
                        ]
                    },
                    {
                        // article 2
                        title: "Prérequis de l’Entreprise Utilisatrice",
                        code: 2,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "En adhérant aux présentes Conditions Générales de Vente, l’Entreprise Utilisatrice déclare " +
                                "exercer une activité licite, disposer de la capacité d’accueil et d’embauche de Jobyers. L’Entreprise " +
                                "Utilisatrice déclare avoir été informée de la possibilité de sauvegarder ou d’imprimer les Conditions " +
                                "Générales afin d’en conserver un exemplaire sur un support durable. L’Entreprise Utilisatrice est " +
                                "informée que la dernière version des Conditions Générales constitue la version qui lui est opposable, " +
                                "nonobstant la sauvegarde ou l’impression préalable qui aurait été effectuée. L’Entreprise Utilisatrice " +
                                "est une personne morale. L’Utilisateur du Service déclare, en adhérant aux présentes, disposer de la " +
                                "délégation de pouvoirs lui permettant de procéder aux recrutements de Jobyer."
                            }
                        ]
                    },
                    {
                        // article 3
                        title: "Acceptation des Conditions Générales de Vente",
                        code: 3,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "L’installation et l’utilisation de l’Application entraînent pour l’Entreprise Utilisatrice" +
                                "l’acceptation intégrale, et sans réserve aucune, des présentes Conditions Générales de Vente. En cas " +
                                "de désaccord avec l’une des stipulations des présentes Conditions, Manaona invite l’Entreprise " +
                                "Utilisatrice à procéder à la suppression de son compte personnel."
                            }
                        ]
                    },
                    {
                        // article 4
                        title: "Description de l’accès au Service",
                        code: 4,
                        content: [
                            {
                                subTitle: "Création du compte de l’Entreprise Utilisatrice",
                                subCode: 1,
                                subContent: "Après installation de l’Application, l’Entreprise Utilisatrice est invitée à se créer un " +
                                "Compte. La création de ce Compte s’opère par l’entrée de son numéro de téléphone mobile et de son " +
                                "adresse courriel. L’accès aux fonctionnalités du Service implique la soumission d’une adresse courriel " +
                                "valide. L’accès aux fonctionnalités du Service peut s’effectuer via la plateforme du Site, ou " +
                                "de l’Application mobile. L’Entreprise Utilisatrice est invitée à entrer un mot de passe de six caractères " +
                                "au minimum. Ce mot de passe est strictement confidentiel. L’Entreprise Utilisatrice s’engage à ne pas l" +
                                "e divulguer, et demeure responsable de tous les actes et agissements de tiers utilisant son Compte, même " +
                                "à son insu. L’Entreprise Utilisatrice s’engage à mettre tous les moyens en œuvre en vue d’assurer " +
                                "la confidentialité de ce mot de passe, et à le changer régulièrement afin d’assurer une sécurité optimale " +
                                "des informations du Compte contre toute utilisation frauduleuse, qui le cas échéant, engage l’Entreprise " +
                                "Utilisatrice à en informer Manaona dans les plus brefs délais, par l’envoi d’un courriel à l’adresse : " +
                                "contact@Vit-On-Job.com ou sur le formulaire de contact disponible à l’adresse suivante : " +
                                "http://www.Vit-On-Job.com/nouscontacter/ " +
                                "L’Entreprise Utilisatrice est invitée à ajouter des informations relatives à l’entreprise, " +
                                "sous la forme d’une « Fiche de l’entreprise », comprenant les éléments suivants : " +
                                " Titre (Mme, Mlle, M.) ; " +
                                " Nom ; " +
                                " Prénom ; " +
                                " Nom entreprise ; " +
                                " Numéro de SIRET ; " +
                                " Code NAF ; " +
                                " Vidéo de présentation ; " +
                                " Logo. " +
                                "Ces informations peuvent être saisies dès la création du Compte, et au plus tard au " +
                                "moment du premier contact avec le Jobyer. " +
                                "L’Entreprise Utilisatrice est invitée à ajouter un scan de l’extrait Kbis de son entreprise, ou " +
                                "d’en prendre une photographie par le biais de son mobile. " +
                                "L’Entreprise Utilisatrice, pour valider la création de son Compte, doit valider les informations remplies. " +
                                "Un message provenant de Vit-On-Job apparaît sur l’écran du téléphone mobile, proposant d’accepter " +
                                "la géolocalisation de l’Entreprise Utilisatrice, dès lors qu’il se situe sur le lieu du siège social. " +
                                "En cliquant sur « Oui », un nouveau message apparaît, demandant autorisation à l’Entreprise Utilisatrice " +
                                "d’accéder à ses données de localisation lorsqu’il utilise l’Application. Une fois connectée, " +
                                "l’Entreprise Utilisatrice est libre de naviguer dans le menu de l’Application, sur les liens suivants : " +
                                " « Lancer une recherche » : cette fonctionnalité permet, grâce à la saisie manuelle, d’effectuer une " +
                                "recherche sur le type d’emploi recherché par l’Entreprise Utilisatrice, en fonction de sa géolocalisation. " +
                                "Une liste de résultats s’affiche, et propose des Jobyers disponibles. En cliquant sur l’un de ces profils, " +
                                "l’Entreprise Utilisatrice voit apparaître sur son écran plusieurs options : « Envoyer SMS », « Appeler », " +
                                "au libre choix de l’Entreprise Utilisatrice. " +
                                " « Mon Profil » : cette fonctionnalité est un récapitulatif des informations saisies lors de la " +
                                "création du Compte. L’Entreprise Utilisatrice est libre d’en modifier le contenu en cliquant sur l’onglet « Modifier ». " +
                                " « Mes offres » : cette fonctionnalité permet d’établir une liste des offres que l’Entreprise Utilisatrice " +
                                "proposera via l’Application. L’onglet « + » permet d’ajouter une offre de job. Est ainsi requis le secteur " +
                                "du job de l’espèce, la saisine du job, le niveau du job (au choix Débutant ou Expérimenté), et la " +
                                "rémunération proposée (en Euros ou en Dollars). " +
                                " « Suivi des missions » : cette fonctionnalité permet d’établir une liste des contrats préalablement " +
                                "signés avec des Jobyers. Un onglet de recherche permet d’effectuer des recherches. Une recherche guidée " +
                                "permet de rechercher un Jobyer, et invite l’Entreprise Utilisatrice à saisir la compétence qu’il recherche, " +
                                "le niveau requis, et la date de disponibilité. L’Entreprise Utilisatrice n’a plus qu’à valider la recherche " +
                                "guidée. L’onglet propose également une recherche par critères. L’Entreprise Utilisatrice est alors invité " +
                                "à saisir des critères et mots clefs, en cliquant sur les icônes correspondant au métier, au Job, au " +
                                "nom/prénom, à l’adresse, ou à la date de disponibilité. " +
                                " « Mes options » : cette fonctionnalité permet à l’Entreprise Utilisatrice de modifier des données " +
                                "relatives au Compte : le téléphone, l’adresse courriel, le mot de passe. Cette fonctionnalité permet " +
                                "aussi de se déconnecter de l’Application. " +
                                " « A propos » : est une description du Service proposé par Manaona. L’Entreprise Utilisatrice pourra " +
                                "régulièrement et en toute liberté sur l’Application ou le Site apporter des mises à jour de ses informations " +
                                "en accédant dans le menu de l’Application à l’onglet « Mon Profil », puis sur le lien « Modifier ». " +
                                "L’Entreprise Utilisatrice peut, dès l’inscription au Service, via l’Application ou le Site, en utiliser " +
                                "les fonctionnalités pour une durée indéterminée. L’inscription au Service génère l’édition d’un devis; " +
                                "l’utilisation du Service induit nécessairement l’acceptation du devis ainsi que des conditions générales " +
                                "d’utilisation et de vente de l’Entreprise de Travail Temporaire, disponibles sur le lien suivant : XXXXX. " +
                                "Le devis est édité en version PDF que l’Entreprise Utilisatrice est invité à signé en ligne. " +
                                "Une fois le devis signé, il est incorporé dans le Coffrefort numérique de l’Entreprise Utilisatrice. " +
                                "L’inscription au Service génère l’envoi d’un courrier non nominatif adressé au responsable du recrutement " +
                                "l’avertissant de la démarche, et l’invitant à contacter Mananoa au cas où il n’en serait pas l’investigateur."
                            },
                            {
                                subTitle: "Fermeture du compte personnel de l’Entreprise Utilisatrice",
                                subCode: 2,
                                subContent: "À tout moment, et selon sa seule volonté, l’Entreprise Utilisatrice aura la libre faculté " +
                                "de procéder à la fermeture de son Compte personnel, en envoyant un courriel le mentionnant à l’adresse " +
                                "suivante : contact@Vit-On-Job.com Dès réception de cette requête, Manaona s’engage à supprimer le Compte " +
                                "de l’Entreprise Utilisatrice dans les meilleurs délais. Manaona se réserve le droit de procéder à la " +
                                "suppression, ou de rendre impossible l’accès du Compte de l’Entreprise Utilisatrice en cas d’utilisation " +
                                "abusive, frauduleuse, ou en violation des présentes Conditions Générales, de manière temporaire ou définitive."
                            }
                        ]
                    },
                    {
                        // article 5
                        title: "Recrutement du Jobyer",
                        code: 5,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les présentes rappellent que le choix du Jobyer est du seul ressort de l’Entreprise " +
                                "Utilisatrice. Il dispose des éléments fournis par le Jobyer, d’une note de comptabilité avec " +
                                "la recherche afin d’établir son choix. Une fois le choix opéré par l’Entreprise Utilisatrice, " +
                                "Manaona génère automatiquement un contrat de mise à disposition. Les présentes rappellent que ce contrat " +
                                "de mise à disposition est une conventiontype. Aussi, le Jobyer comme l’Entreprise Utilisatrice, " +
                                "sont tenus d’en vérifier les stipulations. Le Service proposé par Manaona exclut spécifiquement la " +
                                "proposition de postes dangereux listés non limitativement par l’arrêté du 19 mars 1993 en application " +
                                "de l’article R. 45127 du Code du travail."
                            }
                        ]
                    },
                    {
                        // article 6
                        title: "Exécution de la mission du Jobyer",
                        code: 6,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "La mission du Jobyer s’exécutera dans les locaux de l’Entreprise Utilisatrice. L’Entreprise " +
                                "Utilisatrice assure la formation du Jobyer. Il est en charge de la formation à la sécurité pour les postes " +
                                "à risques. Un défaut de formation sera considéré comme une faute inexcusable de l’Entreprise Utilisatrice. " +
                                "En cas d’annulation du Job, l’Utilisateur à l’origine de l’annulation s’engage à en avertir l’autre dans " +
                                "les plus brefs délais."
                            }
                        ]
                    },
                    {
                        // article 7
                        title: "Paiement du service",
                        code: 7,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les tarifs applicables à l’Entreprise Utilisatrice sont indiqués sur des relevés " +
                                "mensuels envoyés par Manaona. La signature du relevé d’heures par l’Entreprise Utilisatrice génère " +
                                "automatiquement l’envoi d’une facture mensuelle, et de son prélèvement automatique par mandat SEPA " +
                                "et empreinte bancaire par carte bancaire."
                            }
                        ]
                    },
                    {
                        // article 8
                        title: "Performance du Service",
                        code: 8,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Manaona s’engage à fournir ses meilleurs efforts afin de permettre une utilisation " +
                                "performante du Service. Cependant, Manaona ne saurait voir sa responsabilité engagée en cas de défaut " +
                                "de disponibilité immédiate et rapide au service, notamment en raison de la complexité des performances " +
                                "techniques et du réseau Internet, sans que cette liste soit exhaustive, tout comme en cas de " +
                                "dysfonctionnement du matériel de connexion, informatique, ou mobile de l’Entreprise Utilisatrice. " +
                                "Toute intrusion frauduleuse dans le système ou le Compte de l’Entreprise Utilisatrice ne saurait " +
                                "engager la responsabilité de Manaona. Manaona s’engage à fournir toutes les maintenances et mises à " +
                                "jour nécessaires à une utilisation optimale du Service, et à ces fins, se réserve le droit de " +
                                "temporairement fermer l’accès à l’Application ou au Site, sans engager sa responsabilité pour défaut " +
                                "d’accès au Service."
                            }
                        ]
                    },
                    {
                        // article 9
                        title: "Engagement de l’Entreprise Utilisatrice",
                        code: 9,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "L’Entreprise Utilisatrice s’engage à utiliser le Service dans le respect des présentes " +
                                "Conditions Générales. L’Entreprise Utilisatrice s’engage, lors de son inscription, à ne fournir que des " +
                                "informations exactes sur son identité, ses coordonnées, son numéro SIRET, son code NAF. L’Entreprise " +
                                "Utilisatrice s’engage à ne pas s’inscrire au Service sous une fausse identité. L’Entreprise Utilisatrice " +
                                "s’engage à ne fournir aucune information illicite. L’Entreprise Utilisatrice s’engage à ne proposer que " +
                                "de réelles offres de job. L’Entreprise Utilisatrice s’engage à ne proposer que des offres de job licites. " +
                                "L’Entreprise Utilisatrice s’engage à n’utiliser le Service que pour ses fins professionnelles. " +
                                "L’Entreprise Utilisatrice s’engage à ne pas procéder à la collecte d’informations, telles que les " +
                                "adresses, contacts téléphoniques, adresse courriel, afin de les transmettre à des concurrents de Manaona. " +
                                "L’Entreprise Utilisatrice s’engage à ne pas faire une utilisation commerciale ou publicitaire du Service. " +
                                "L’Entreprise Utilisatrice s’engage à ne pas utiliser de logiciels ou dispositifs, de toute sorte, " +
                                "destinés à affecter ou tenter d’affecter le bon fonctionnement de l’Application ou du Site, et plus " +
                                "généralement du Service, ou destinés à extraire, consulter, modifier, de manière définitive ou temporaire, " +
                                "tout ou partie de l’Application ou du Site, et s’engage à ne pas tenter de procéder à une décompilation, " +
                                "un désassemblage, ou un déchiffrement du code source."
                            }
                        ]
                    },
                    {
                        // article 10
                        title: "Propriété intellectuelle",
                        code: 10,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les éléments de l’Application et du Site, notamment les images, textes, photographies, " +
                                "logos, chartes graphiques, schémas, animations, logiciels, présentations, sons, vidéos, sans que cette " +
                                "liste ne soit exhaustive, constituent des œuvres de l’esprit au sens du Code de la propriété " +
                                "intellectuelle. Ils relèvent de la propriété exclusive de la Société Manaona, et sont protégés par " +
                                "les droits de propriété intellectuelle reconnus selon les lois en vigueur. Toute reproduction, " +
                                "représentation, totale et partielle de ces éléments, nécessite une autorisation expresse de Manaona, " +
                                "sous peine de caractérisation d’acte de contrefaçon au titre des articles L.3352 et suivants du " +
                                "Code de la propriété intellectuelle. Sont exclus de cette protection les marques, logos, signes " +
                                "distinctifs des Entreprise Utilisatrices, reproduits sous l’autorisation de ces derniers aux fins " +
                                "de meilleure utilisation du Service."
                            }
                        ]
                    },
                    {
                        // article 11
                        title: "Données à caractère personnel",
                        code: 11,
                        content: [
                            {
                                subTitle: "Collecte des données",
                                subCode: 1,
                                subContent: "Lors de l’utilisation de l’Application ou Site, l’Entreprise Utilisatrice est invité à " +
                                "inscrire les éléments suivants de la « Fiche de l’entreprise » : " +
                                " Titre (Mme, Mlle, M.) ; " +
                                " Nom ; " +
                                " Prénom ; " +
                                " Nom entreprise ; " +
                                " Numéro de SIRET ; " +
                                " Code NAF. " +
                                "L’Entreprise Utilisatrice est informée de sa faculté de procéder à toute modification de ses " +
                                "informations personnelles. En outre, l’Entreprise Utilisatrice est informé par les présentes " +
                                "que des données relatives à sa géolocalisation, en vue d’assurer une utilisation optimale du " +
                                "Service, sont susceptibles d’être collectées, si l’Entreprise Utilisatrice en donne l’expresse " +
                                "autorisation. Les données collectées par Manaona pour le bon fonctionnement du Service ont fait " +
                                "l’objet d’une déclaration auprès de la Commission Nationale de l’Informatique et des Libertés, " +
                                "au numéro de récépissé suivant : 1969334 v 0 du 16 juin 2016."
                            },
                            {
                                subTitle: "Utilisation des données du l’Entreprise Utilisatrice: concession d’une licence non exclusive et gratuite",
                                subCode: 2,
                                subContent: "En utilisant les Services proposés par Manaona, l’Utilisateur est conscient qu’il " +
                                "l’autorise à utiliser ses données à caractère personnel transmises lors de son inscription via " +
                                "l’Application ou le Site. En particulier, l’Entreprise Utilisatrice autorise Manaona à diffuser " +
                                "les informations et données collectées lors de l’inscription afin de pouvoir diffuser ses offres d’emploi. " +
                                "L’Entreprise Utilisatrice concède une licence non exclusive, gratuite, pour le monde, permettant à " +
                                "Manaona de reproduire tout ou partie des informations et données communiquées lors de l’inscription, " +
                                "sur tout support, en particulier, sans que cette liste ne soit exhaustive, sur carte mémoire, serveur, " +
                                "disque dur, afin de les stocker, sauvegarder, transmettre ou télécharger, dans le but de l’utilisation " +
                                "optimale du Service. La licence accordée par l’Entreprise Utilisatrice autorise Manaona à représenter, " +
                                "adapter et traduire les informations et données fournies lors de l’inscription sur le Compte. En cas " +
                                "de refus pour motif légitime, Manaona invite l’Entreprise Utilisatrice à le lui signaler, par l’envoi " +
                                "d’un courriel à l’adresse suivante : contact@Vit-On-Job.com Ou en envoyant un courrier en recommandé à " +
                                "l’adresse suivante : Société Manaona Roissypôle – Bâtiment Aéronef 5, rue de Copenhague BP 13918 – " +
                                "93290 – Tremblay en France"
                            },
                            {
                                subTitle: "Politique de confidentialité des données",
                                subCode: 3,
                                subContent: "Manaona s’engage à préserver l’entière confidentialité des données collectées par " +
                                "l’Application ou le Site. En outre, Manaona s’engage à ne transmettre au Jobyer que les données " +
                                "contenues sur le Compte, communiquées sur la fiche de l’entreprise lors de son inscription via " +
                                "l’Application ou le Site. Les données à caractère personnel de l’Utilisateur ne seront transmises " +
                                "à aucun tiers, à l’exclusion de la demande émanant d’une autorité judiciaire ou administrative " +
                                "dûment habilitée à les requérir, conformément aux dispositions législatives en vigueur. Les " +
                                "données à caractère personnel collectées pas Manaona via l’Application ou le Site sont stockées " +
                                "sur des serveurs en France, et hébergées au plus près des zones d’utilisation pour des problématiques " +
                                "de sécurité, de confidentialité et de temps de réponse selon une architecture Cloud computing. " +
                                "Manaona s’engage à mettre tous les moyens en œuvre afin d’assurer une sécurité optimale des données " +
                                "collectées sur l’Application ou le Site. Cependant, Manaona ne saurait voir sa responsabilité " +
                                "engagée en cas d’atteinte à la sécurité informatique, pouvant causer des dommages au matériel " +
                                "informatique, aux données, tout comme en cas d’intrusion frauduleuse ou d’actes de malveillance d’un " +
                                "tiers dans le système, le Compte, l’Application, ou le Site. Manaona s’engage à conserver les " +
                                "données collectées pour une durée proportionnelle à la finalité du traitement. En outre, si " +
                                "l’Utilisateur émet une demande de suppression de son Compte, si Manaona procède à son effacement, " +
                                "ou rend son accès impossible, les données seront automatiquement supprimées. L’Utilisateur est " +
                                "informé par les présentes qu’en vertu des dispositions de la loi n°78 17 du 6 janvier 1978 dite " +
                                "Informatique et libertés, l’Utilisateur dispose d’un droit général d’interrogation, d’accès, " +
                                "de modification, de rectification, de suppression, d’opposition pour motif légitime, de ses " +
                                "données à caractère personnel, qu’il peut exercer en adresser un courriel à l’adresse suivante : " +
                                "contact@Vit-On-Job.com Ou en envoyant un courrier à l’adresse suivante : Société Manaona Roissypôle – " +
                                "Bâtiment Aéronef 5, rue de Copenhague BP 13918 – 95731, ROISSY CDG."
                            }
                        ]
                    },
                    {
                        // article 12
                        title: "Responsabilité",
                        code: 12,
                        content: [
                            {
                                subTitle: "Responsabilité de Manaona",
                                subCode: 1,
                                subContent: "La responsabilité de la société Manaona ne pourra être engagée que sur le fondement " +
                                "d’une obligation de moyens, au titre de la mise en relation d’Entreprise Utilisatrices et de " +
                                "Jobyers, en cas d’existence d’une faute, d’un préjudice, et d’un lien de causalité, prouvés par " +
                                "l’Entreprise Utilisatrice. Manaona décline toute responsabilité quant à l’exactitude des " +
                                "informations ajoutées sur la fiche de l’entreprise par l’Entreprise Utilisatrice lors de son " +
                                "inscription via l’Application ou le Site. Manaona décline toute responsabilité quant à la licéité " +
                                "de l’activité de l’Entreprise Utilisatrice. En outre, Manaona n’assure aucune garantie expresse ou " +
                                "tacite, quelle qu’en soit la forme, sur le contenu des informations et données collectées via " +
                                "l’Application ou le Site. La responsabilité de Manaona ne pourra être engagée sur le fondement " +
                                "d’une obligation de résultat concernant la disponibilité d’une offre sur l’Application ni concernant " +
                                "la durée ou les termes définitifs de l’offre obtenue via l’Application. Le Service ne garantit pas " +
                                "qu’un Jobyer répondra à une Offre de job soumise par l’Entreprise Utilisatrice. Manaona, en qualité " +
                                "d’hébergeur ne pourra en aucun cas être responsable du contenu des informations consultées sur " +
                                "l’Application ni des sites tiers auxquels les liens renvoient. Manaona n’engage aucunement sa " +
                                "responsabilité concernant la licéité des liens et Offres de job présents sur l’Application; " +
                                "l’Entreprise Utilisatrice est seul responsable des Offres de job qu’il publie. En outre, si " +
                                "l’Entreprise Utilisatrice rend compte de l’illicéité d’une annonce, ou d’un profil de Jobyer, " +
                                "il est invité à contacter le plus rapidement possible Manaona, par l’envoi d’un courriel " +
                                "à l’adresse contact@Vit-On-Job.com Manaona s’engage à mettre en œuvre tous les moyens nécessaires " +
                                "et adaptés afin de proposer à l’Entreprise Utilisatrice des Services performants, et une maintenance " +
                                "optimale. Ainsi, Manaona se réserve le droit, sans préavis ni indemnité, de procéder à la fermeture " +
                                "temporaire de l’Application ou du Site afin d’effectuer les opérations de maintenance, mises à jour, " +
                                "modification des fonctionnalités, sans que cette liste ne soit exhaustive. Manaona ne saurait engager " +
                                "sa responsabilité pour les dommages découlant de cette indisponibilité temporaire du Service. " +
                                "Manaona se réserve le droit de procéder à toute modification des présentes Conditions Générales " +
                                "d’Utilisation, sans préavis. Il est convenu que la dernière version des présentes est celle qui est " +
                                "applicable. Manaona décline toute responsabilité quant à la tenue effective de la visite médicale " +
                                "obligatoire en vertu de l’article R.721412 du Code du travail. Cette obligation incombe à " +
                                "l’entreprise de travail temporaire, ou, à défaut, à l’Entreprise Utilisatrice. Manaona est un tiers " +
                                "à la relation entre l’Entreprise Utilisatrice et le Jobyer. A ce titre, la responsabilité de Manaona " +
                                "ne saurait être engagée en cas de litige entre l’Entreprise Utilisatrice et le Jobyer. Les Jobs, " +
                                "proposés par les Entreprise Utilisatrices, et les conditions de leur exécution relèvent de leur " +
                                "seule responsabilité. L’utilisation des Services n’implique jamais la création d’un lien de " +
                                "subordination entre l’un des Utilisateurs et Manaona. Par conséquent, tout litige, quelle qu’en soit " +
                                "la nature, entre l’Entreprise Utilisatrice et le Jobyer, notamment sur les conditions d’exécution " +
                                "du Job, de refus de paiement de l’Entreprise Utilisatrice, d’un dommage causé lors de la réalisation " +
                                "d’un Job par le Jobyer, sans que cette liste ne soit exhaustive, la responsabilité de Manaona ne " +
                                "pourra être engagée, sur quelque fondement que ce soit."
                            },
                            {
                                subTitle: "Responsabilité de l’Entreprise Utilisatrice",
                                subCode: 2,
                                subContent: "L’Entreprise Utilisatrice utilise Vit-On-Job en l’état et sous sa responsabilité exclusive. " +
                                "Il est seul responsable de la licéité et de l’exactitude des informations et données qu’il consent à " +
                                "communiquer. En outre, l’Entreprise Utilisatrice reconnaît qu’il est seul responsable du contenu " +
                                "transmis sur la fiche de l’entreprise, et en particulier de la nature de son activité, de son numéro " +
                                "de SIRET, de sa dénomination sociale, sans que cette liste ne soit exhaustive. L’Entreprise " +
                                "Utilisatrice est seul responsable de son comportement, de ses agissements, et des conséquences de " +
                                "ces derniers. Aussi, il s’engage à ne pas harceler, nuire, ou calomnier, d’autres Utilisateurs, " +
                                "tiers, ou contenus mis en ligne. L’Entreprise Utilisatrice et le Jobyers sont seuls responsables de " +
                                "la vérification de la conformité du contrat de mise à disposition généré automatiquement par le Service."
                            }
                        ]
                    },
                    {
                        // article 13
                        title: "Intégralité des obligations",
                        code: 13,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les présentes Conditions générales constituent l’intégralité des obligations entre les " +
                                "parties quant à son objet ; aucune entente, accord oral ou autre écrit ne saurait remplacer " +
                                "les présentes dispositions, qui prévaudront sur tout autre document, qu’elle qu’en soit la nature ou la forme."
                            }
                        ]
                    },
                    {
                        // article 14
                        title: "Nullité d’une clause",
                        code: 14,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Si, mais seulement dans la mesure où, l’une des clauses des présentes Conditions " +
                                "Générales d’Utilisation, était jugée illégale, invalide, nulle, ou non exécutoire, les parties " +
                                "seraient dégagées de toutes les obligations découlant de ladite clause. Les autres dispositions " +
                                "resteront en vigueur et de plein effet, sans être affectées ou invalidées."
                            }
                        ]
                    },
                    {
                        // article 15
                        title: "Loi applicable et juridiction",
                        code: 15,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les présentes Conditions sont régies par le droit français. Les parties déclarent leur " +
                                "intention de chercher une solution amiable à toute difficulté qui pourrait survenir dans " +
                                "l’exécution des présentes dispositions. A défaut d’un tel accord, tout différend relatif à " +
                                "la validité, à l’interprétation, à l’exécution dudit contrat, sera soumis aux juridictions " +
                                "françaises, seules territorialement compétentes pour connaître de tout litige né de l’Application ou du Site."
                            }
                        ]
                    }
                ],
                footer: "© COPYRIGHT MANAONA 2016"
            };
        } else {
            // CGU
            this.gConditions = {
                title: "Conditions Générales d’Utilisation Vit-On-Job",
                legalInformation: {
                    title: "Informations légales",
                    content: "« Vit-On-Job » est une suite d’applications mobiles développées par la Société MANAONA, " +
                    "Société par Actions simplifiée à associé unique, immatriculée au Registre du Commerce et des Sociétés " +
                    "de Bobigny sous le numéro 814 360 830, au capital social de 11 125,00 Euros, dont le siège social " +
                    "est situé au Bâtiment Aéronef, BP 13918, 5 rue de Copenhague, Roissypôle, 93290 – Tremblay en France, " +
                    "ciaprès « Manaona »."
                },
                preamble: {
                    title: "Préambule",
                    content: "« Vit-On-Job » est une suite d’applications mobiles permettant la mise en relation de demandeurs " +
                    "d’emplois avec des Entreprise Utilisatrices en demande de recrutement. La solution « Vit-On-Job » est " +
                    "porteuse de quatre valeurs : « Simplicité », dans la mesure où quelques clics suffisent à trouver " +
                    "un emploi / un employé ; « Innovation », du fait du fort apport des nouvelles technologies au service ; " +
                    "« Performance », car « Vit-On-Job » se place comme partenaire du développement des utilisateurs de " +
                    "l’application ; et « Progrès social », car le service permet d’apporter une solution concrète et " +
                    "pragmatique aux recherches et aux demandes d’emploi."
                },
                object: {
                    title: "Objet des présentes Conditions Générales de d’Utilisation",
                    content: "Les présentes Conditions Générales d’Utilisation régissent l’utilisation des applications " +
                    "mobiles « Vit-On-Job » et de son site Internet. Manaona est un prestataire de service et de portage salarial " +
                    "pour des entreprises de travail temporaire."
                },
                articles: [
                    {
                        // article 1
                        title: "Définitions",
                        code: 1,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "« Application » : désigne l’Application mobile « Vit-On-Job » ; " +
                                "« Coffrefort numérique » : caractérise le lieu de stockage personnel du Jobyer. Les données sont " +
                                "accessibles pour une durée de 10 ans. Pour davantage d’informations, nous vous prions de bien vouloir " +
                                "vous référer aux conditions générales de vente et d’utilisation du prestataire Yousign disponibles " +
                                "sur le lien suivant : XXX. " +
                                "« Compte » : désigne le compte utilisateur personnel créé par l’utilisateur de l’Application ; " +
                                "« Conditions Générales d’Utilisation » : présentes conditions générales d’utilisation ; " +
                                "« Entreprise de Travail Temporaire », ciaprès « ETT » : désigne l’entreprise type agence d’intérim ;" +
                                "« Entreprise Utilisatrice » : ciaprès « EU » : désigne l’Entreprise Utilisatrice des services proposés par Vit-On-Job ;" +
                                "« Job » : désigne la mission temporaire proposée par l’Entreprise Utilisatrice à destination du Jobyer ;" +
                                "« Jobyer » : utilisateur de l’Application en recherche d’emploi ; " +
                                "« Site » : désigne le site Internet www.Vit-On-Job.com ;" +
                                "« Service » : désigne le service de recrutement et demande d’emploi proposé par Manaona, accessible par l’Application ou le Site ;" +
                                "« Utilisateur » : désigne l’Entreprise Utilisatrice, le Jobyer, ou tout autre utilisateur de l’un des services proposés par Vit-On-Job."
                            }
                        ]
                    },
                    {
                        // article 2
                        title: "Prérequis du Jobyer",
                        code: 2,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Le Jobyer déclare par les présentes Conditions Générales être majeur, ou, à défaut, " +
                                "disposer de l’âge légal et de la capacité juridique afin de postuler à un emploi, à savoir seize " +
                                "(16) ans, avec l’autorisation parentale ou titulaire de l’autorité parentale, en vertu de l’article " +
                                "D.41535 du Code du travail, et 372 du Code civil, sauf mineur émancipé. " +
                                "Le Jobyer déclare disposer de la capacité juridique permettant d’adhérer aux présentes Conditions Générales. " +
                                "Le Jobyer déclare avoir été informé de la possibilité de sauvegarder ou d’imprimer les Conditions " +
                                "Générales afin d’en conserver un exemplaire sur un support durable. Le Jobyer est informé que " +
                                "la dernière version des Conditions Générales constitue la version qui lui est opposable, nonobstant " +
                                "la sauvegarde ou l’impression préalable qui aurait été effectuée."
                            }
                        ]
                    },
                    {
                        // article 3
                        title: "Acceptation des Conditions Générales",
                        code: 3,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "L’installation et l’utilisation de l’Application entraîne pour l’Utilisateur " +
                                "l’acceptation intégrale, et sans réserve aucune, des présentes Conditions Générales d’Utilisation. " +
                                "En cas de désaccord avec l’une des stipulations des présentes Conditions, Manaona invite " +
                                "l’Utilisateur à procéder à la suppression de son compte personnel. En outre, l’Utilisateur " +
                                "accepte, sans réserve aucune, les conditions générales d’utilisation de l’entreprise de travail " +
                                "temporaire, que nous vous invitons à consulter sur le lien présent : XXXX."
                            }
                        ]
                    },
                    {
                        // article 4
                        title: "Description de l’accès au Service",
                        code: 4,
                        content: [
                            {
                                subTitle: "Création du compte personnel du Jobyer",
                                subCode: 1,
                                subContent: "Après installation de l’Application, le Jobyer est invité à se créer un Compte. " +
                                "La création de ce compte s’opère par l’entrée de son numéro de téléphone mobile ou son adresse " +
                                "courriel. L’accès aux fonctionnalités du Service implique la soumission d’une adresse courriel valide. " +
                                "L’accès aux fonctionnalités du Service peut s’effectuer via la plateforme du Site, ou de l’Application " +
                                "mobile. Le Jobyer est invité à entrer un mot de passe de six caractères au minimum. Ce mot de passe " +
                                "est strictement confidentiel. Le Jobyer s’engage à ne pas le divulguer, et demeure responsable de " +
                                "tous les actes et agissements de tiers utilisant son Compte, même à son insu. Le Jobyer s’engage à " +
                                "mettre tous les moyens en œuvre en vue d’assurer la confidentialité de ce mot de passe, et à " +
                                "le changer régulièrement afin d’assurer une sécurité optimale des informations du Compte contre " +
                                "toute utilisation frauduleuse, qui le cas échéant, engage le Jobyer à en informer Manaona dans " +
                                "les plus brefs délais, par l’envoi d’un courriel à l’adresse : contact@Vit-On-Job.com ou sur le " +
                                "formulaire de contact disponible à l’adresse suivante : http://www.Vit-On-Job.com/nouscontacter/ " +
                                "Le Jobyer est invité dans le menu à ajouter des informations le concernant. Ces informations constituent : " +
                                "Le nom " +
                                "Le prénom " +
                                "La date de naissance (format JJ/MM/YYYY) " +
                                "Le lieu de naissance " +
                                "Le numéro de sécurité sociale (non obligatoire) " +
                                "La nationalité " +
                                "Le Jobyer est invité à ajouter une photographie et/ ou une vidéo de présentation afin de compléter " +
                                "son profil. L’Application propose le chargement d’une image de la phototèque de son téléphone mobile, " +
                                "ou d’en réaliser une directement par le biais de l’Application. " +
                                "Le Jobyer pourra régulièrement et en toute liberté sur l’Application ou le Site apporter des mises " +
                                "à jour de ses informations dans la rubrique cidessus mentionnée. Le Jobyer peut, dès l’inscription " +
                                "au Service, via l’Application ou le Site, en utiliser les fonctionnalités pour une durée indéterminée."
                            },
                            {
                                subTitle: "Fermeture du Compte personnel du Jobyer",
                                subCode: 2,
                                subContent: "À tout moment, et selon sa seule volonté, le Jobyer aura la libre faculté de procéder à " +
                                "la fermeture de son compte personnel, en envoyant un courriel le mentionnant à l’adresse suivante : " +
                                "contact@Vit-On-Job.com " +
                                "Dès réception de cette requête, Manaona s’engage à supprimer le Compte du Jobyer dans les meilleurs délais. " +
                                "Manaona se réserve le droit de procéder à la suppression, ou de rendre impossible l’accès du Compte " +
                                "du Jobyer en cas d’utilisation abusive, frauduleuse, ou en violation des présentes Conditions Générales, " +
                                "de manière temporaire ou définitive."
                            }
                        ]
                    },
                    {
                        // article 5
                        title: "Performance du Service",
                        code: 5,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Manaona s’engage à fournir ses meilleurs efforts afin de permettre une utilisation " +
                                "performante du Service. Cependant, Manaona ne saurait voir sa responsabilité engagée en cas de défaut " +
                                "de disponibilité immédiate et rapide au service, notamment en raison de la complexité des performances " +
                                "techniques et du réseau Internet, sans que cette liste soit exhaustive, tout comme en cas de " +
                                "dysfonctionnement du matériel de connexion, informatique, ou mobile du Jobyer. " +
                                "Toute intrusion frauduleuse dans le système ou le Compte du Jobyer ne saurait engager la responsabilité " +
                                "de Manaona. Manaona s’engage à fournir toutes les maintenances et mises à jour nécessaires à " +
                                "une utilisation optimale du Service, et à ces fins, se réserve le droit de temporairement fermer " +
                                "l’accès à l’Application ou au Site, sans engager sa responsabilité pour défaut d’accès au Service."
                            }
                        ]
                    },
                    {
                        // article 6
                        title: "Engagement du Jobyer",
                        code: 6,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Le Jobyer s’engage à utiliser le Service dans le respect des présentes Conditions " +
                                "Générales. Le Jobyer s’engage, lors de son inscription, à ne fournir que des informations exactes " +
                                "sur son identité, ses coordonnées, ses expériences, sa photographie, sans préjudice aux droits et " +
                                "intérêts de tiers. Le Jobyer s’engage à ne pas s’inscrire au Service sous une fausse identité. " +
                                "En vertu de l’article 22641 du Code pénal, l’usurpation d’identité constitue un délit puni d’un " +
                                "an d’emprisonnement et de 15 000 Euros d’amende. " +
                                "Le Jobyer s’engage à ne fournir aucune information illicite. Le Jobyer s’engage à n’utiliser " +
                                "le Service que pour ses fins professionnelles. Le Jobyer s’engage à ne pas procéder à la " +
                                "collecte d’informations, telles que les adresses, contacts téléphoniques, adresse courriel, " +
                                "afin de les transmettre à des concurrents de Manaona. Le Jobyer s’engage à ne pas faire une " +
                                "utilisation commerciale ou publicitaire du Service sans l’obtention d’une autorisation expresse, " +
                                "préalable et écrite de Manaona. Le Jobyer s’engage à ne pas utiliser de logiciels ou dispositifs, " +
                                "de toute sorte, destinés à affecter ou tenter d’affecter le bon fonctionnement de l’Application " +
                                "ou du Site, et plus généralement du Service, ou destinés à extraire, consulter, modifier, " +
                                "de manière définitive ou temporaire, tout ou partie de l’Application ou du Site, et s’engage " +
                                "à ne pas tenter de procéder à une décompilation, un désassemblage, ou un déchiffrement du code " +
                                "source. Le Jobyer s’engage à ne proposer que des services licites. En qualité d’hébergeur, " +
                                "Manaona ne saurait engager sa responsabilité pour publication de contenu illicite dont elle " +
                                "n’aurait pas eu connaissance, ou dont elle n’aurait pas été en mesure de procéder à la vérification. " +
                                "En cas de publication de contenus illicites, le Jobyer est tenu de le signaler à Manaona dans les plus " +
                                "brefs délais, en écrivant un courriel sur l’adresse suivante :  contact@Vit-On-Job.com " +
                                "Ou en envoyant un courrier à l’adresse suivante : Société Manaona Roissypôle – Bâtiment Aéronef " +
                                "5, rue de Copenhague BP 13918 – 93290 – Tremblay en France " +
                                "Manaona procèdera à la suppression dudit contenu dans les plus brefs délais."
                            }
                        ]
                    },
                    {
                        // article 7
                        title: "Exécution du Job",
                        code: 7,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les présentes rappellent que le choix du Jobyer demeure du seul ressort de l’EU. " +
                                "L’EU dispose des éléments fournis par le Jobyer et d’une note de comptabilité avec la recherche " +
                                "afin d’établir son choix. Une fois le choix opéré par l’EU, Manaona génère automatiquement un " +
                                "contrat de mission. Les présentes rappellent que ce contrat de mission est une convention-type. " +
                                "Aussi, le Jobyer comme l’EU, sont tenus d’en vérifier les stipulations et la conformité au regard " +
                                "des dispositions légales et règlementaires en vigueur. Le contrat de mission est généré sur " +
                                "le smartphone du Jobyer, qu’il est invité à signer en ligne. Lorsque le Jobyer n’est équipé " +
                                "que d’un téléphone classique, le Jobyer reçoit un code par SMS faisant office de sceau numérique." +
                                "Le contrat de mission est stocké dans le Coffre-fort numérique du Jobyer. L’utilisation du " +
                                "Service génère la réception de bulletins de paie entièrement dématérialisés faisant foi. " +
                                "Le Jobyer, par les présentes, y consent pleinement, et ne saurait en prétendre un défaut de " +
                                "réception en invoquant l’absence d’envoi par support papier. Le Jobyer est informé de la " +
                                "possibilité d’effectuer une impression papier de ce bulletin de paie dématérialisé. " +
                                "La mission du Jobyer s’exécutera dans les locaux de l’Entreprise Utilisatrice. En cas " +
                                "d’annulation du Job, l’Utilisateur à l’origine de l’annulation s’engage à en avertir l’autre " +
                                "dans les plus brefs délais. Le Jobyer est invité à consulter les Conditions particulières du " +
                                "contrat de mission pour connaître des modalités et de la durée de ce dernier."
                            }
                        ]
                    },
                    {
                        // article 8
                        title: "Propriété intellectuelle",
                        code: 8,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les éléments de l’Application et du Site, notamment les images, textes, " +
                                "photographies, logos, chartes graphiques, schémas, animations, logiciels, présentations, " +
                                "sons, vidéos, sans que cette liste ne soit exhaustive, constituent des œuvres de l’esprit " +
                                "au sens du Code de la propriété intellectuelle. Ils relèvent de la propriété exclusive de la " +
                                "Société Manaona, et sont protégés par les droits de propriété intellectuelle reconnus selon " +
                                "les lois en vigueur. Toute reproduction, représentation, totale et partielle de ces éléments, " +
                                "nécessite une autorisation expresse de Manaona, sous peine de caractérisation d’acte de " +
                                "contrefaçon au titre des articles L.335-2 et suivants du Code de la propriété intellectuelle. " +
                                "Sont exclus de cette protection les marques, logos, signes distinctifs de l’Entreprise Utilisatrice, " +
                                "reproduits sous l’autorisation de ces derniers aux fins de meilleure utilisation du Service."
                            }
                        ]
                    },
                    {
                        // article 9
                        title: "Données à caractère personnel",
                        code: 9,
                        content: [
                            {
                                subTitle: "Collecte des données",
                                subCode: 1,
                                subContent: "Lors de l’utilisation de l’Application ou Site, le Jobyer est invité, et seulement " +
                                "invité, à compléter les informations suivantes : " +
                                "Le nom " +
                                "Le prénom " +
                                "La date de naissance (format JJ/MM/YYYY) " +
                                "Le lieu de naissance " +
                                "Le numéro de sécurité sociale " +
                                "La nationalité " +
                                "Une photographie " +
                                "Des compétences " +
                                "Une vidéo de présentation " +
                                "Un descriptif des qualités indispensables. " +
                                "Ces informations ne sont nullement obligatoires en vue de l’utilisation du Service, elles ne " +
                                "visent qu’à en permettre une utilisation optimale. " +
                                "Le Jobyer est informé de sa faculté de procéder à toute modification de ses informations personnelles. " +
                                "En outre, le Jobyer est informé par les présentes que des données relatives à sa géolocalisation, " +
                                "en vue d’assurer une utilisation optimale du Service, sont susceptibles d’être collectées, " +
                                "si le Jobyer en donne l’expresse autorisation. Les données collectées par Manaona pour le bon " +
                                "fonctionnement du Service ont fait l’objet d’une déclaration auprès de la Commission Nationale " +
                                "de l’Informatique et des Libertés, au numéro de récépissé suivant : 1969334 v 0 du 16 juin 2016."
                            },
                            {
                                subTitle: "Utilisation des données du Jobyer : concession d’une licence non exclusive et gratuite",
                                subCode: 2,
                                subContent: "En utilisant les Services proposés par Manaona, l’Utilisateur est conscient qu’il " +
                                "l’autorise à utiliser ses données à caractère personnel transmises lors de son inscription via " +
                                "l’Application ou le Site. En particulier, l’Utilisateur autorise Manaona à diffuser les " +
                                "informations et données collectées lors de l’inscription afin de les transférer à l’Entreprise " +
                                "Utilisatrice, en particulier si le Jobyer postule aux offres d’emploi mises en ligne via " +
                                "l’Application ou le Site. Le Jobyer concède une licence non exclusive, gratuite, pour le monde, " +
                                "permettant à Manaona de reproduire tout ou partie des informations et données communiquées " +
                                "lors de l’inscription, sur tout support, en particulier, sans que cette liste ne soit exhaustive, " +
                                "sur carte mémoire, serveur, disque dur, afin de les stocker, sauvegarder, transmettre ou télécharger, " +
                                "dans le but de l’utilisation optimale du Service. La licence accordée par le Jobyer autorise " +
                                "Manaona à représenter, adapter et traduire les informations et données fournies lors de " +
                                "l’inscription sur le Compte. " +
                                "En cas de refus pour motif légitime, Manaona invite le Jobyer à le lui signaler, par l’envoi " +
                                "d’un courriel à l’adresse suivante : contact@Vit-On-Job.com Ou en envoyant un courrier en " +
                                "recommandé à l’adresse suivante : Société Manaona Roissypôle – Bâtiment Aéronef 5, rue de " +
                                "Copenhague BP 13918 – 93290 – Tremblay en France"
                            },
                            {
                                subTitle: "Politique de confidentialité des données",
                                subCode: 3,
                                subContent: "Manaona s’engage à préserver l’entière confidentialité des données collectées par " +
                                "l’Application ou le Site. En outre, Manaona s’engage à ne transmettre à l’Entreprise " +
                                "Utilisatrice que les données contenues sur le Compte, communiquées par l’Utilisateur lors " +
                                "de son inscription via l’Application ou le Site. Les données à caractère personnel de " +
                                "l’Utilisateur ne seront transmises à aucun tiers, à l’exclusion de la demande émanant d’une " +
                                "autorité judiciaire ou administrative dûment habilitée à les requérir, conformément aux " +
                                "dispositions législatives en vigueur. Les données à caractère personnel collectées pas " +
                                "Manaona via l’Application ou le Site sont stockées sur des serveurs en France, et hébergées " +
                                "au plus près des zones d’utilisation pour des problématiques de sécurité, de confidentialité " +
                                "et de temps de réponse selon une architecture Cloud computing. Manaona s’engage à mettre tous " +
                                "les moyens en œuvre afin d’assurer une sécurité optimale des données collectées sur " +
                                "l’Application ou le Site. Cependant, Manaona ne saurait voir sa responsabilité engagée en cas " +
                                "d’atteinte à la sécurité informatique, pouvant causer des dommages au matériel informatique, " +
                                "aux données, tout comme en cas d’intrusion frauduleuse ou d’actes de malveillance d’un tiers " +
                                "dans le système, le Compte, l’Application, ou le Site. Manaona s’engage à conserver les " +
                                "données collectées pour une durée proportionnelle à la finalité du traitement. En outre, si " +
                                "l’Utilisateur émet une demande de suppression de son Compte, si Manaona procède à son " +
                                "effacement, ou rend son accès impossible, les données seront automatiquement supprimées. " +
                                "L’Utilisateur est informé par les présentes qu’en vertu des dispositions de la loi n°78-17 " +
                                "du 6 janvier 1978 dite Informatique et libertés, il dispose d’un droit général d’interrogation, " +
                                "d’accès, de modification, de rectification, de suppression, d’opposition pour motif légitime, " +
                                "de ses données à caractère personnel, qu’il peut exercer en adresser un courriel à " +
                                "l’adresse suivante : contact@Vit-On-Job.com " +
                                "Ou en envoyant un courrier à l’adresse suivante : " +
                                "Société Manaona Roissypôle – Bâtiment Aéronef 5, rue de Copenhague BP 13918 – 95731, ROISSY CDG."
                            }
                        ]
                    },
                    {
                        // article 10
                        title: "Responsabilité",
                        code: 10,
                        content: [
                            {
                                subTitle: "Responsabilité de Manaona",
                                subCode: 1,
                                subContent: "La responsabilité de la société Manaona ne pourra être engagée que sur le " +
                                "fondement d’une obligation de moyens, en cas d’existence d’une faute, d’un préjudice, et " +
                                "d’un lien de causalité, prouvés par le Jobyer." +
                                "Manaona décline toute responsabilité quant à l’exactitude des informations ajoutées par " +
                                "le Jobyer lors de son inscription via l’Application ou le Site. En outre, Manaona n’assure " +
                                "aucune garantie expresse ou tacite, quelle qu’en soit la forme, sur le contenu des informations " +
                                "et données collectées via l’Application ou le Site." +
                                "La responsabilité de Manaona ne pourra être engagée sur le fondement d’une obligation de " +
                                "résultat concernant la disponibilité d’une offre sur « l’Application »ni concernant la durée " +
                                "ou les termes définitifs de l’offre obtenue via « l’Application ». Le Service ne garantit " +
                                "pas que l’Entreprise Utilisatrice proposera un entretien ou une embauche au Jobyer." +
                                "Manaona, en qualité d’hébergeur ne pourra en aucun cas être responsable du contenu des " +
                                "informations consultées sur « l’Application » ni des sites tiers auxquels les liens renvoient." +
                                "Manaona n’engage aucunement sa responsabilité concernant la licéité des liens et offres " +
                                "d’emploi présents sur l’Application ; en outre, si le Jobyer rend compte de l’illicéité " +
                                "d’une annonce, il est invité à contacter le plus rapidement possible Manaona, par l’envoi " +
                                "d’un courriel à l’adresse contact@Vit-On-Job.com" +
                                "Manaona s’engage à mettre en œuvre tous les moyens nécessaires et adaptés afin de proposer " +
                                "au Jobyer des Services performants, et une maintenance optimale. Ainsi, Manaona se réserve " +
                                "le droit, sans préavis ni indemnité, de procéder à la fermeture temporaire de l’Application " +
                                "ou du Site afin d’effectuer les opérations de maintenance, mises à jour, modification des " +
                                "fonctionnalités, sans que cette liste ne soit exhaustive. Manaona ne saurait engager sa " +
                                "responsabilité pour les dommages découlant de cette indisponibilité temporaire du Service." +
                                "Manaona se réserve le droit de procéder à toute modification des présentes Conditions " +
                                "Générales d’Utilisation, sans préavis. Il est convenu que la dernière version des présentes " +
                                "est celle qui est applicable." +
                                "Manaona décline toute responsabilité quant aux conditions d’exercice du Jobyer dans le cadre " +
                                "du contrat de mission telles qu’elles sont déterminées par les dispositions légales et " +
                                "conventionnelles. L’Entreprise Utilisatrice en assume l’entière responsabilité." +
                                "Manaona est un tiers à la relation entre l’Entreprise Utilisatrice et le Jobyer. A ce titre, " +
                                "la responsabilité de Manaona ne saurait être engagée en cas de litige entre l’Entreprise Utilisatrice " +
                                "et le Jobyer. Les Jobs, proposés par l’Entreprise Utilisatrice, et les conditions de leur " +
                                "exécution relèvent de leur seule responsabilité. L’utilisation des Services n’implique jamais " +
                                "la création d’un lien de subordination entre l’un des Utilisateurs et Manaona. Par conséquent, " +
                                "tout litige, quelle qu’en soit la nature, entre l’Entreprise Utilisatrice et le Jobyer, " +
                                "notamment sur les conditions d’exécution du Job, de refus de paiement de l’Entreprise " +
                                "Utilisatrice, d’un dommage causé lors de la réalisation d’un Job par le Jobyer, sans que " +
                                "cette liste ne soit exhaustive, la responsabilité de Manaona ne pourra être engagée, sur quelque " +
                                "fondement que ce soit."
                            },
                            {
                                subTitle: "Responsabilité du Jobyer",
                                subCode: 2,
                                subContent: "Le Jobyer utilise Vit-On-Job en l’état et sous sa responsabilité exclusive. Il est " +
                                "seul responsable de la licéité et de l’exactitude des informations et données qu’il consent " +
                                "à communiquer. " +
                                "En outre, le Jobyer reconnaît qu’il est seul responsable du contenu transmis, et en " +
                                "particulier de l’identité, de la photographie, des diplômes et autres certifications, " +
                                "expériences, sans que cette liste soit exhaustive." +
                                "Le Jobyer est seul responsable de son comportement, de ses agissements, et des conséquences " +
                                "de ces derniers. Aussi, il s’engage à ne pas harceler, nuire, ou calomnier, d’autres Utilisateurs, " +
                                "tiers, ou contenus mis en ligne."
                            }
                        ]
                    },
                    {
                        // article 11
                        title: "Intégralité des obligations",
                        code: 11,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les présentes Conditions générales constituent l’intégralité des obligations entre les " +
                                "parties quant à son objet ; aucune entente, accord oral ou autre écrit ne saurait remplacer " +
                                "les présentes dispositions, qui prévaudront sur tout autre document, qu’elle qu’en soit la nature ou la forme."
                            }
                        ]
                    },
                    {
                        // article 12
                        title: "Nullité d’une clause",
                        code: 12,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Si, mais seulement dans la mesure où, l’une des clauses des présentes Conditions " +
                                "Générales d’Utilisation, était jugée illégale, invalide, nulle, ou non exécutoire, les parties " +
                                "seraient dégagées de toutes les obligations découlant de ladite clause. Les autres dispositions " +
                                "resteront en vigueur et de plein effet, sans être affectées ou invalidées."
                            }
                        ]
                    },
                    {
                        // article 13
                        title: "Loi applicable et juridiction",
                        code: 13,
                        content: [
                            {
                                subTitle: "",
                                subCode: 0,
                                subContent: "Les présentes Conditions sont régies par le droit français. Les parties déclarent leur " +
                                "intention de chercher une solution amiable à toute difficulté qui pourrait survenir dans " +
                                "l’exécution des présentes dispositions. A défaut d’un tel accord, tout différend relatif à " +
                                "la validité, à l’interprétation, à l’exécution dudit contrat, sera soumis aux juridictions " +
                                "françaises, seules territorialement compétentes pour connaître de tout litige né de l’Application ou du Site."
                            }
                        ]
                    }
                ],
                footer: "© COPYRIGHT MANAONA 2016"
            };
        }
        
    }

    logOut() {
        let data:any =  this.params.get('currentUser');
        let message: string = "";
        if (this.projectTarget === 'employer'){
            message = "Merci d'être venu sur notre plateforme pour recruter en quelques clics!";
        } else {
            message = "Merci d'être venu sur notre plateforme pour trouver un job à proximité!";
        }
        message = message +
            " En refusant les Conditions Générales, nous somme ravis d'échanger avec vous pour essayer de " +
            "comprendre votre refus.";

        let confirm = Alert.create({
            title: "VitOnJob",
            message: message,
            buttons: [
                {
                    text: 'Non, je quitte',
                    handler: () => {
                        this.userService.updateGCStatus("Non", "Non", data.id).then((response)=>{
                            this.nav.present(confirm);
                            this.storage.set('connexion', null);
                            this.storage.set(this.currentUserVar, null);
                            this.storage.set(this.profilPictureVar, null);
                            this.storage.set("RECRUITER_LIST", null);
                            this.storage.set('OPTION_MISSION', null);
                            this.storage.set('PROFIL_PICTURE', null);
                            this.events.publish('user:logout');
                            if (this.platform.is('ios')) {
                                this.nav.setRoot(HomePage);
                            } else {
                                this.nav.push(HomePage).then(()=>{
                                    const index = this.viewCtrl.index;
                                    // then we remove it from the navigation stack
                                    this.nav.remove(index);
                                });
                            }
                            this.viewCtrl.dismiss();
                        });
                    }
                },
                {
                    text: 'Oui, contactez moi',
                    handler: () => {
                        this.userService.updateGCStatus("Non", "Oui", data.id).then((response) => {
                            this.nav.present(confirm);
                            this.storage.set('connexion', null);
                            this.storage.set(this.currentUserVar, null);
                            this.storage.set(this.profilPictureVar, null);
                            this.storage.set("RECRUITER_LIST", null);
                            this.storage.set('OPTION_MISSION', null);
                            this.storage.set('PROFIL_PICTURE', null);
                            this.events.publish('user:logout');
                            if (this.platform.is('ios')) {
                                this.nav.setRoot(HomePage);
                            } else {
                                this.nav.push(HomePage).then(()=>{
                                    const index = this.viewCtrl.index;
                                    // then we remove it from the navigation stack
                                    this.nav.remove(index);
                                });
                            }

                            this.viewCtrl.dismiss();
                        });
                        
                    }
                }
            ]
        });
        this.nav.present(confirm);
    }

    connect() {
        let data:any =  this.params.get('currentUser');
        this.userService.updateGCStatus("Oui", "Non", data.id).then((response) => {
            if (this.platform.is('ios')) {
                console.log("plateform ios : no back button, just menu button");
                this.nav.setRoot(CivilityPage, {currentUser: data});
            } else {
                this.nav.push(CivilityPage, {currentUser: data}).then(() => {
                    console.log("plateform android : no menu button, just back button");
                    // first we find the index of the current view controller:
                    const index = this.viewCtrl.index;
                    // then we remove it from the navigation stack
                    this.nav.remove(index);
                });
            }
        });
        
    }

}
