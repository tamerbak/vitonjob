import {Headers, Http} from "@angular/http";
import {Configs} from "../configurations/configs";
import {ToastController, LoadingController, Toast} from "ionic-angular";
import {Injectable} from "@angular/core";
/**
 * Created by tim on 25/01/2017.
 */

const TIME_OUT_PERIOD = 120000;

@Injectable()
export class HttpRequestHandler {

    static toast: ToastController;
    static loadingCtrl: LoadingController;
    static loaderComponent: any;
    static senderClassName: string;

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        let vojMessage: string = HttpRequestHandler.getErrMessage(error, HttpRequestHandler.senderClassName);

        HttpRequestHandler.presentErrToast(vojMessage);
        //TODO send email to notify us
        let errorObject: any = {success: false, error: error.message || error};
        return Promise.reject(errorObject);
    }

    /**
     * Constructor
     * @param http
     * @param toast
     * @param loading
     */
    constructor(public http: Http, public toast: ToastController, public loading: LoadingController) {
        HttpRequestHandler.toast = this.toast;
        HttpRequestHandler.loadingCtrl = this.loading;
    }

    /**
     * Send SQL request via http post method
     * @param sql
     * @param classObject
     * @param silentMode
     * @returns {Observable<T>}
     */
    sendSql(sql : string, classObject?: any, silentMode?: boolean){
        let newTimeOutPeriod : number = 0;
        let silentLadingToast:Toast;
        if (silentMode !== true){
            HttpRequestHandler.presentLoading();
            newTimeOutPeriod = TIME_OUT_PERIOD;
        } else {
            //silent mode : waiting for more time..
            newTimeOutPeriod = TIME_OUT_PERIOD * 10;
            //silentLadingToast = HttpRequestHandler.presentSilentLoadingToast("En cours de chargement des données..", newTimeOutPeriod, 'top');
        }

        HttpRequestHandler.senderClassName = (classObject) ? classObject.constructor.name : "";
        let headers: Headers = Configs.getHttpTextHeaders();
        return this.http.post(Configs.sqlURL, sql, {headers: headers})
            .map(res => res.json())
            .timeout(newTimeOutPeriod)
            .catch(this.handleError)
            .finally(() => {
                if (HttpRequestHandler.loaderComponent)
                    HttpRequestHandler.loaderComponent.dismiss();
                if (silentLadingToast)
                    silentLadingToast.dismiss();
            });
    }

    /**
     * Send a callOut request via http post method
     * @param payload
     * @param classObject
     * @param silentMode
     * @returns {Observable<T>}
     */
    sendCallOut(payload: any, classObject?: any, silentMode?: boolean) {
        let newTimeOutPeriod : number = 0;
        let silentLadingToast:Toast;
        if (silentMode !== true){
            HttpRequestHandler.presentLoading();
            newTimeOutPeriod = TIME_OUT_PERIOD;
        } else {
            //silent mode : waiting for more time..
            newTimeOutPeriod = TIME_OUT_PERIOD * 10;
            //silentLadingToast = HttpRequestHandler.presentSilentLoadingToast("En cours de chargement des données...", newTimeOutPeriod, 'top');
        }
        // Getting service class name
        HttpRequestHandler.senderClassName = (classObject) ? classObject.constructor.name : "";
        // Sending request
        let headers: Headers = Configs.getHttpJsonHeaders();
        return this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
            .map(res => res.json())
            .timeout(newTimeOutPeriod)
            .catch(this.handleError)
            .finally(() => {
                if (HttpRequestHandler.loaderComponent)
                    HttpRequestHandler.loaderComponent.dismiss();
                if (silentLadingToast)
                    silentLadingToast.dismiss();
            });
    }

    /**
     * Show a red toast that contains error message
     * @param message
     * @param duration
     * @param position
     */
    static presentErrToast(message: string, duration?: number, position?: string) {
        if (!duration)
            duration = 5;
        let toast = this.toast.create({
            message: message,
            position: position,
            dismissOnPageChange: true,
            showCloseButton: true,
            closeButtonText: "Ok",
            duration: duration * 1000
        });
        toast.present();
        // Change toast color to red
        let toastElement = document.getElementsByClassName('toast-wrapper toast-bottom');
        if (toastElement && toastElement.length > 0)
            (toastElement[0] as any).style.background = "#E8384F";
    }

    /**
     * Show a normal toast that contains silent loading message
     * @param message
     * @param duration
     * @param position
     */
    static presentSilentLoadingToast(message: string, duration?: number, position?: string):Toast {
        let toast = this.toast.create({
            message: message,
            position: position,
            dismissOnPageChange: false,
            showCloseButton: true,
            closeButtonText: "Ok",
            duration: duration
        });
        toast.present();
        return toast;
    }

    /**
     * Present Loading component while the treatment of request
     */
    static presentLoading() {
        HttpRequestHandler.loaderComponent = this.loadingCtrl.create({content: "Merci de patienter..."});
        HttpRequestHandler.loaderComponent.present();
    }

    /**
     * Get error message from status code
     * @param error
     * @param senderClassName
     * @returns {string}
     */
    static getErrMessage(error: any, senderClassName: string) {
        if (error.message === "timeout") {
            error.status = -100;
        }
        switch (~~(error.status / 100)) {
            case 0 :
                // General error with status 0: http://stackoverflow.com/a/26451773/2936049
                return "0 • Problème sur serveur, merci de réessayer ultérieurement. (" + senderClassName + ")";
            case 4 :
                // 4xx: client type error
                return "4 • Merci de vérifier votre connexion internet et réessayer ultérieurement. (" + senderClassName + ")";
            case 5 :
                // 5xx: server type error
                return "5 • Problème sur serveur, merci de réessayer ultérieurement. (" + senderClassName + ")";
            case -1 :
                // TimeOut error specified by us. See cont variable TIME_OUT_PERIOD
                return "-1 • Merci de vérifier votre connexion internet et réessayer ultérieurement. (" + senderClassName + ")";
            default :
                // Other problems...
                return "• Merci de vérifier votre connexion internet et réessayer ultérieurement. (" + senderClassName + ")";
        }
    }
}