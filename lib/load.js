function load (name) {
    var doc = global.document;
    var script = doc.createElement('script');

    script.src = load.PATH + name + load.EXTENSION;
    script.async = true;
    script.onload = function () {
        doc.body.removeChild(script);
    };

    doc.body.appendChild(script);
}

module.exports = load;
