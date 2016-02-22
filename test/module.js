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

        it('subsribes for the `ping` event', function () {
            expect(pubsub.on.getCall(0).args[0]).to.equal('ping test');
        });

        it('passes a function as a listener of `ping` event', function () {
            expect(pubsub.on.getCall(0).args[1]).to.be.a('function');
        });

        it('answers for that listener\'s call with `ready` event emission', function () {
            var ping = pubsub.on.getCall(0).args[1];
            ping();
            expect(pubsub.emit.getCall(1).args[0]).to.equal('ready test');
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

    describe('defined callback with 2 unloaded dependencies', function () {
        var module;
        var body;

        beforeEach(function () {
            body = sinon.spy();
            module = new Module('dependent', pubsub, ['first', 'second'], body);
        });

        it('adds listeners for `load` of both dependencies', function () {
            expect(pubsub.once.callCount).to.equal(2);
        });

        it('starts listening for `ready` of the first dependency', function () {
            expect(pubsub.once.getCall(0).args[0]).to.equal('ready first');
        });

        it('passes a function as a listener for `ready` event of the first dependency', function () {
            expect(pubsub.once.getCall(0).args[1]).to.be.a('function');
        });

        it('emits `ping` for both dependencies', function () {
            expect(pubsub.emit.callCount).to.equal(2);
        });

        it('emits `ping first`', function () {
            expect(pubsub.emit.getCall(0).args[0]).to.equal('ping first');
        });

        it('doesn\'t execute itself before dependencies\' load', function () {
            expect(body.callCount).to.equal(0);
        });

        describe('after the first dependency load', function () {
            beforeEach(function () {
                var firstLoad = pubsub.once.getCall(0).args[1];
                firstLoad('first', 'First');
            });

            it('doesn\'t execute itself after first dependency\'s load', function () {
                expect(body.callCount).to.equal(0);
            });
        });

        describe('after the second dependency load', function () {
            beforeEach(function () {
                var firstLoad = pubsub.once.getCall(0).args[1];
                var secondLoad = pubsub.once.getCall(1).args[1];
                firstLoad('first', 'First');
                secondLoad('second', 'Second');
            });

            it('executes itself once after both dependencies load', function () {
                expect(body.callCount).to.equal(1);
            });

            it('gets the first dependency as the first body argument', function () {
                expect(body.getCall(0).args[0]).to.equal('First');
            });

            it('gets the second dependency', function () {
                expect(body.getCall(0).args[1]).to.equal('Second');
            });
        });
    });
});
