module('b', ['c'], function (c) {
    console.warn('Module b', c);
    return "B";
});
