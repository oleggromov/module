(function (global, undefined) {
    "use strict";

    var _modules = {};
    var _dependents = [];

    global.imp = function (sources, callback) {
        var dependent = new Dependent(callback, sources);
        _dependents.push(dependent);

        while (sources.length) {
            var src = sources.shift();

            if (!_modules[src]) {
                _modules[src] = new Module(src);
            }

            _modules[src].addDependent(dependent);
        }
    };

    global.exp = function (src, body) {
        if (!_modules[src]) {
            throw new Error('module ' + src + ' was not imported!');
        }

        _modules[src].addBody(body);
    };

    function Dependent (callback, sources) {
        this._bodies = [];
        this._sources = sources.slice();
        this._statuses = new Array(this._sources.length);
        this._callback = callback;
    }

    Dependent.prototype = {
        notify: function (source, body) {
            for (var i = 0; i < this._sources.length; i++) {
                if (this._sources[i] === source) {
                    this._bodies[i] = body;
                    this._statuses[i] = true;
                }
            }

            this._check();
        },

        _check: function () {
            for (var i = 0; i < this._statuses.length; i++) {
                if (!this._statuses[i]) {
                    return;
                }
            }

            this._callback.apply(undefined, this._bodies);
        }
    };

    function Module (src) {
        this._dependents = [];
        this._src = src;
        // this._loaded = false;
        // this._script = undefined;
        // this._body = undefined;

        this._load();
    }

    Module.prototype = {
        addDependent: function (dependent) {
            if (!this._loaded) {
                this._dependents.push(dependent);
                return;
            }

            dependent.notify(this._src, this._body);
        },

        addBody: function (body) {
            this._loaded = true;
            this._body = body;

            this._doc.body.removeChild(this._script);

            while (this._dependents.length) {
                this._dependents.shift().notify(this._src, this._body);
            }
        },

        _doc: global.document,

        _load: function () {
            this._script = this._doc.createElement('script');
            this._script.src = this._src;
            this._script.async = true;
            this._doc.body.appendChild(this._script);
        }
    };
})(window);
