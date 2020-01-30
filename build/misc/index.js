"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = function (number) { return Math.round(number * 1e6) / 1e6; };
exports.radToAngle = function (rad) { return (rad * 180) / Math.PI; };
exports.angleToRad = function (angle) { return (angle * Math.PI) / 180; };
exports.randomRange = function (min, max) {
    return Math.random() * (max - min) + min;
};
exports.radiansDelta = function (prev, cur) {
    // Convert negative radians to positive 2PI format
    if (prev < 0)
        prev = 2 * Math.PI - Math.abs(prev);
    if (cur < 0)
        cur = 2 * Math.PI - Math.abs(cur);
    var delta;
    if (prev < cur)
        // Fix if prev rad is before 0 and cur is after
        delta = Math.abs(prev + (Math.PI * 2 - cur));
    else
        delta = Math.abs(prev - cur);
    return delta;
};
exports.getType = function (item) {
    if (Array.isArray(item))
        return "array";
    if (typeof item === "object")
        return "object";
    if (typeof item === "number")
        return "number";
};
