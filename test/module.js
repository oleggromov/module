var expect = require('chai').expect;
var sinon = require('sinon');

var Module = require('../lib/module.js');

describe('Module', function () {
    var pubsub;

    beforeEach(function () {
        pubsub = {
            on: sinon.spy(),
            once: sinon.spy(),
            off: sinon.spy(),
            emit: sinon.spy()
        };
    });

    describe('defined callback without dependencies', function () {
        var body;
        var module;

        beforeEach(function () {
            body = sinon.spy(function body () {
                return 'body';
            });

            module = new Module('test', pubsub, [], body);
        });

        it('executes module body only once', function () {
            expect(body.callCount).to.equal(1);
        });

        it('fires ready event with module\'s name', function () {
            expect(pubsub.emit.getCall(0).args[0]).to.equal('ready test');
        });

        it('passes module\'s name to the arguments', function () {
            expect(pubsub.emit.getCall(0).args[1]).to.equal('test');
        });

        it('passes module body\'s return value to the arguments', function () {
            expect(pubsub.emit.getCall(0).args[2]).to.equal('body');
        });
    });

    describe('waiting for load without dependencies', function () {
        var module;

        beforeEach(function () {
            module = new Module('waiting', pubsub);
        });

        it('starts to listen `load` event for itself', function () {
            expect(pubsub.once.getCall(0).args[0]).to.equal('load waiting');
        });

        it('passes some function as the `load` event listener', function () {
            expect(pubsub.once.getCall(0).args[1]).to.be.a('function');
        });

        it('fires `ready` event on that function call', function () {
            var onload = pubsub.once.getCall(0).args[1];
            onload([], function () {});
            expect(pubsub.emit.getCall(0).args[0]).to.equal('ready waiting');
        });
    });
});
