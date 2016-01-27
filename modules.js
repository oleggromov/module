(function (global, undefined) {
    var _modules = {};
    var _loading = {};
    var _imports = [];

    function each (arr, callback) {
        for (var i = 0; i < arr.length; i++) {
            callback(arr[i], i);
        }
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
        if (!_loading[dependency]) {
            _loading[dependency] = true;
            load(dependency, checkImports);
        }
    }

    function getArguments (dependencies) {
        var params = [];
        each(dependencies, function (dep) {
            params.push(_modules[dep]);
        });
        return params;
    }

    function checkImports (src) {
        each(_imports, function (imp, index) {
            var fulfilled = true;

            each(imp.dependencies, function (dep) {
                if (!_modules[dep]) {
                    fulfilled = false;
                }
            });

            if (fulfilled) {
                imp.callback.apply(undefined, getArguments(imp.dependencies));
                _imports.splice(index, 1);
            }
        });
    }

    global.imp = function (dependencies, callback) {
        _imports.push({
            callback: callback,
            dependencies: dependencies
        });

        each(dependencies, loadOnce);
    };

    global.exp = function (name, exported) {
        _modules[name] = exported;
    };
})(window);
