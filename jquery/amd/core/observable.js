define(['_base'], function (base) {
    return base.extend(function () {
        this._topics = {};
    }, {
        observers: function (topics, fn) {
            topics.replace(/\S+/g, function (fn, name) {
                fn.call(this, this._topics[name] || [], name);
            }.bind(this, fn));
            return this;
        },
        on: function (topics, observer, count) {
            return this.observers(topics, function (observer, count, observers, name) {
                if (!(name in this._topics)) {
                    this._topics[name] = observers;
                }
                observers.push([observer, count]);
            }.bind(this, observer, count));
        },
        one: function (topics, observer) {
            return this.on(topics, observer, 1);
        },
        off: function (topics, observer) {
            return this.observers(topics, function (observer, observers) {
                if (observer) {
                    var i = observers.length;
                    while (i--) {
                        observers[i][0] === observer && observers.splice(i, 1);
                    }
                } else {
                    observers.length = 0;
                }
            }.bind(this, observer));
        },
        emit: function () {
            var args = Array.prototype.slice.call(arguments);
            return this.observers(args.shift(), function (args, observers) {
                for (var i = 0, l = observers.length; i < l; i++) {
                    var observer = observers[i];
                    observer[1] && observer[1]--;
                    observer[1] === 0 && observers.splice(i--, 1) && l--;
                    observer[0].apply(this, args);
                }
            }.bind(this, args));
        }
    });
});