import {Headers, Http} from "@angular/http";
import {Configs} from "../configurations/configs";
import {ToastController, LoadingController} from "ionic-angular";
import {Injectable} from "@angular/core";
/**
 * Created by tim on 25/01/2017.
 */

const timeOutPeriod = 120000;

@Injectable()
export class HttpRequestHandler {

    static toast: ToastController;
    static loadingCtrl: LoadingController;
    static loaderComponent: any;
    static senderClassName: string;

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        let vojMessage: string = HttpRequestHandler.getErrMessage(error, HttpRequestHandler.senderClassName);

        HttpRequestHandler.presentToast(vojMessage);
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
     * Send a callOut request via http post method
     * @param payload
     * @param classObject
     * @param silentMode
     * @returns {Observable<T>}
     */
    sendCallOut(payload: any, classObject?: any, silentMode?: boolean) {
        if (silentMode !== true)
            HttpRequestHandler.presentLoading();
        HttpRequestHandler.senderClassName = (classObject) ? classObject.constructor.name : "";
        let headers: Headers = Configs.getHttpJsonHeaders();
        return this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
            .map(res => res.json())
            .timeout(timeOutPeriod)
            .catch(this.handleError)
            .finally(() => {
                if (HttpRequestHandler.loaderComponent)
                    HttpRequestHandler.loaderComponent.dismiss();
            });
    }

    /**
     * Show a red toast that contains error message
     * @param message
     * @param duration
     * @param position
     */
    static presentToast(message: string, duration?: number, position?: string) {
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
                // TimeOut error specified by us. See cont variable timeOutPeriod
                return "-1 • Merci de vérifier votre connexion internet et réessayer ultérieurement. (" + senderClassName + ")";
            default :
                // Other problems...
                return "• Merci de vérifier votre connexion internet et réessayer ultérieurement. (" + senderClassName + ")";
        }
    }
}