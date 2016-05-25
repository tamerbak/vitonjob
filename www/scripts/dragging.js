/**
 * Created by jakjoud on 20/05/16.
 */

function touchHandler(event) {

    var touch = event.changedTouches[0];
    var x = touch.clientX-(150/2);
    var y = touch.clientY-100;

    var spX = $('.draggable').css('left') ;
    var spY = $('.draggable').css('top') ;

    spX = spX.replace('px', '');
    spY = spY.replace('px', '');

    var pX = parseFloat(spX) - 75;
    var pY = parseFloat(spY) - 75;

    if(x>=pX && x <=pX+150 && y>=pY && y <=pY+100){
        $('.draggable').css('left', x+'px');
        $('.draggable').css('top', y+'px');
    }

}


function init() {
    var height = screen.height;
    var width = screen.width;
    $('.draggable').css('top', (height-100)+'px');
    $('.draggable').css('left', (width/2-75)+'px');
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}
$(function() {
    init();
    $( ".draggable" ).draggable();
});
