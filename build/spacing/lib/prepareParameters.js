"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log = require("loglevel").getLogger("spacing-log");
var prepareParameters = function (params) {
    if (!params.keySplines)
        params.keySplines = "0,0,1,1";
    if (!params.keyTimes) {
        var keyTimes = Array(params.progression.length);
        keyTimes.fill(null, 0, params.progression.length - 1);
        keyTimes[0] = 0;
        keyTimes[keyTimes.length - 1] = 1;
        params.keyTimes = keyTimes;
    }
    log.debug(" input progression", params.progression);
    log.debug("input keySplines", params.keySplines);
    log.debug("input keyTimes", params.keyTimes);
    if (typeof params.keySplines === "string") {
        params.keySplines = params.keySplines.split(",");
        if (params.keySplines.length !== 4)
            throw "Wrong keySplines format";
        var proto = Array((params.progression.length - 1) * 2);
        proto.fill(null, 0, proto.length - 1);
        proto[0] = params.keySplines[0] + ", " + params.keySplines[1];
        proto[proto.length - 1] = params.keySplines[2] + ", " + params.keySplines[3];
        params.keySplines = proto;
        log.debug("keySplines", params.keySplines);
    }
    if (typeof params.keySplines === "object" &&
        params.keySplines.length !== (params.progression.length - 1) * 2)
        throw "Amount of keySplines' array items doesn't match the number of progression's items";
    log.debug("parameters", params);
    return params;
};
exports.default = prepareParameters;
