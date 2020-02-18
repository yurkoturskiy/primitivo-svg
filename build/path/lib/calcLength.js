"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var calcLength = function (path) {
    var parameters = path.parameters;
    var maxLength = 0;
    var minLength = 0;
    var averageLength = 0;
    var maxLengthByGroup = Array(parameters.numOfGroups).fill(0);
    var minLengthByGroup = Array(parameters.numOfGroups).fill(0);
    var averageLengthByGroup = Array(parameters.numOfGroups).fill(0);
    path.vertexes = path.vertexes.map(function (vertex) {
        var x = vertex.x - parameters.centerX;
        var y = vertex.y - parameters.centerY;
        vertex.length = Math.sqrt(x * x + y * y);
        // Average length
        averageLength += vertex.length;
        averageLengthByGroup[vertex.group] += vertex.length;
        // min & max length
        if (vertex.length < minLength || minLength === 0)
            minLength = vertex.length;
        if (vertex.length > maxLength || maxLength === 0)
            maxLength = vertex.length;
        if (vertex.length > maxLengthByGroup[vertex.group] ||
            maxLengthByGroup[vertex.group] === 0)
            maxLengthByGroup[vertex.group] = vertex.length;
        if (vertex.length < minLengthByGroup[vertex.group] ||
            minLengthByGroup[vertex.group] === 0)
            minLengthByGroup[vertex.group] = vertex.length;
        return vertex;
    });
    averageLengthByGroup = averageLengthByGroup.map(function (len, i) { return len / parameters.groups[i].numOfVertexes; });
    parameters.averageLength = averageLength / path.vertexes.length;
    parameters.averageLengthByGroup = averageLengthByGroup;
    parameters.minLength = minLength;
    parameters.minLengthByGroup = minLengthByGroup;
    parameters.maxLength = maxLength;
    parameters.maxLengthByGroup = maxLengthByGroup;
    return path;
};
exports.default = calcLength;
