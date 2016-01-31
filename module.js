(function (global, undefined) {
    "use strict";

    var _modules = [];

    window.modules = _modules;

    function module (name, dependencies, callback) {
        if (!_modules[name]) {
            _modules[name] = new Module(name, dependencies, callback);
        } else {
            _modules[name].setLoaded(dependencies, callback);
        }

        if (!dependencies.length) {
            _modules[name].init();
        } else {
            dependencies.forEach(function (dependency) {
                if (!_modules[dependency]) {
                    _modules[dependency] = new Module(dependency);
                }
                _modules[dependency].addDependent(_modules[name]);
            });
        }
    }

    module.path = '/modules/';
    module.extension = '.js';

    function Module (name, depNames, callback) {
        this._name = name;
        this._dependents = [];

        if (callback) {
            this.setLoaded(depNames, callback);
        } else {
            this._load();
        }
    }

    Module.prototype = {
        init: function () {
            var args = this._dependencies.map(function (dependency) {
                return dependency.getBody();
            });

            this._body = this._callback.apply(undefined, args);

            while (this._dependents.length) {
                this._dependents.shift().notify(this);
            }
        },

        setLoaded: function (depNames, callback) {
            this._loaded = true;
            this._depNames = depNames;
            this._dependencies = new Array(depNames.length);
            this._callback = callback;
        },

        notify: function (dependency) {
            var index = this._depNames.indexOf(dependency.getName());
            if (index !== -1) {
                this._dependencies[index] = dependency;
                if (this._areDependenciesLoaded()) {
                    this.init();
                }
            }
        },

        addDependent: function (module) {
            if (!this._loaded) {
                this._dependents.push(module);
                return;
            }

            module.notify(this);
        },

        getName: function () {
            return this._name;
        },

        getBody: function () {
            return this._body;
        },

        isLoaded: function () {
            return this._loaded;
        },

        _areDependenciesLoaded: function () {
            for (var i = 0; i < this._dependencies.length; i++) {
                if (!this._dependencies[i] || !this._dependencies[i].isLoaded()) {
                    return false;
                }
            }

            return true;
        },

        _doc: global.document,

        _load: function () {
            this._script = this._doc.createElement('script');
            this._script.src = module.path + this._name + module.extension;
            this._script.async = true;
            this._script.onload = (function () {
                this._doc.body.removeChild(this._script);
            }).bind(this);
            this._doc.body.appendChild(this._script);
        }
    };

    // Exporting interface.
    global.module = module;
})(window);
