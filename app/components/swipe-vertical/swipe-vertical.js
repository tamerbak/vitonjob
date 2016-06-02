var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", '@angular/core', 'ionic-angular/gestures/gesture'], function (require, exports, core_1, gesture_1) {
    "use strict";
    /*
     Class for the SwipeVertical directive (attribute (swipe) is only horizontal).
    
     In order to use it you must add swipe-vertical attribute to the component.
     The directives for binding functions are [swipeUp] and [swipeDown].
    
     IMPORTANT:
     [swipeUp] and [swipeDown] MUST be added in a component which
     already has "swipe-vertical".
     */
    let SwipeVertical = class SwipeVertical {
        constructor(el) {
            this.el = el.nativeElement;
        }
        ngOnInit() {
            this.swipeGesture = new gesture_1.Gesture(this.el, {
                recognizers: [
                    [Hammer.Swipe, { direction: Hammer.DIRECTION_VERTICAL }]
                ]
            });
            this.swipeGesture.listen();
            this.swipeGesture.on('drag', e => {
                console.log(e);
            });
            this.swipeGesture.on('swipeup', e => {
                console.log(e);
                this.actionUp();
            });
            this.swipeGesture.on('swipedown', e => {
                console.log(e);
                this.actionDown();
            });
        }
        ngOnDestroy() {
            this.swipeGesture.destroy();
        }
    };
    __decorate([
        core_1.Input('swipeUp')
    ], SwipeVertical.prototype, "actionUp", void 0);
    __decorate([
        core_1.Input('swipeDown')
    ], SwipeVertical.prototype, "actionDown", void 0);
    SwipeVertical = __decorate([
        core_1.Directive({
            selector: '[swipe-vertical]' // Attribute selector
        })
    ], SwipeVertical);
    exports.SwipeVertical = SwipeVertical;
});
//# sourceMappingURL=swipe-vertical.js.map