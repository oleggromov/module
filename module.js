(function (global, undefined) {
    "use strict";

    /**
     * PubSub implementation from https://github.com/oleggromov/pubsub
     */
    function PubSub () {
        this._events = {};
    }

    PubSub.prototype = {
        on: function (event, callback) {
            if (!this._events[event]) {
                this._events[event] = [];
            }

            this._events[event].push(callback);
        },

        once: function (event, callback) {
            var cb = (function () {
                callback.apply(undefined, arguments);
                this.off(event, cb);
            }).bind(this);

            this.on(event, cb);
        },

        off: function (event, callback) {
            if (this._events[event]) {
                var index = this._events[event].indexOf(callback);
                this._events[event][index] = undefined;
            }
        },

        emit: function (event) {
            var args = Array.prototype.slice.call(arguments, 1);

            if (this._events[event]) {
                this._events[event].forEach(function (callback) {
                    if (typeof callback === 'function') {
                        callback.apply(undefined, args);
                    }
                });
            }
        }
    };

    var _events = new PubSub;
    var _modules = {};

    function module (name, dependencies, callback) {
        if (!_modules[name]) {
            _modules[name] = new Module(name, _events, dependencies, callback);

            if (!callback) {
                load(name);
            }
        } else {
            _events.emit('load ' + name, dependencies, callback);
        }

        dependencies.forEach(function(name) {
            if (!_modules[name]) {
                _modules[name] = new Module(name, _events);
                load(name);
            }
        });
    }

    module.PATH = '/modules/';
    module.EXTENSION = '.js';

    function load (name) {
        var doc = global.document;
        var script = doc.createElement('script');

        script.src = module.PATH + name + module.EXTENSION;
        script.async = true;
        script.onload = function () {
            doc.body.removeChild(script);
        };

        doc.body.appendChild(script);
    }

    // Exporting interface.
    global.module = module;


    function Module (name, events, dependencies, callback) {
        this._name = name;
        this._events = events;

        if (callback) {
            this._fill(dependencies, callback);
        } else {
            this._events.once('load ' + this._name, this._fill.bind(this));
        }
    }

    Module.prototype = {
        _fill: function (dependencies, callback) {
            this._dependencies = dependencies;
            this._callback = callback;
            this._wait();
        },

        _wait: function () {
            this._arguments = [];
            this._waits = [];
            this._dependencies.forEach(function (name) {
                this._waits.push(false);
                this._events.once('ready ' + name, this._supply.bind(this));
                this._events.emit('ping ' + name);
            }, this);

            if (!this._waits.length) {
                this._run();
            }
        },

        _supply: function (name, body) {
            var index = this._dependencies.indexOf(name);
            this._waits[index] = true;
            this._arguments[index] = body;
            this._check();
        },

        _check: function () {
            var fullfilled = this._waits.reduce(function(prev, cur) {
                return prev && cur;
            }, true);

            if (fullfilled) {
                this._run();
            }
        },

        _run: function () {
            this._body = this._callback.apply(undefined, this._arguments);
            this._pong = this._pong.bind(this);
            this._events.on('ping ' + this._name, this._pong);
            this._pong();
        },

        _pong: function () {
            this._events.emit('ready ' + this._name, this._name, this._body);
        }
    };
})(window);
