define(['_base', 'observable', 'jquery', '_widget', 'html'], function (base, observable, $, widget) {
    return base.extend([observable], function (options) {
        $.extend(this, options);
        if (this.root) {
            this.root.on('click', '[data-bind$=Click]', this.handleEvent.bind(this));
            this.root.on('change', '[data-bind$=Change]', this.handleEvent.bind(this));
        }
    }, {
        handleEvent: function (e) {
            var fn = e.currentTarget.dataset.bind;
            fn in this && typeof this[fn] === 'function' && this[fn](e);
            this.emit(fn.replace(/^on\w/, function (str) {
                return str.slice(-1).toLowerCase();
            }), e.currentTarget['value' in e.currentTarget && /INPUT|TEXTAREA|SELECT/.test(e.currentTarget.tagName) ? 'value' : 'dataset']);
        },
        handleLoading: function () {
            if ($('body').hasClass('loading')) {
                for (var key in this) {
                    if (key.indexOf('render') === 0 && typeof this[key] === 'function' && this[key].length) {
                        var fn = function () {
                            for (var key in this) {
                                if (typeof this[key] === 'function' && this[key].origin) {
                                    var fn = this[key];
                                    this[key] = fn.origin;
                                    fn.origin = undefined;
                                }
                            }
                            this[arguments.callee.key].apply(this, arguments);
                            $('body').removeClass('loading');
                        };
                        fn.key = key;
                        fn.origin = this[key];
                        this[key] = fn;
                    }
                }
            }
        },
        destroy: function () {
            for (var key in this) {
                if (typeof this[key] === 'object') {
                    this[key] instanceof $ && this[key].off();
                    this[key] instanceof widget && this[key].destroy();
                }
            }
        }
    });
});