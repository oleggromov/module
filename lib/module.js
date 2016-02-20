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

module.exports = Module;
