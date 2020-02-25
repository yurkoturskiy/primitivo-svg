"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calcPx(p1x, p2x, p3x, p4x, t) {
    var p = p1x * Math.pow(1 - t, 3) +
        3 * p2x * t * Math.pow(1 - t, 2) +
        3 * p3x * Math.pow(t, 2) * (1 - t) +
        p4x * Math.pow(t, 3);
    return p;
}
exports.default = calcPx;
