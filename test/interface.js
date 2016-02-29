var expect = require('chai').expect;
var sinon = require('sinon');

var factory = require('../lib/index.js');

describe('interface (`module` function)', function () {
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
});
