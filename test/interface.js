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

    describe('not loaded yet (without a callback) module without dependencies', function () {
        beforeEach(function () {
            fn('sample_module', []);
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

        it('invokes loading function', function () {
            expect(load.callCount).to.equal(1);
        });

        it('passes module name to load function', function () {
            expect(load.getCall(0).args[0]).to.equal('sample_module');
        });
    });
});
