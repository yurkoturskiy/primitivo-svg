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
var radiansDelta = function (a, b) {
    var delta = Math.abs(a - b);
    if (delta > Math.PI)
        delta = 2 * Math.PI - delta;
    return delta;
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
        var radians = void 0;
        // If custom radians were provided
        if (groups[0].radians)
            radians = groups[0].radians[i];
        // Generate own if not
        else
            radians = ((Math.PI * 2) / numOfVertexes) * i;
        // Rotate
        radians = radians + angleToRad(rotate);
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
var generateLinearVertexCoordinates = function (vertexes, vertex, prevVertex, nextVertex) {
    // Calc X Y coords
    vertex.x = prevVertex.x - nextVertex.x; // Substract adjacent points to get x
    vertex.x *= 0.5; // Make x twice closer to center
    vertex.x += nextVertex.x; // Position x inbetween of adjacent points
    vertex.y = prevVertex.y - nextVertex.y; // Make the same with Y
    vertex.y *= 0.5;
    vertex.y += nextVertex.y;
    vertex.radians = Math.atan2(vertex.y, vertex.x);
    vertex.angle = radToAngle(vertex.radians);
    return vertex;
};
var generateRadialVertexCoordinates = function (vertexes, vertex, prevVertex, nextVertex) {
    var radiansStep = radiansDelta(prevVertex.radians, nextVertex.radians) / 2;
    vertex.radians = prevVertex.radians + radiansStep;
    vertex.cosx = round(Math.cos(vertex.radians));
    vertex.siny = round(Math.sin(vertex.radians));
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
            switch (groups[groupIndex].type) {
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
        return vertex;
    });
    log.debug(path);
    return path;
};
var calcRadians = function (path) {
    log.info("calculate radians");
    var vertexes = path.vertexes;
    var _a = path.parameters, centerX = _a.centerX, centerY = _a.centerY;
    path.vertexes = vertexes.map(function (vertex) {
        var deltaX = vertex.x - centerX;
        var deltaY = centerY - vertex.y;
        vertex.radians = Math.atan2(deltaY, deltaX);
        vertex.angle = radToAngle(vertex.radians);
        return vertex;
    });
    return path;
};
var setControlPoints = function (path) {
    var vertexes = path.vertexes;
    var groups = path.parameters.groups;
    var numOfPoints = vertexes.length - 1; // Minus "M" vertex
    var firstArmFactors = [];
    var secondArmFactors = [];
    for (var i = 1; i < vertexes.length; i++) {
        // Set arms length
        var firstArmLength = void 0, secondArmLength = void 0;
        var firstArmSmartRound = groups[vertexes[i - 1].group].smartRound;
        var secondArmSmartRound = groups[vertexes[i].group].smartRound;
        var individualFactor = void 0;
        if (firstArmSmartRound || secondArmSmartRound) {
            var distanceRadians = radiansDelta(vertexes[i - 1].radians, vertexes[i].radians);
            individualFactor = (2 * Math.PI) / distanceRadians;
        }
        var firstArmFactor = firstArmSmartRound ? individualFactor : numOfPoints;
        var secondArmFactor = secondArmSmartRound ? individualFactor : numOfPoints;
        firstArmLength = (4 / 3) * Math.tan(Math.PI / (2 * firstArmFactor));
        firstArmLength *= vertexes[i - 1].length;
        secondArmLength = (4 / 3) * Math.tan(Math.PI / (2 * secondArmFactor));
        secondArmLength *= vertexes[i].length;
        firstArmLength *= vertexes[i - 1].round;
        secondArmLength *= vertexes[i].round;
        // Set arms angle
        var firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
        var firstArmAngle = radToAngle(firstArmRadians);
        log.debug("first arm angle", firstArmAngle);
        var secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
        var secondArmAngle = radToAngle(secondArmRadians);
        log.debug("second arm angle", secondArmAngle);
        // Set cos
        var cosx1 = round(Math.cos(firstArmRadians)) * -1;
        var cosx2 = round(Math.cos(secondArmRadians)) * -1;
        // Set sin
        var siny1 = round(Math.sin(firstArmRadians));
        var siny2 = round(Math.sin(secondArmRadians));
        // Set coordinates
        var x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
        var x2 = cosx2 * secondArmLength + vertexes[i].x;
        var y1 = siny1 * firstArmLength + vertexes[i - 1].y;
        var y2 = siny2 * secondArmLength + vertexes[i].y;
        log.debug("vertex " + i + " first arm x: " + x1 + " y: " + y1);
        log.debug("vertex " + i + " second arm x: " + x2 + " y: " + y2);
        vertexes[i] = __assign({}, vertexes[i], { x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            cosx1: cosx1,
            cosx2: cosx2,
            siny1: siny1,
            siny2: siny2 });
    }
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
    if (!parameters.incircle)
        path = scaleToOne(path);
    path = setCenter(path);
    path = setDistance(path);
    path = setPosition(path);
    path = setScale(path);
    path = calcLength(path);
    path = setLength(path);
    path = calcLength(path);
    path = calcRadians(path);
    path = setControlPoints(path);
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
            type: "linear",
            round: 0.5,
            distance: 1,
            smartRound: false,
            preserveRadians: false
        }
    ]
};
exports.default = generateShape;
