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
var parseGroupParameterReducer_1 = __importDefault(require("./parseGroupParameterReducer"));
var parseGroupParameter_1 = __importDefault(require("./parseGroupParameter"));
var misc_1 = require("../../misc");
// Logging
var log = require("loglevel").getLogger("path-log");
var getRoundValue = function (group, vertexIndex) {
    /* Get round value for a vertex from given group parameters */
    var value = group.round;
    value = parseGroupParameterReducer_1.default("round", value, vertexIndex);
    if (typeof value !== "object" || value.length !== 2)
        throw "Wrong 'round' value in group number " + group.pk + ". Round: " + value;
    else
        return value;
};
var getDistanceValue = function (group, vertexIndex) {
    /* Get distance value for a vertex from given group parameters */
    var parameter = group.distance;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (typeof parameter !== "number")
        throw "Wrong 'distance' parameters in group number " + group.pk;
    else
        return parameter;
};
var getRadiusValue = function (group, vertexIndex) {
    /* Get radius value for a vertex from given group parameters */
    var parameter = group.radius;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "number")
        throw "Wrong 'radius' parameters in group number " + group.pk;
    else
        return parameter;
};
var generateLinearVertexCoordinates = function (vertexes, vertex, prevVertex, nextVertex) {
    // Calc X Y coords
    vertex.x = prevVertex.x - nextVertex.x; // Substract adjacent points to get x
    vertex.x *= 0.5; // Make x twice closer to center
    vertex.x += nextVertex.x; // Position x inbetween of adjacent points
    vertex.y = prevVertex.y - nextVertex.y; // Make the same with Y
    vertex.y *= 0.5;
    vertex.y += nextVertex.y;
    vertex.radians = Math.atan2(vertex.y, vertex.x);
    vertex.angle = misc_1.radToAngle(vertex.radians);
    return vertex;
};
var getTypeValue = function (group, vertexIndex) {
    var parameter = group.type;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "string")
        throw "Wrong 'type' parameter in group number " + group.pk;
    else
        return parameter;
};
var generateRadialVertexCoordinates = function (vertexes, vertex, prevVertex, nextVertex) {
    var radiansStep = misc_1.radiansDelta(nextVertex.radians, prevVertex.radians) / 2;
    vertex.radians = prevVertex.radians + radiansStep;
    vertex.cosx = misc_1.round(Math.cos(vertex.radians));
    vertex.siny = misc_1.round(Math.sin(vertex.radians));
    vertex.x = vertex.cosx;
    vertex.y = vertex.siny;
    return vertex;
};
var generateVertexes = function (path) {
    log.info("generate vertexes");
    var frame = path.frame;
    var _a = path.parameters, numOfGroups = _a.numOfGroups, numOfSegments = _a.numOfSegments, groups = _a.groups;
    var subdivisionDepth = numOfGroups - 1;
    var numOfPoints = numOfSegments * Math.pow(2, subdivisionDepth);
    var numOfVertexesPerSide = numOfPoints / frame.numOfVertexes;
    // Init root group from frame vertexes
    groups[0].numOfVertexes = frame.numOfVertexes;
    groups[0].pk = 0;
    var vertexes = frame.vertexes.map(function (vertex, index) { return (__assign({}, vertex, { type: "C", indexWithingGroup: index, group: 0, round: getRoundValue(groups[0], index), distance: getDistanceValue(groups[0], index), radius: getRadiusValue(groups[0], index) })); });
    for (var groupIndex = 1; groupIndex < numOfGroups; groupIndex++) {
        log.debug("group number", groupIndex);
        var numOfNewVertexes = vertexes.length;
        log.debug("number of vertexes", numOfNewVertexes);
        groups[groupIndex].numOfVertexes = numOfNewVertexes;
        groups[groupIndex].pk = groupIndex;
        for (var i = 1; i < numOfNewVertexes * 2; i += 2) {
            var indexWithingGroup = (i - 1) / 2;
            var protoVertex = {
                type: "C",
                group: groupIndex
            };
            vertexes.splice(i, 0, protoVertex); // Inser proto vertex in array
            var lastIndex = vertexes.length - 1;
            var prevVertexInd = i - 1;
            var nextVertexInd = i + 1;
            if (nextVertexInd > lastIndex)
                nextVertexInd = 0;
            var vertex = vertexes[i];
            var prevVertex = vertexes[prevVertexInd];
            var nextVertex = vertexes[nextVertexInd];
            var vertexType = getTypeValue(groups[groupIndex], indexWithingGroup);
            switch (vertexType) {
                case "linear":
                    vertex = generateLinearVertexCoordinates(vertexes, vertex, prevVertex, nextVertex);
                    break;
                case "radial":
                    vertex = generateRadialVertexCoordinates(vertexes, vertex, prevVertex, nextVertex);
                    break;
                default:
                    throw "Type for group " + groupIndex + " seems to be wrong.";
                    break;
            }
            // Set distance, round, and radius values per vertex
            log.debug("vertex index withing a group", indexWithingGroup);
            vertexes[i].distance = getDistanceValue(groups[groupIndex], indexWithingGroup);
            vertexes[i].round = getRoundValue(groups[groupIndex], indexWithingGroup);
            vertexes[i].radius = getRadiusValue(groups[groupIndex], indexWithingGroup);
            vertexes[i].indexWithingGroup = indexWithingGroup;
        }
    }
    path.vertexes = vertexes;
    return path;
};
exports.default = generateVertexes;
