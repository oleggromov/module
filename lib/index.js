function factory (_events, Module, load) {
    var _modules = {};

    function fn (name, dependencies, callback) {
        if (!_modules[name]) {
            _modules[name] = new Module(name, _events, dependencies, callback);
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

    fn.configure = function (option, value) {
        var options = ['PATH', 'EXTENSION'];

        if (options.indexOf(option) > -1) {
            load[option] = value;
        }
    };

    fn.configure('PATH', '/');
    fn.configure('EXTENSION', '.js');

    return fn;
}

var PubSub = require('true-pubsub');
var Module = require('./module.js');
var load = require('./load.js');

if (process && process.env && process.env.NODE_ENV === 'test') {
    module.exports = factory;
} else {
    module.exports = factory(new PubSub, Module, load);
}
