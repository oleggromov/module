module('a', ['b'], function (b) {
    console.warn('Module a', b);
    return "A";
});
