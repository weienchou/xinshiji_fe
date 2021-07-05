let gee = window.gee || $.fn.gene;
window.gee = gee;

let App = function () {
    'use strict';

    let that = this;

    that.config = {
        detectWidth: 600
    };

    let app = {
        partner_id: 10000003,
        collaborate: 'union',
        module: {},

        tmplStores: {},
        htmlStores: {},
        moduleItems: {},
        tmplPath: './src/scripts/tmpls/',

        errMsg: {
            'e3001': '密碼錯誤',
            'e3002': '無此專欄',
        },

        init: function (modules) {
            app.win = $(window);
            app.docu = $(document);
            app.body = (app.win.opera) ? (app.docu.compatMode === 'CSS1Compat' ? $('html') : $('body')) : $('body');

            app.screen = (app.body.width() < that.config.detectWidth) ? 'mobile' : 'tablet';
            app.body.addClass(app.screen);

            gee.mainUri = window.mainUri;
            gee.apiUri = window.apiUri + '';

            // app.store.init();
            gee.init();

            if (modules && modules.length > 0) {
                modules.map(function (module) {
                    if (gee.isset(app[module]) && gee.isset(app[module].init)) {
                        app[module].init();
                    }
                });
            }
        },

        req: function (url, data, cb, method = 'post', apiUrl = gee.apiUri) {
            const origin = gee.apiUri;
            gee.apiUri = apiUrl;

            data.verify = this.sign(data);

            gee.clog(data);

            gee.yell(url, data, cb, cb, method, true, origin !== gee.apiUri);

            gee.apiUri = origin;
        },

        sign: function (data) {
            if (data.hasOwnProperty('verify')) {
                delete data.verify;
            }

            data = app.helper.ksort(data);
            return app.helper.md5(app.key.substr(0, 16) + app.helper.toString(data) + app.key.substr(16));
        },

        loadHtml: function (src, box, redirect) {
            var newPath = src;
            var success = function (html, status, xhr) {
                if (status === 'error') {
                    gee.alert({
                        title: 'Alert!',
                        txt: 'Sorry but there was an error: ' + xhr.status + ' ' + xhr.statusText
                    });
                } else {
                    app.htmlStores[app.module.name + '-tmpl-' + src] = html;
                    box.html(html);
                    if (redirect !== '') {
                        app.redirect({
                            path: newPath,
                            ta: redirect
                        });
                    }

                    gee.init();
                }
            };
            box = (typeof box === 'string') ? $('#' + box) : box;
            redirect = (redirect) ? redirect : '';

            if (typeof app.htmlStores[app.module.name + '-tmpl-' + src] === 'undefined') {
                gee.clog('load: ' + app.tmplPath + newPath + '.html?v=' + gee.version);
                box.load(app.tmplPath + newPath + '.html?v=' + gee.version, success);
            } else {
                box.html(app.htmlStores[app.module.name + '-tmpl-' + src]);

                if (redirect !== '') {
                    app.redirect({
                        path: newPath,
                        ta: redirect
                    });
                }

                gee.init();
            }
        },

        loadTmpl: function (tmplName, box) {
            if (typeof app.tmplStores[tmplName] === 'undefined') {
                var htmlCode = box.html() || '';

                if (box.is('tbody')) { // fix tbody>tr bug
                    htmlCode = '{{#each data.rows}}' + htmlCode + '{{else}}<tr><td colspan="99">沒有資料。</td></tr>{{/each}}';
                }

                if (box.is('form')) {
                    app.moduleItems[tmplName] = app.initForm(box);
                    htmlCode = box.html(); // get new htmlcode
                }

                htmlCode = htmlCode.replace(/pre-gee/g, 'gee')
                    .replace(/pre-src/g, 'src')
                    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); // img src

                // console.log(htmlCode);

                app.tmplStores[tmplName] = Template7.compile(htmlCode);
            }

            // box.html('');
        },

        initForm: function (box) {
            var item = {};

            box.find(':input:not(:button)').each(function () {
                var me = $(this);
                var name = me.attr('name');
                var gene = me.data('gene');
                var boolGee = me.hasClass('gee');

                if (name && name.match(/\[/g)) {
                    name = name.replace(/\[/g, '.').replace(/]/g, '');

                    if (name !== 'id') {
                        if (name.indexOf('.') !== -1) { // only support meta[column] & lang[code][column]
                            var dp = name.split('.');
                            if (!item[dp[0]]) {
                                item[dp[0]] = {};
                            }

                            if (!item[dp[0]][dp[1]]) {
                                item[dp[0]][dp[1]] = (dp.length === 2) ? '' : {};
                            }

                            if (dp.length === 3) {
                                item[dp[0]][dp[1]][dp[2]] = '';
                            }
                        } else {
                            item[name] = '';
                        }
                    } else {
                        item[name] = 0;
                    }
                }

                if (me.is(':radio')) {
                    me.closest('.field').toggleClass('pre-gee', !boolGee).attr('data-gene', 'init:setRadio')
                        .attr('data-value', '{{data.' + name + '}}');
                } else if (me.is('[date-split]')) {
                    me.attr('value', `{{(data.year) ? (data.year + '-' + data.month + '-' + data.date) : ''}}`);
                } else if (me.is(':checkbox')) {
                    name = name.replace('.', '');
                    me.closest('.field').toggleClass('pre-gee', !boolGee)
                        .attr('data-gene', 'init:setRadio')
                        .attr('data-type', 'checkbox')
                        .attr('data-value', '{{data.' + name + '}}');
                } else if (me.is('[type="datetime-local"]')) {
                    me.attr('value', '{{~formatDate(data.' + name + ', \'YYYY-MM-DDTHH:mm:00\')}}');
                } else if (me.is('textarea')) {
                    me.html('{{#if data.' + name + '}}{{data.' + name + '}}{{/if}}');
                } else if (me.is('select')) {
                    var value = 'init:form/select';

                    if (gene !== 'undefined' && typeof gene !== 'undefined') {
                        value = 'init:form/select,' + gene;
                    }

                    me.toggleClass('pre-gee', !boolGee).attr('data-gene', value)
                        .attr('data-value', '{{#if data.' + name + '}}{{data.' + name + '}}{{/if}}');

                    // TODO: render select options
                } else if (me.hasClass('multipleSelect')) {
                    me.attr('value', '');
                } else {
                    me.attr('value', '{{#if data.' + name + '}}{{data.' + name + '}}{{/if}}');
                }
            });

            gee.clog('------------------------ initForm');
            // console.log(item, box);

            return item;
        },

        redirect: function (state) {
            if (!app.route) {
                if (IS_DEV) {
                    window.location.hash = state.ta;
                } else {
                    window.history.pushState(state, '', state.path);
                }
            }
        },

        defaultPic: function () {
            var img = event.srcElement;
            $(img).attr('src', 'default.svg');
            img.onerror = null;
        },

        /**
         * a object of promise
         * @param  condition function OR sec return bool
         * @param  int limit max test times
         * @return promise
         */
        waitFor: function (condition, limit) {
            var dfr = $.Deferred();
            var times = 0;
            var during = 70;
            limit = limit || 9; // Longest duration :  during * (limit+1)

            if (Number(condition) === condition) {
                setTimeout(function () {
                    dfr.resolve();
                }, condition * 1000);
            } else {
                var timer = setInterval(function () {
                    times++;
                    if (condition()) {
                        clearInterval(timer);
                        dfr.resolve();
                    }

                    if (times > limit) {
                        clearInterval(timer);
                        dfr.reject();
                    }
                }, during);

            }

            return dfr.promise();
        },

        stdErr: function (e, redo) {
            e.data = e.data || {};

            if (gee.isset(e.data) && gee.isset(e.data.msg)) {
                gee.alert({
                    title: 'Alert!',
                    txt: e.data.msg
                });
            } else {
                var code = 'e' + e.error;
                if (gee.isset(app.errMsg[code])) {
                    gee.alert({
                        title: 'Alert!',
                        txt: app.errMsg[code]
                    });
                } else {
                    gee.alert({
                        title: 'Error!',
                        txt: 'Server Error, Plaese Try Later(' + e.error + ')'
                    });
                }

                if (e.error === '8001') {
                    app.body.removeClass('login').addClass('logout');
                }
            }
        },

        stdSuccess: function (rtn) {
            rtn.data = rtn.data || {};

            if (gee.isset(rtn.data.msg)) {
                gee.alert({
                    title: 'Alert!',
                    txt: rtn.data.msg
                });
            }

            if (gee.isset(rtn.data.redirect)) {
                location.href = (rtn.data.redirect === '') ? gee.apiUri : rtn.data.redirect;
            }

            if (gee.isset(rtn.data.goback)) {
                history.go(-1);
            }
        },

        stdCallback: function () {
            if (this.code !== 1) {
                app.stdErr(this);
            } else {
                app.stdSuccess(this);
            }
        },

        cleanArray: function (actual) {
            var newArray = [];
            for (var i = 0; i < actual.length; i++) {
                if (actual[i]) {
                    newArray.push(actual[i]);
                }
            }
            return newArray;
        },

        helper: {
            isset: (ta, type) => {
                if (typeof ta === 'undefined' || ta === null) {
                    return false;
                } else {
                    if (typeof type !== 'undefined') {
                        return typeof ta === type;
                    } else {
                        return true;
                    }
                }
            },
            ksort: (unordered) => {
                let ordered = {};
                Object.keys(unordered).sort().forEach(function (key) {
                    ordered[key] = unordered[key];
                });
                return ordered;
            },
            md5: (str) => {
                gee.clog(str);
                return md5(str);
            },
            toString: (obj) => {
                let str = '';
                for (let key in obj) {
                    str += (str === '' ? '' : '&') + `${key}=${obj[key]}`;
                }
                return str;
            },
            get: function (obj, path) {
                let cu = obj;
                const addr = path.match(/([^\.\[\]]+)/g);

                for (var p in addr) {
                    if (!app.helper.isset(cu)) {
                        return null;
                    }

                    cu = cu[addr[p]];
                }

                return cu;
            },
            fmtDate: (val, fmt, parse = 'YYYY-MM-DD HH:mm:ss') => {
                return moment(val, parse).format(fmt);
            },
            formatMoney: (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
                try {
                    decimalCount = Math.abs(decimalCount);
                    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

                    const negativeSign = amount < 0 ? "-" : "";

                    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
                    let j = (i.length > 3) ? i.length % 3 : 0;

                    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
                } catch (e) {
                    console.log(e)
                }
            },
            calendar_range: (to) => {
                to = moment(to);
                const startOfMonth = moment().startOf('month');
                let rtn = [];

                for (let m = startOfMonth; m.isBefore(to); m.add(1, 'days')) {
                    rtn = [...rtn, ...[m.format('YYYY-MM-DD')]];
                }

                return rtn;
            },
            calendar: (offset = 0, disabled = [], selected = '') => {
                const calendar = moment().add(offset, 'months');

                let begin = calendar.startOf('month').week();
                let end = calendar.endOf('month').week();

                if (end < begin) {
                    end = moment().weeksInYear() + end;
                }

                if (!moment().isSame(calendar, 'year')) {
                    begin += moment().weeksInYear();
                    end += moment().weeksInYear();
                }

                let list = [];
                for (let week = begin; week <= end; week++) {
                    list.push({
                        week: week,
                        days: Array(7).fill({}).map((o, i) => {
                            let date = moment().week(week).startOf('week').clone().add(i, 'day');
                            let str = date.format('YYYY-MM-DD');

                            return {
                                date: str,
                                day: date.format('DD'),
                                thisMonth: date.isSame(calendar, 'month'),
                                isToday: date.isSame(moment(), 'd') && date.isSame(moment(), 'month'),
                                isDisabled: $.inArray(str, disabled) !== -1,
                                isSelected: str === selected,
                                isPass: moment().isAfter(date)
                            }
                        }),
                    })
                }

                return list;
            },
            toTitleCase: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        },

        formatHelper: {},

        progressingBtn: function (btn) {
            btn.attr('disabled', 'disabled').toggleClass('is-loading', true); // .append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
        },

        doneBtn: function (btn) {
            btn.prop('disabled', false).toggleClass('is-loading', false); // .find('.fa-spinner').remove();
        },


        args: (sParam) => {
            let sPageURL = window.location.search.substring(1),
                sURLVariables = sPageURL.split('&'),
                sParameterName;

            for (let i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
                }
            }
        }
    };

    return app;
};

window.app = new App();
