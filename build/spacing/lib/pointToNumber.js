"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log = require("loglevel").getLogger("spacing-log");
var pointToNumber = function (point) {
    log.debug("point to number", point);
    var p = point.split(",");
    p = [Number(p[0]), Number(p[1])];
    log.debug("converted point to number", p);
    return p;
};
exports.default = pointToNumber;
