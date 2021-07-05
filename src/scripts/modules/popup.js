(function (app, gee, $) {
    'use strict';

    app.popup = {
        class: {
            active: 'hidden',
        },
        defs: {
            ta: 'popup-normal',
        },
        btn: null,
        id: null,
        show: (input, opts) => {
            app.popup.btn = input;

            opts = { ...app.popup.defs, ...opts };

            gee.clog(JSON.stringify(opts));

            const box = $(`#${opts.ta}`);

            app.loadHtml(opts.src, box.find('.popup-body'));

            app.waitFor(0.1).then(() => {
                box.toggleClass(app.popup.class.active, false);
            });
        },
    };

    gee.hook('popup/show', (me) => {
        const ta = me.data('ta') || 'popup-normal';
        const box = $(`#${ta}`);
        const src = me.data('src') || '';

        app.popup.show(me, { ta, box, src });
    });

    gee.hook('popup/hide', (me) => {
        me.closest('.popup').toggleClass(app.popup.class.active, true).find('.popup-body').empty();
    });

    gee.hook('popup/apply', (me) => {
        const box_title = me.find('.js-title');
        const box = app.popup.btn.closest('[data-id]');
        const title = box.find('.js-title').text();
        // const intro = box.data('intro');

        app.popup.id = box.data('id');

        box_title.html(title);
    });

    gee.hook('popup/intro', (me) => {
        let box = app.popup.btn.closest('[data-id]');

        console.log(box, ' ------- 1 ')

        if(box.length === 0) {
            box = $(`[data-id="${app.popup.id}"]`);
        }

        console.log(box, ' ------- 2 ')

        const intro = box.data('intro');

        me.find('img').prop('src', intro);

        // const box_title = me.find('.js-title');

        // const title = box.find('.js-title').text();
        // const intro = box.data('intro');

        // box_title.html(title);
    });
})(app, gee, jQuery);
