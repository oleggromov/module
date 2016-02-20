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

    function load (name, dependencies, callback) {
        if (!_modules[name]) {
            _modules[name] = new Module(name, _events, dependencies, callback);
        } else {
            _events.emit('load ' + name, dependencies, callback);
        }

        dependencies.forEach(function(name) {
            if (!_modules[name]) {
                _modules[name] = new Module(name, _events);
            }
        });
    }

    load.PATH = '/modules/';
    load.EXTENSION = '.js';

    function Module (name, events, dependencies, callback) {
        this._name = name;
        this._events = events;

        if (callback) {
            this._fill(dependencies, callback);
        } else {
            this._fill = this._fill.bind(this);
            this._events.once('load ' + this._name, this._fill);
            this._load();
        }
    }

    Module.prototype = {
        _fill: function (dependencies, callback) {
            this._dependencies = dependencies;
            this._callback = callback;
            this._wait();
        },

        _wait: function () {
            if (this._dependencies.length) {
                this._waits = {};
                this._arguments = [];
                this._supply = this._supply.bind(this);
                this._dependencies.forEach(function (name, index) {
                    this._waits[name] = {
                        index: index,
                        loaded: false
                    };

                    this._events.once('ready ' + name, this._supply);
                    this._events.emit('ping ' + name);
                }, this);
            } else {
                this._run();
            }
        },

        _supply: function (name, body) {
            this._waits[name].loaded = true;
            this._arguments[this._waits[name].index] = body;
            this._check();
        },

        _check: function () {
            for (var dep in this._waits) {
                if (!this._waits[dep].loaded) {
                    return;
                }
            }

            this._run();
        },

        _run: function () {
            this._body = this._callback.apply(undefined, this._arguments);
            this._pong = this._pong.bind(this);
            this._events.on('ping ' + this._name, this._pong);
            this._pong();
        },

        _pong: function () {
            this._events.emit('ready ' + this._name, this._name, this._body);
        },

        _doc: global.document,

        _load: function () {
            this._script = this._doc.createElement('script');
            this._script.src = load.PATH + this._name + load.EXTENSION;
            this._script.async = true;
            this._script.onload = (function () {
                this._doc.body.removeChild(this._script);
            }).bind(this);
            this._doc.body.appendChild(this._script);
        }
    };

    // Exporting interface.
    global.module = load;
})(window);
