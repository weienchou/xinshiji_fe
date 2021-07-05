import '../styles/main.scss';

import 'gene-event-handler/app/scripts/jquery.gene';
import './vendors/pristine';
import 'jquery.marquee';

import './app';
import './modules/popup';

const feather = require('feather-icons');

jQuery.globalEval = function () {};
$.globalEval = function () {};

$.fn.serializeJSON = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

window.mainUri = 'https://google.com/';
window.apiUri = window.mainUri + 'v4/';
window.distPath = '/dist/';
window.imgPath = window.distPath;

if (IS_DEV) {
    window.distPath = '/';
    window.imgPath = window.distPath;
    window.main2Url = 'https://icarry.co/';
} else {
    window.main2Url = '/';
}

app.tmplPath = window.distPath + 'scripts/tmpls/';

gee.debug = IS_DEV;
gee.version = 20210423;

$(document).ready(function () {
    app.init(['']);
    feather.replace();

    $('.marquee').marquee({
        //duration in milliseconds of the marquee
        duration: 15000,
        //gap in pixels between the tickers
        gap: 50,
        //time in milliseconds before the marquee will start animating
        delayBeforeStart: 0,
        //'left' or 'right'
        direction: 'left',
        //true or false - should the marquee be duplicated to show an effect of continues flow
        duplicated: true,
    });
});
