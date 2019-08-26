"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = function (number) { return Math.round(number * 1e6) / 1e6; };
exports.radToAngle = function (rad) { return (rad * 180) / Math.PI; };
exports.angleToRad = function (angle) { return (angle * Math.PI) / 180; };
exports.randomFromRange = function (min, max) {
    return Math.random() * (max - min) + min;
};
exports.radiansDelta = function (a, b) {
    var delta = Math.abs(a - b);
    if (delta > Math.PI)
        delta = 2 * Math.PI - delta;
    return delta;
};
