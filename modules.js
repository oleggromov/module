(function (global, undefined) {
    "use strict";

    /**
     * Module import function. Use it to declare
     * dependencies (as the first argument) and module body (the second one).
     *
     * @param {Array} dependencies Array of dependencies (paths) to load.
     * @param {Function} callback Module body.
     */
    global.imp = function (dependencies, callback) {
        _imports.push({
            callback: callback,
            dependencies: dependencies
        });

        console.log(dependencies, _imports);

        each(dependencies, loadOnce);
    };

    /**
     * Module export function.
     *
     * @param  {[type]} name     [description]
     * @param  {[type]} exported [description]
     * @return {[type]}          [description]
     */
    global.exp = function (name, exported) {
        _state[name] = _LOADED;
        _modules[name] = exported;
    };


    /**
     * Private part.
     */

    var _modules = {};
    var _state = {};
    var _imports = [];

    var _UNKNOWN = undefined;
    var _WAITING = 1;
    var _LOADED = 2;

    function each (arr, callback) {
        for (var i = 0; i < arr.length; i++) {
            callback(arr[i], i);
        }
    }

    function flatten (arr) {
        var flat = [];
        each(arr, function (item) {
            if (item) {
                flat.push(item);
            }
        });
        return flat;
    }

    function load (src, callback) {
        var script = global.document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = function () {
            global.document.body.removeChild(script);
            callback(src);
        }
        global.document.body.appendChild(script);
    }

    function loadOnce (dependency) {
        if (_state[dependency] === _UNKNOWN) {
            _state[dependency] = _WAITING;
            load(dependency, checkImports);
        } else if (_state[dependency] === _LOADED) {
            checkImports();
        }
    }

    function getArguments (dependencies) {
        var params = [];
        each(dependencies, function (dep) {
            params.push(_modules[dep]);
        });
        return params;
    }

    function checkImports () {
        each(_imports, function (imp, index) {
            if (!imp) {
                return;
            }

            var fulfilled = true;

            each(imp.dependencies, function (dep) {
                if (_state[dep] !== _LOADED) {
                    fulfilled = false;
                }
            });

            if (fulfilled) {
                imp.callback.apply(undefined, getArguments(imp.dependencies));
                _imports[index] = undefined;
            }
        });

        _imports = flatten(_imports);
    }
})(window);
