define(['_base', 'jquery'], function (base) {
    var socket = base.extend(function (options) {
        $.extend(this, {
            queue: [],
            requests: {},
            waiting: false
        }, options);
        addEventListener('unload', function () {
            this.destroy();
        }.bind(this));
    }, {
        root: external.wsroot || 'ws://127.0.0.1:30718',
        events: ['open', 'message', 'error', 'close'],
        regEscapeCharacters: new RegExp('[\\u0000-\\u0008\\u000b-\\u000c\\u000e-\\u001f]', 'g'),
        regResponseTimes: new RegExp('response_times=([^&]*)'),
        regSequence: new RegExp(',"res_seq":"\\d'),
        instance: function () {
            if (this._instance === undefined) {
                this._instance = new WebSocket(this.root);
                this.events.forEach(function (item) {
                    this._instance.addEventListener(item, this);
                }, this);
            }
            return this._instance;
        },
        destroy: function () {
            if (this._instance) {
                for (var key in this.requests) {
                    this.cancel(key);
                }
                this._instance.close();
                this.events.forEach(function (item) {
                    this._instance.removeEventListener(item, this);
                }, this);
                this._instance = undefined;
            }
        },
        handleEvent: function (e) {
            e.type in this && this[e.type](e);
        },
        send: function (url, callback) {
            this.queue.push([url, callback, 0, 0, Number((url.match(this.regResponseTimes) || [, 1])[1]), 0]);
            if (!this.waiting && this.instance().readyState === 1) {
                this.waiting = true;
                this.subscribe();
            }
        },
        subscribe: function () {
            this.queue[0][2]++;
            this.instance().send(this.queue[0][0]);
        },
        cancel: function (sequence) {
            delete this.requests[sequence];
            this.instance().send('/json/cancel?' + sequence);
        },
        callback: function (request, response) {
            request[1](response, request[0], request[4]);
        },
        parse: function (result) {
            var items = [],
                cols = result.head,
                rows = result.datas,
                cl = cols.length,
                rl = rows.length,
                i,
                j;
            items.cols = cols;
            if (cols.toString().indexOf('tablelist') > -1) {
                for (i = 0; i < rl; i++) {
                    for (j = 0; j < cl; j++) {
                        if (cols[j] === 'tablelist') {
                            items.push(this.parse(rows[i][j]));
                            break;
                        }
                    }
                }
                if (items.length === 1) {
                    return items[0];
                }
            } else {
                for (i = 0; i < rl; i++) {
                    for (i = 0; i < rl; i++) {
                        var item = {};
                        for (j = 0; j < cl; j++) {
                            item[cols[j]] = typeof rows[i][j] === 'object' && 'head' in rows[i][j] && 'datas' in rows[i][j] ? this.parse(rows[i][j]) : rows[i][j];
                        }
                        items.push(item);
                    }
                }
            }
            return items;
        },
        open: function (e) {
            if (this.queue.length) {
                this.waiting = true;
                this.subscribe();
            }
        },
        message: function (e) {
            if (this.regSequence.test(e.data)) {
                var data = JSON.parse(e.data.replace(this.regEscapeCharacters, function (s) {
                    s = JSON.stringify(s);
                    return s.slice(1, s.length - 1);
                }));
                if (data.res_seq === '0') {
                    if (this.queue.length) {
                        var request = this.queue.shift();
                        request[5] = data.req_seq;
                        this.requests[data.req_seq] = request;
                    }
                    if (this.queue.length) {
                        this.subscribe();
                    } else {
                        this.waiting = false;
                    }
                } else {
                    if (data.req_seq in this.requests) {
                        var request = this.requests[data.req_seq];
                        ++request[3] === request[4] && this.cancel(data.req_seq);
                        this.callback(request, data);
                    }
                }
            } else {
                if (this.queue[0][0].indexOf('#DZH2DATA#') > -1) {
                    this.callback(this.queue.shift(), e.data);
                    if (this.queue.length) {
                        this.subscribe();
                    } else {
                        this.waiting = false;
                    }
                } else if (this.queue.length) {
                    setTimeout(function () {
                        this.subscribe();
                    }.bind(this), this.queue[0][2] > 3 ? Math.min((this.queue[0][2] - 3) * 10000, 300000) : 0);
                    this.queue.push(this.queue.shift());
                }
            }
        },
        error: function (e) {
            e.target.readyState === 3 && console.log('连接已经断开 ' + e.target.url);
        },
        close: function (e) {
        }
    });
    $.extend({
        socket: new socket(),
        send: function (url, params, options) {
            var promise = $.extend($.Deferred(), {
                cancel: function () {
                    this.sequence && $.socket.cancel(this.sequence);
                    this.reject('cancel');
                },
                parse: function (result) {
                    return this.after($.socket.parse(this.before(result)));
                },
                before: function (result) {
                    return result;
                },
                after: function (result) {
                    return result;
                }
            });
            if (typeof arguments[0] !== 'string') {
                options = params;
                params = url;
                url = '';
            }
            if (url.indexOf('#DZH2DATA#') === -1) {
                url = '/json/subscribe?' + (url ? url + (url.indexOf('?') > -1 ? '&' : '?') : '') + decodeURIComponent($.param($.extend({
                    cache_timeout: 0,
                    request_timeout: 10
                }, typeof params === 'object' ? params : {})));
            }
            !('env' in external && !external.env) && typeof params === 'object' && params.paraencode && console.log(params.parameter.split(',').map(function (item) {
                return (external.base64decode || atob)(item);
            }).join(';'));
            $.extend(promise, options);
            $.socket.send(url, function (response, url, limit) {
                if (typeof response === 'object') {
                    if (!('res_type' in response) || response.res_type < 0) {
                        console.log(JSON.stringify(response));
                        response.url = url;
                        this[limit === 1 ? 'reject' : 'notify'](response);
                    } else {
                        this.sequence = limit === 1 ? 0 : response.req_seq;
                        //!('env' in external && !external.env) && console.log([url, JSON.stringify(response)]);
                        this[limit === 1 ? 'resolve' : 'notify'](response.result && response.result.head ? this.parse(response.result) : []);
                    }
                } else {
                    this.resolve(response);
                }
            }.bind(promise));
            return promise;
        }
    });
    return socket;
});