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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../misc/index");
var parseGroupParameter_1 = __importDefault(require("./parseGroupParameter"));
var calcNumOfVertexes = function (numOfSegments, depth) {
    return numOfSegments * Math.pow(2, depth);
};
var getRadiansValue = function (group, vertexIndex) {
    var parameter = group.radians;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "number")
        throw "Wrong 'radians' parameter in group number " + group.pk;
    else
        return parameter;
};
var generateFrame = function (path) {
    /*
     * Generate frame which is the base for a path and
     * serve as the base for a 0-group vertexes.
     */
    var _a = path.parameters, depth = _a.depth, rotate = _a.rotate, numOfSegments = _a.numOfSegments, groups = _a.groups;
    var numOfVertexes = calcNumOfVertexes(numOfSegments, depth);
    // var vertexes = [];
    var vertexes = Array(numOfVertexes)
        .fill({})
        .reduce(function (acc, vertex, i) {
        var radians;
        radians = groups[0].radians
            ? getRadiansValue(groups[0], i) // curtom radians were provide
            : ((Math.PI * 2) / numOfVertexes) * i;
        // Rotate
        radians = radians + index_1.angleToRad(rotate);
        var angle = index_1.radToAngle(radians);
        var cosx = index_1.round(Math.cos(radians));
        var siny = index_1.round(Math.sin(radians));
        var x = cosx;
        var y = siny;
        return acc.concat([
            {
                cosx: cosx,
                siny: siny,
                x: x,
                y: y,
                radians: radians,
                angle: angle
            }
        ]);
    }, []);
    return __assign({}, path, { frame: {
            vertexes: vertexes,
            numOfVertexes: vertexes.length
        } });
};
exports.default = generateFrame;
