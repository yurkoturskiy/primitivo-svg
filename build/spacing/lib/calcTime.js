"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var solveCubicEquation_1 = __importDefault(require("./solveCubicEquation"));
var log = require("loglevel").getLogger("spacing-log");
function calcTime(p1y, p2y, p3y, p4y, py) {
    var a = p4y - 3 * p3y + 3 * p2y - p1y;
    log.debug("a", a);
    var b = 3 * (p3y - 2 * p2y + p1y);
    log.debug("b", b);
    var c = 3 * (p2y - p1y);
    log.debug("c", c);
    var d = p1y - py;
    log.debug("d", d);
    var ts = solveCubicEquation_1.default(a, b, c, d);
    for (var _i = 0, ts_1 = ts; _i < ts_1.length; _i++) {
        var t = ts_1[_i];
        if (t > 0 && t < 1)
            return t;
    }
    return ts[1];
}
exports.default = calcTime;
