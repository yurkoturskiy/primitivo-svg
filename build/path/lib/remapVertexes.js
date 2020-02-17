"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var remapVertexes = function (path) {
    /*
     * Add "M" vertex to the array at the start
     * Move first vertex to the end
     * Set index to each vertex
     */
    var vertexes = path.vertexes;
    vertexes[vertexes.length] = vertexes[0];
    vertexes[0] = __assign({}, vertexes[0], { type: "M" });
    var newVertexes = vertexes.map(function (vertex, index) { return (__assign({}, vertex, { index: index })); });
    return __assign({}, path, { vertexes: newVertexes });
};
exports.default = remapVertexes;
