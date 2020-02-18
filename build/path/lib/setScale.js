"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var setScale = function (path) {
    var parameters = path.parameters;
    path.frame.vertexes = path.frame.vertexes.map(function (vertex) {
        vertex.x *= parameters.width / 2;
        vertex.y *= parameters.height / 2;
        return vertex;
    });
    path.vertexes = path.vertexes.map(function (vertex) {
        vertex.x *= parameters.width / 2;
        vertex.y *= parameters.height / 2;
        if (vertex.type === "C") {
            vertex.x1 *= parameters.width / 2;
            vertex.y1 *= parameters.height / 2;
            vertex.x2 *= parameters.width / 2;
            vertex.y2 *= parameters.height / 2;
        }
        return vertex;
    });
    return path;
};
exports.default = setScale;
