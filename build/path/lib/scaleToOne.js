"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parseGroupParameter_1 = __importDefault(require("./parseGroupParameter"));
var misc_1 = require("../../misc");
var getIncircleValue = function (group, vertexIndex) {
    var parameter = group.incircle;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "boolean")
        throw "Wrong 'incircle' parameter in group number " + group.pk;
    else
        return parameter;
};
var scaleToOne = function (path) {
    var groups = path.parameters.groups;
    var needToScale;
    for (var index = 0; index < groups.length; index++) {
        // Check settings if it needs to scale
        if (groups[index].incircle) {
            if (misc_1.getType(groups[index].incircle) === "array") {
                // Incircle is an array. Try to scale
                needToScale = true;
                break;
            }
        }
        else {
            needToScale = true;
            break;
        }
    }
    if (!needToScale)
        // Incircle value is true. Cancel scale and return path as it is.
        return path;
    var maxX = 0;
    var minX = 0;
    var maxY = 0;
    var minY = 0;
    path.vertexes.forEach(function (vertex) {
        if (vertex.x > maxX)
            maxX = vertex.x;
        if (vertex.x < minX)
            minX = vertex.x;
        if (vertex.y > maxY)
            maxY = vertex.y;
        if (vertex.y < minY)
            minY = vertex.y;
    });
    var factorX = 2 / (Math.abs(minX) + maxX);
    var factorY = 2 / (Math.abs(minY) + maxY);
    var shiftX = factorX * maxX - 1;
    var shiftY = factorY * maxY - 1;
    path.vertexes = path.vertexes.map(function (vertex, index) {
        var incircleValue = getIncircleValue(groups[vertex.group], vertex.indexWithingGroup);
        if (!incircleValue) {
            vertex.x = vertex.x * factorX - shiftX;
            vertex.y = vertex.y * factorY - shiftY;
        }
        if (vertex.type === "C") {
            var incircleFirstArmValue = getIncircleValue(groups[path.vertexes[index - 1].group], path.vertexes[index - 1].indexWithingGroup);
            if (!incircleFirstArmValue) {
                vertex.x1 = vertex.x1 * factorX - shiftX;
                vertex.y1 = vertex.y1 * factorY - shiftY;
            }
            if (!incircleValue) {
                vertex.x2 = vertex.x2 * factorX - shiftX;
                vertex.y2 = vertex.y2 * factorY - shiftY;
            }
        }
        return vertex;
    });
    return path;
};
exports.default = scaleToOne;
