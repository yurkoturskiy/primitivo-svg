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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var log = __importStar(require("loglevel"));
var round = function (number) { return Math.round(number * 1e6) / 1e6; };
var radToAngle = function (rad) { return (rad * 180) / Math.PI; };
var angleToRad = function (angle) { return (angle * Math.PI) / 180; };
var randomFromRange = function (min, max) {
    return Math.random() * (max - min) + min;
};
/***********
 * Methods *
 ***********/
var setDefaults = function (path) {
    defaultParameters.numOfGroups = path.parameters.groups.length; // Set num of groups if not exist
    path.parameters = __assign({}, defaultParameters, path.parameters);
    path.parameters.groups = path.parameters.groups.map(function (group) { return (__assign({}, defaultParameters.groups[0], group)); });
    return path;
};
var generateFrame = function (path) {
    /*
     * Generate frame which is the base for a path and
     * serve as the base for a 0-group vertexes.
     */
    var _a = path.parameters, depth = _a.depth, rotate = _a.rotate, numOfSegments = _a.numOfSegments, groups = _a.groups;
    var numOfVertexes = numOfSegments * Math.pow(2, depth);
    var vertexes = [];
    for (var i = 0; i < numOfVertexes; i++) {
        var radians = ((Math.PI * 2) / numOfVertexes) * i;
        radians += angleToRad(rotate);
        var angle = radToAngle(radians);
        var cosx = round(Math.cos(radians));
        var siny = round(Math.sin(radians));
        var x = cosx;
        var y = siny;
        vertexes[i] = {
            cosx: cosx,
            siny: siny,
            x: x,
            y: y,
            radians: radians,
            angle: angle
        };
    }
    path.frame = {
        vertexes: vertexes,
        numOfVertexes: vertexes.length
    };
    return path;
};
var parseGroupParameter = function (parameter, group, vertexIndex) {
    /* Parse distance, round, or radius group parameters */
    // Number for all
    if (typeof parameter === "number")
        return parameter;
    // Random for all
    if (typeof parameter === "object" && parameter.length === 2)
        return randomFromRange(parameter[0], parameter[1]);
    // Distance per vertex
    if (typeof parameter === "object") {
        parameter = parameter[vertexIndex];
        // Number
        if (typeof parameter === "number")
            return parameter;
        // Random range
        if (typeof parameter === "object" && parameter.length === 2)
            return randomFromRange(parameter[0], parameter[1]);
    }
    return parameter;
};
var getRoundValue = function (group, vertexIndex) {
    /* Get round value for a vertex from given group parameters */
    var parameter = group.round;
    parameter = parseGroupParameter(parameter, group, vertexIndex);
    if (typeof parameter !== "number")
        throw "Wrong 'round' parameters in group number " + group.pk;
    else
        return parameter;
};
var getDistanceValue = function (group, vertexIndex) {
    /* Get distance value for a vertex from given group parameters */
    var parameter = group.distance;
    parameter = parseGroupParameter(parameter, group, vertexIndex);
    if (typeof parameter !== "number")
        throw "Wrong 'distance' parameters in group number " + group.pk;
    else
        return parameter;
};
var getRadiusValue = function (group, vertexIndex) {
    /* Get radius value for a vertex from given group parameters */
    var parameter = group.radius;
    parameter = parseGroupParameter(parameter, group, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "number")
        throw "Wrong 'radius' parameters in group number " + group.pk;
    else
        return parameter;
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
    var vertexes = frame.vertexes.map(function (vertex, index) { return (__assign({}, vertex, { type: "C", group: 0, round: getRoundValue(groups[0], index), distance: getDistanceValue(groups[0], index), radius: getRadiusValue(groups[0], index) })); });
    for (var groupIndex = 1; groupIndex < numOfGroups; groupIndex++) {
        log.debug("group number", groupIndex);
        var numOfNewVertexes = vertexes.length;
        log.debug("number of vertexes", numOfNewVertexes);
        groups[groupIndex].numOfVertexes = numOfNewVertexes;
        groups[groupIndex].pk = groupIndex;
        for (var i = 1; i < numOfNewVertexes * 2; i += 2) {
            var protoVertex = {
                type: "C",
                groupIndex: groupIndex
            };
            vertexes.splice(i, 0, protoVertex); // Inser proto vertex in array
            var lastIndex = vertexes.length - 1;
            var prevVertexInd = i - 1;
            var nextVertexInd = i + 1;
            if (nextVertexInd > lastIndex)
                nextVertexInd = 0;
            // Calc X Y coords
            vertexes[i].x = vertexes[prevVertexInd].x - vertexes[nextVertexInd].x; // Substract adjacent points to get x
            vertexes[i].x *= 0.5; // Make x twice closer to center
            vertexes[i].x += vertexes[nextVertexInd].x; // Position x inbetween of adjacent points
            vertexes[i].y = vertexes[prevVertexInd].y - vertexes[nextVertexInd].y; // Make the same with Y
            vertexes[i].y *= 0.5;
            vertexes[i].y += vertexes[nextVertexInd].y;
            vertexes[i].radians = Math.atan2(vertexes[i].y, vertexes[i].x);
            // Set distance, round, and radius values per vertex
            var indexWithingGroup = (i - 1) / 2;
            log.debug("vertex index withing a group", indexWithingGroup);
            vertexes[i].distance = getDistanceValue(groups[groupIndex], indexWithingGroup);
            vertexes[i].round = getRoundValue(groups[groupIndex], indexWithingGroup);
            vertexes[i].radius = getRadiusValue(groups[groupIndex], indexWithingGroup);
        }
    }
    path.vertexes = vertexes;
    return path;
};
var remapVertexes = function (vertexes) {
    /*
     * Add "M" vertex to the array at the start
     * Move first vertex to the end
     */
    var newArray = [];
    vertexes[vertexes.length] = vertexes[0];
    vertexes[0] = __assign({}, vertexes[0], { type: "M" });
    return vertexes;
};
var setControlPoints = function (vertexes, groups) {
    var numOfPoints = vertexes.length - 1; // Minus "M" vertex
    var firstArmFactors = [];
    var secondArmFactors = [];
    for (var i = 1; i < vertexes.length; i++) {
        // Set arms length
        var firstArmLength = void 0, secondArmLength = void 0;
        firstArmLength = secondArmLength =
            (4 / 3) * Math.tan(Math.PI / (2 * numOfPoints));
        firstArmLength *= vertexes[i - 1].round;
        secondArmLength *= vertexes[i].round;
        // Set arms angle
        var firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
        var firstArmAngle = radToAngle(firstArmRadians);
        var secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
        var secondArmAngle = radToAngle(secondArmRadians);
        // Set cos
        var cosx1 = round(Math.cos(firstArmRadians));
        var cosx2 = round(Math.cos(secondArmRadians));
        // Set sin
        var siny1 = round(Math.sin(firstArmRadians));
        var siny2 = round(Math.sin(secondArmRadians));
        // Set coordinates
        var x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
        var x2 = cosx2 * secondArmLength + vertexes[i].x;
        var y1 = siny1 * firstArmLength + vertexes[i - 1].y;
        var y2 = siny2 * secondArmLength + vertexes[i].y;
        vertexes[i] = __assign({}, vertexes[i], { x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            cosx1: cosx1,
            cosx2: cosx2,
            siny1: siny1,
            siny2: siny2 });
    }
    return vertexes;
};
var scaleToOne = function (path) {
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
    path.vertexes = path.vertexes.map(function (vertex) {
        vertex.x = vertex.x * factorX - shiftX;
        vertex.y = vertex.y * factorY - shiftY;
        if (vertex.type === "C") {
            vertex.x1 = vertex.x1 * factorX - shiftX;
            vertex.x2 = vertex.x2 * factorX - shiftX;
            vertex.y1 = vertex.y1 * factorY - shiftY;
            vertex.y2 = vertex.y2 * factorY - shiftY;
        }
        return vertex;
    });
    return path;
};
var setCenter = function (path) {
    var parameters = path.parameters;
    var factorX = 1 - parameters.centerX / (parameters.width / 2);
    var factorY = 1 - parameters.centerY / (parameters.height / 2);
    path.vertexes = path.vertexes.map(function (vertex) {
        vertex.x += factorX;
        vertex.y += factorY;
        if (vertex.type === "C") {
            vertex.x1 += factorX;
            vertex.x2 += factorX;
            vertex.y1 += factorY;
            vertex.y2 += factorY;
        }
        return vertex;
    });
    return path;
};
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
    path.vertexes = path.vertexes.map(function (vertex) {
        var x = vertex.x - parameters.centerX;
        var y = vertex.y - parameters.centerY;
        vertex.length = Math.sqrt(x * x + y * y);
        return vertex;
    });
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
        var group = groups[vertex.group];
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
var setKeyframes = function (path) {
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
    var svgPathData = "";
    path.vertexes.forEach(function (vertex, i) {
        svgPathData += "\n\n" + vertex.d;
    });
    svgPathData += "\n\nZ";
    path.svgPathData = svgPathData;
    return path;
};
var generateSVGPathData = function (path) {
    var array = [];
    path.vertexes.forEach(function (vertex, index) {
        if (index === 0) {
            array[path.vertexes.length] = vertex;
        }
    });
    path.svgPathData;
    return path;
};
/********
 * Root *
 ********/
var generateShape = function (parameters) {
    if (parameters === void 0) { parameters = defaultParameters; }
    // Setup defaults
    var path = { parameters: parameters };
    path = setDefaults(path);
    // Generate shape
    path = generateFrame(path);
    path = generateVertexes(path);
    path.vertexes = remapVertexes(path.vertexes); // Add M point
    path.vertexes = setControlPoints(path.vertexes, path.parameters.groups);
    if (!parameters.incircle)
        path = scaleToOne(path);
    path = setCenter(path);
    path = setDistance(path);
    path = setPosition(path);
    path = setScale(path);
    path = calcLength(path);
    path = setLength(path);
    path = setKeyframes(path);
    path = shift(path);
    path = generateD(path);
    return path;
};
var defaultParameters = {
    numOfSegments: 4,
    depth: 0,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    centerX: 50,
    centerY: 50,
    rotate: 0,
    numOfGroups: 1,
    incircle: false,
    groups: [
        {
            round: 0.5,
            distance: 1
        }
    ]
};
exports.default = generateShape;
