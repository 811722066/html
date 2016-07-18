define(function () {
    var base = function () {
    };
    base.prototype = {
        constructor: base,
        base: function (args) {
            var method, prototype = this, caller = arguments.callee.caller;
            while (prototype) {
                if (method && (method in prototype) && prototype[method] !== caller) {
                    return prototype[method].apply(this, typeof args === 'object' && 'callee' in args ? args : arguments);
                } else {
                    for (var key in prototype) {
                        if (prototype[key] === caller) {
                            method = key;
                            break
                        }
                    }
                }
                prototype = prototype.constructor.prototype.__proto__;
            }
        }
    };
    base.mixin = function () {
        for (var i = 0, l = arguments.length; i < l; i++) {
            var properties = arguments[i].prototype || arguments[i];
            for (var key in properties) {
                if (/function|string|number|boolean/.test(typeof properties[key])) {
                    this.prototype[key] = properties[key];
                }
            }
        }
    };
    base.extend = function (mixins, init, prototype) {
        var args = Array.prototype.slice.call(arguments),
            base = this,
            fn;
        Object.prototype.toString.call(args[0]) !== '[object Array]' && args.splice(0, 0, []);
        typeof args[1] !== 'function' && args.splice(1, 0, undefined);
        typeof args[2] !== 'object' && args.splice(2, 0, {});
        mixins = args[0];
        init = args[1];
        prototype = args[2];
        fn = function () {
            base.apply(this, arguments);
            for (var i = 0, l = mixins.length; i < l; i++) {
                typeof mixins[i] === 'function' && mixins[i].call(this);
            }
            init && init.apply(this, arguments);
            this.constructor === arguments.callee && typeof this.init === 'function' && this.init.apply(this, arguments);
        };
        fn.mixin = this.mixin;
        fn.extend = this.extend;
        fn.prototype = prototype;
        fn.prototype.__proto__ = base.prototype;
        fn.prototype.constructor = fn;
        fn.mixin.apply(fn, mixins);
        return fn;
    };
    return base;
});