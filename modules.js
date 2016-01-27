(function (global, undefined) {
    var _modules = {};

    var _state = {};

    var _start;

    function imp (dep, cb) {
        if (!_start) {
            _start = Date.now();
        }

        load(dep, function () {
            console.log('all loaded ' + (Date.now() - _start));
            cb.apply(global, [_modules[dep]]);
        });
    }

    function exp (name, exported) {
        _modules[name] = exported;
    }

    function load (src, callback) {
        var script = global.document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = function () {
            console.log(src + ' loaded ' + (Date.now() - _start));
            global.document.body.removeChild(script);
            callback();
        }
        global.document.body.appendChild(script);
    }

    global.imp = imp;
    global.exp = exp;
})(window);
