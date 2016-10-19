var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
define(["require", "exports", 'ionic-angular', 'ionic-native', './pages/home/home', './pages/logins/logins', './configurations/configs', './configurations/globalConfigs', "./providers/search-service/search-service"], function (require, exports, ionic_angular_1, ionic_native_1, home_1, logins_1, configs_1, globalConfigs_1, search_service_1) {
    "use strict";
    let MyApp = class MyApp {
        constructor(platform, app, menu, gc) {
            this.platform = platform;
            this.app = app;
            this.menu = menu;
            this.gc = gc;
            this.rootPage = home_1.HomePage;
            this.app = app;
            this.platform = platform;
            this.menu = menu;
            this.initializeApp();
            this.pages = [
                {title: "Lancer une recherche", component: home_1.HomePage, icon: "search"},
                {title: "Se connecter", component: logins_1.LoginsPage, icon: "person"}
            ];
            this.rootPage = home_1.HomePage;
            // Set global configs
            // Get target to determine configs
            this.projectTarget = gc.getProjectTarget();
            // get config of selected target
            let config = configs_1.Configs.setConfigs(this.projectTarget);
            //local menu variables
            this.isEmployer = (this.projectTarget == 'employer');
            this.bgMenuURL = config.bgMenuURL;
        }

        initializeApp() {
            this.platform.ready().then(() => {
                // Okay, so the platform is ready and our plugins are available.
                // Here you can do any higher level native things you might need.
                // target:string = "employer"; //Jobyer
                ionic_native_1.StatusBar.styleDefault();
            });
        }

        openPage(page) {
            let nav = this.app.getComponent('nav');
            this.menu.close();
            nav.setRoot(page.component);
        }
    };
    MyApp = __decorate([
        ionic_angular_1.App({
            templateUrl: 'build/menu.html',
            config: {test: 'toto'},
            providers: [globalConfigs_1.GlobalConfigs, search_service_1.SearchService]
        })
    ], MyApp);
    exports.MyApp = MyApp;
});
//# sourceMappingURL=app.js.map

/**
 * Created by tim on 31/05/2016.
 */

Math.clip = function (number, min, max) {
    return Math.max(min, Math.min(number, max));
};

var Pion = function (transform) {
    var self = this;
    this.speed = 5;
    this.transform = transform;
    this.x = parseInt(this.transform.css('left'), 0);
    this.y = parseInt(this.transform.css('top'), 0);
    this.width = parseInt(this.transform.css('width'), 0);
    this.height = parseInt(this.transform.css('height'), 0);
    this.dragging = false;

    this.transform.on('mousedown', function (e) {
        console.log('click');
        Input.x = e.pageX;
        Input.y = e.pageY;
        Input.startX = e.pageX;
        Input.startY = e.pageY;
        $('body').addClass('grabbing');
        self.dragging = true;
    });
    this.transform.on('touchstart', function (e) {
        console.log('touch');
        Input.x = e.originalEvent.touches[0].pageX;
        Input.y = e.originalEvent.touches[0].pageY;
        $('body').addClass('grabbing');
        self.dragging = true;
    });

    $(document).on('mouseup', function (e) {
        if (Input.startX == e.pageX && Input.startY == e.pageY) {
            console.log('its a click not drag!');
        }
        $('body').removeClass('grabbing');
        self.dragging = false;
    });
    $(document).on('touchend', function (e) {
        $('body').removeClass('grabbing');
        self.dragging = false;
    });
};

Pion.prototype.update = function (deltaTime) {
    var self = this;
    var offsetX = parseInt(this.transform.css('left'), 10);
    var offsetY = parseInt(this.transform.css('top'), 10);
    if (this.dragging) {
        this.x = Input.x - this.width / 2;
        this.y = Input.y - this.height / 2;
    }

    var s = deltaTime * this.speed;
    var distX = Math.round(offsetX - this.x);
    var distY = Math.round(offsetY - this.y);

    if (distX > 5 || distX < -5 || distY > 5 || distY < -5) {

        this.transform.css({
            left: Math.round(offsetX - distX * s),
            top: Math.round(offsetY - distY * s),
            //transform: 'perspective(300px) rotateX('+(60+Math.round(Math.clip(distY/3, -45, 45)))+'deg) rotateY('+Math.round(Math.clip(-distX/3, -45, 45))+'deg)'
        });
    } else {
        this.transform.css({
            //transform: 'rotateX(60deg) rotateY(0deg)'
        });
    }
};

var gameObjects = [];
var lastTime = window.performance.now();
function loop(time) {
    window.requestAnimationFrame(loop);
    var deltaTime = (time - lastTime) / 1000;
    lastTime = window.performance.now();
    for (var i = gameObjects.length - 1; i >= 0; --i) {
        gameObjects[i].update(deltaTime);
    }
}

var Input = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    onMouseMove: $(document).on('mousemove', function (e) {
        Input.x = e.pageX;
        Input.y = e.pageY;
    }),
    onTouchMove: $(document).on('touchmove', function (e) {
        Input.x = e.originalEvent.touches[0].pageX;
        Input.y = e.originalEvent.touches[0].pageY;
    })
};

$('.pion').each(function () {
    gameObjects.push(new Pion($(this)));
});

//$('body').css({width: $(document).width(), height: $(document).height()});

window.requestAnimationFrame(loop);