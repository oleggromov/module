var expect = require('chai').expect;
var sinon = require('sinon');

var factory = require('../lib/index.js');

describe('interface (globally exported `module` function)', function () {
    var fn;
    var pubsub;
    var module;
    var load;

    beforeEach(function () {
        pubsub = {
            on: sinon.spy(),
            once: sinon.spy(),
            off: sinon.spy(),
            emit: sinon.spy()
        };

        module = sinon.spy();
        load = sinon.spy();

        fn = factory(pubsub, module, load);
    });

    describe('configure', function () {
        it('allows to set PATH', function () {
            fn.configure('PATH', '/sample_test_path/');
            expect(load.PATH).to.equal('/sample_test_path/');
        });

        it('allows to set EXTENSION', function () {
            fn.configure('EXTENSION', '.html');
            expect(load.EXTENSION).to.equal('.html');
        });

        it('doesn\'t set arbitrary properties', function () {
            fn.configure('ARBITRARY', true);
            expect(load.ARBITRARY).to.be.undefined;
        });
    });

    describe('loaded module without dependencies', function () {
        var cb;

        beforeEach(function () {
            cb = sinon.spy();
            fn('sample_module', [], cb);
        });

        it('creates new Module instance', function () {
            expect(module.calledWithNew()).to.be.true;
        });

        it('passes correct name to the instance', function () {
            expect(module.getCall(0).args[0]).to.equal('sample_module');
        });

        it('passes a common pubsub instance to it', function () {
            expect(module.getCall(0).args[1]).to.equal(pubsub);
        });

        it('passes callback to the instance', function () {
            expect(module.getCall(0).args[3]).to.equal(cb);
        });

        it('doesn\'t call callback explicitly', function () {
            expect(cb.callCount).to.be.zero;
        });
    });

    describe('not loaded yet module', function () {
        var cb = function () {};

        beforeEach(function () {
            fn('loaded_module', []);
            fn('loaded_module', [], cb);
        });

        it('emits `load` event when the callback is passed', function () {
            expect(pubsub.emit.getCall(0).args[0]).to.equal('load loaded_module');
        });

        it('emits event only once', function () {
            expect(pubsub.emit.callCount).to.equal(1);
        });

        it('passes to it the original callback', function () {
            expect(pubsub.emit.getCall(0).args[2]).to.equal(cb);
        });
    });
});
