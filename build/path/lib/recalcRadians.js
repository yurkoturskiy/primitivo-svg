"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../misc/index");
// logging
var log = require("loglevel").getLogger("path-log");
var recalcRadians = function (path) {
    log.info("recalculate radians");
    var vertexes = path.vertexes;
    var _a = path.parameters, centerX = _a.centerX, centerY = _a.centerY;
    path.vertexes = vertexes.map(function (vertex) {
        var deltaX = vertex.x - centerX;
        var deltaY = centerY - vertex.y;
        vertex.radians = Math.atan2(deltaY, deltaX);
        vertex.angle = index_1.radToAngle(vertex.radians);
        return vertex;
    });
    return path;
};
exports.default = recalcRadians;
