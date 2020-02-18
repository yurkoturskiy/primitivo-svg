"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generateD = function (path) {
    path.vertexes = path.vertexes.map(function (vertex) {
        switch (vertex.type) {
            case "M":
                vertex.d = vertex.type + " " + vertex.x + " " + vertex.y;
                break;
            case "C":
                vertex.d = vertex.type + "\n" + vertex.x1 + " " + vertex.y1 + ",\n" + vertex.x2 + " " + vertex.y2 + ",\n" + vertex.x + " " + vertex.y;
                break;
            default:
                vertex.d = "";
        }
        return vertex;
    });
    var d = "";
    path.vertexes.forEach(function (vertex, i) {
        d += "\n\n" + vertex.d;
    });
    d += "\n\nZ";
    path.d = d;
    return path;
};
exports.default = generateD;
