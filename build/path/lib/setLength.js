"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
var calcLength_1 = __importDefault(require("./calcLength"));
// logging
var log = require("loglevel").getLogger("path-log");
var setLength = function (path) {
    log.info("set length");
    var parameters = path.parameters, vertexes = path.vertexes;
    var groups = path.parameters.groups;
    var calcFactor = function (newRadius, radius) {
        if (newRadius === 0 || radius === 0)
            return 0;
        return newRadius / radius;
    };
    path.vertexes = vertexes.map(function (vertex, i) {
        // Calc factor
        var factor = vertex.radius ? calcFactor(vertex.radius, vertex.length) : 1;
        // Set length
        vertex.x = (vertex.x - parameters.centerX) * factor + parameters.centerX;
        vertex.y = (vertex.y - parameters.centerY) * factor + parameters.centerY;
        if (vertex.type === "C") {
            var prevFactor = vertexes[i - 1].radius
                ? calcFactor(vertexes[i - 1].radius, vertexes[i - 1].length)
                : 1;
            vertex.x1 =
                (vertex.x1 - parameters.centerX) * prevFactor + parameters.centerX;
            vertex.y1 =
                (vertex.y1 - parameters.centerY) * prevFactor + parameters.centerY;
            vertex.x2 =
                (vertex.x2 - parameters.centerX) * factor + parameters.centerX;
            vertex.y2 =
                (vertex.y2 - parameters.centerY) * factor + parameters.centerY;
        }
        return vertex;
    });
    log.debug(path);
    return path;
};
exports.default = (function (path) {
    return pipeable_1.pipe(calcLength_1.default(path), setLength, calcLength_1.default);
});
