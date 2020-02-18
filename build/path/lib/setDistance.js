"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var setDistance = function (path) {
    var vertexes = path.vertexes;
    var groups = path.parameters.groups;
    path.vertexes = path.vertexes.map(function (vertex, index) {
        // Setup distance
        vertex.x *= vertex.distance;
        vertex.y *= vertex.distance;
        if (vertex.type === "C") {
            // Setup distance
            vertex.x1 *= vertexes[index - 1].distance;
            vertex.y1 *= vertexes[index - 1].distance;
            vertex.x2 *= vertex.distance;
            vertex.y2 *= vertex.distance;
        }
        return vertex;
    });
    return path;
};
exports.default = setDistance;
