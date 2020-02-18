"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../misc/index");
var defaultParameters_1 = __importDefault(require("./lib/defaultParameters"));
var initState_1 = __importDefault(require("./lib/initState"));
var parseGroupParameter_1 = __importDefault(require("./lib/parseGroupParameter"));
var setFrame_1 = __importDefault(require("./lib/setFrame"));
var generateVertexes_1 = __importDefault(require("./lib/generateVertexes"));
var remapVertexes_1 = __importDefault(require("./lib/remapVertexes"));
var setArms_1 = __importDefault(require("./lib/setArms"));
var scaleToOne_1 = __importDefault(require("./lib/scaleToOne"));
var setCenter_1 = __importDefault(require("./lib/setCenter"));
var setDistance_1 = __importDefault(require("./lib/setDistance"));
// logging
var log = require("loglevel").getLogger("path-log");
/***********
 * Methods *
 ***********/
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
var setPosition = function (path) {
    var parameters = path.parameters;
    var factorX = parameters.centerX / (parameters.width / 2);
    var factorY = parameters.centerY / (parameters.height / 2);
    path.frame.vertexes = path.frame.vertexes.map(function (vertex) {
        vertex.x += factorX;
        vertex.y += factorY;
        return vertex;
    });
    path.vertexes = path.vertexes.map(function (vertex) {
        vertex.x += factorX;
        vertex.y += factorY;
        if (vertex.type === "C") {
            vertex.x1 += factorX;
            vertex.y1 += factorY;
            vertex.x2 += factorX;
            vertex.y2 += factorY;
        }
        return vertex;
    });
    return path;
};
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
var setLength = function (path) {
    log.info("set length");
    var parameters = path.parameters, vertexes = path.vertexes;
    var groups = path.parameters.groups;
    var calcFactor = function (newRadius, radius) {
        if (newRadius === 0 || radius === 0)
            return 0;
        return newRadius / radius;
    };
    path.vertexes = vertexes.map(function (vertex, i) {
        // Calc factor
        var factor = vertex.radius ? calcFactor(vertex.radius, vertex.length) : 1;
        // Set length
        vertex.x = (vertex.x - parameters.centerX) * factor + parameters.centerX;
        vertex.y = (vertex.y - parameters.centerY) * factor + parameters.centerY;
        if (vertex.type === "C") {
            var prevFactor = vertexes[i - 1].radius
                ? calcFactor(vertexes[i - 1].radius, vertexes[i - 1].length)
                : 1;
            vertex.x1 =
                (vertex.x1 - parameters.centerX) * prevFactor + parameters.centerX;
            vertex.y1 =
                (vertex.y1 - parameters.centerY) * prevFactor + parameters.centerY;
            vertex.x2 =
                (vertex.x2 - parameters.centerX) * factor + parameters.centerX;
            vertex.y2 =
                (vertex.y2 - parameters.centerY) * factor + parameters.centerY;
        }
        return vertex;
    });
    log.debug(path);
    return path;
};
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
var shift = function (path) {
    var parameters = path.parameters;
    // Apply x and y position parameters
    var x = parameters.x, y = parameters.y;
    path.vertexes = path.vertexes.map(function (vertex) {
        vertex.x += x;
        vertex.y += y;
        if (vertex.type === "C") {
            vertex.x1 += x;
            vertex.x2 += x;
            vertex.y1 += y;
            vertex.y2 += y;
        }
        return vertex;
    });
    return path;
};
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
/********
 * Root *
 ********/
var pathLayer = function (parameters) {
    if (parameters === void 0) { parameters = defaultParameters_1.default; }
    // Setup defaults
    var path = initState_1.default(parameters);
    // Generate shape
    path = setFrame_1.default(path);
    path = generateVertexes_1.default(path);
    path = remapVertexes_1.default(path); // Add M point
    path = setArms_1.default("init", path);
    path = scaleToOne_1.default(path);
    path = setCenter_1.default(path);
    path = setDistance_1.default(path);
    path = setPosition(path);
    path = setScale(path);
    path = calcLength(path);
    path = setLength(path);
    path = calcLength(path);
    path = recalcRadians(path);
    path = setArms_1.default("adapt", path);
    path = shift(path);
    path = generateD(path);
    return path;
};
exports.default = pathLayer;
