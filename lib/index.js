var PubSub = require('true-pubsub');
var Module = require('./module.js');

var _events = new PubSub;
var _modules = {};

function fn (name, dependencies, callback) {
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

fn.PATH = '/';
fn.EXTENSION = '.js';

function load (name) {
    var doc = global.document;
    var script = doc.createElement('script');

    script.src = fn.PATH + name + fn.EXTENSION;
    script.async = true;
    script.onload = function () {
        doc.body.removeChild(script);
    };

    doc.body.appendChild(script);
}

module.exports = fn;
