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
var ramda_1 = require("ramda");
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
var setFrameParameters = function (parameters) { return ({
    numOfSegments: parameters.numOfSegments,
    depth: parameters.depth,
    rotate: parameters.rotate,
    group: parameters.groups[0]
}); };
var setNumOfVertexes = function (frame) { return (__assign({}, frame, { numOfVertexes: frame.numOfSegments * Math.pow(2, frame.depth) })); };
var vertexesReducer = function (frame) { return function (acc, vertex, i) {
    var radians;
    radians = frame.group.radians
        ? getRadiansValue(frame.group, i) // curtom radians were provide
        : ((Math.PI * 2) / frame.numOfVertexes) * i;
    // Rotate
    radians = radians + index_1.angleToRad(frame.rotate);
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
}; };
var setVertexes = function (frame) { return (__assign({}, frame, { vertexes: Array(frame.numOfVertexes)
        .fill({})
        .reduce(vertexesReducer(frame), []) })); };
var generateFrame = ramda_1.pipe(setFrameParameters, setNumOfVertexes, setVertexes);
var setFrame = function (path) {
    /*
     * Generate frame which is the base for a path and
     * serve as the base for a 0-group vertexes.
     */
    var frame = generateFrame(path.parameters);
    return __assign({}, path, { frame: frame });
};
exports.default = setFrame;
