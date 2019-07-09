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
var round = function (number) { return Math.round(number * 1e6) / 1e6; };
var radToAngle = function (rad) { return (rad * 180) / Math.PI; };
var angleToRad = function (angle) { return (angle * Math.PI) / 180; };
exports.generateFrame = function (parameters) {
    var depthOfVertexes = parameters.depthOfVertexes, angleRotation = parameters.angleRotation;
    var numOfVertexes = 4 * Math.pow(2, depthOfVertexes);
    var vertexes = [];
    for (var i = 0; i < numOfVertexes; i++) {
        var radians = ((Math.PI * 2) / numOfVertexes) * i;
        radians += angleToRad(angleRotation);
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
    var frameObj = {
        vertexes: vertexes,
        numOfVertexes: vertexes.length
    };
    return frameObj;
};
var scaleToOne = function (path) {
    var maxX = 0;
    var maxY = 0;
    path.vertexes.forEach(function (vertex) {
        if (vertex.x > maxX)
            maxX = vertex.x;
        if (vertex.y > maxY)
            maxY = vertex.y;
    });
    var factorX = 1 / maxX;
    var factorY = 1 / maxY;
    path.vertexes = path.vertexes.map(function (vertex) {
        vertex.x *= factorX;
        vertex.y *= factorY;
        if (vertex.type === "C") {
            vertex.x1 *= factorX;
            vertex.x2 *= factorX;
            vertex.y1 *= factorY;
            vertex.y2 *= factorY;
        }
        return vertex;
    });
    return path;
};
exports.generateVertexes = function (frame, groups) {
    var subdivisionDepth = groups.length - 1;
    var numOfPoints = 4 * Math.pow(2, subdivisionDepth);
    var numOfGroups = groups.length;
    var numOfVertexesPerSide = numOfPoints / frame.numOfVertexes;
    // Init root group from frame vertexes
    var vertexes = frame.vertexes.map(function (vertex) { return (__assign({}, vertex, { type: "C", group: 0 })); });
    for (var group = 1; group < numOfGroups; group++) {
        var numOfNewVertexes = vertexes.length;
        for (var i = 1; i < numOfNewVertexes * 2; i += 2) {
            var protoVertex = {
                type: "C",
                group: group
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
        }
    }
    return vertexes;
    // Create vertexes
    // for (let i = 0; i < numOfPoints; i++) {
    //   let side = i / numOfVertexesPerSide - ((i / numOfVertexesPerSide) % 1) + 1;
    //   let group = i / numOfVertexesPerSide;
    //   let indexPerSide = i % numOfVertexesPerSide;
    //   group = indexPerSide;
    //   let ratioOfVertexCornerIndexes = i / numOfVertexesPerSide;
    //   let moduloOfRatio = ratioOfVertexCornerIndexes % 1;
    //   console.log(moduloOfRatio);
    //   let startFrameVertexIndex = ratioOfVertexCornerIndexes - moduloOfRatio;
    //   let lastIndexOfCornersArray = frame.numOfVertexes;
    //   let endFrameVertexIndex =
    //     startFrameVertexIndex +
    //     1 -
    //     ((startFrameVertexIndex + 1) / lastIndexOfCornersArray -
    //       (((startFrameVertexIndex + 1) / lastIndexOfCornersArray) % 1)) *
    //       lastIndexOfCornersArray;
    //   let xBorderVector =
    //     frame.vertexes[startFrameVertexIndex].x -
    //     frame.vertexes[endFrameVertexIndex].x;
    //   let yBorderVector =
    //     frame.vertexes[startFrameVertexIndex].y -
    //     frame.vertexes[endFrameVertexIndex].y;
    //   let xVertexDistance = xBorderVector - xBorderVector * moduloOfRatio;
    //   let yVertexDistance = yBorderVector - yBorderVector * moduloOfRatio;
    //   console.log("end frame index", endFrameVertexIndex);
    //   let x = xVertexDistance + frame.vertexes[endFrameVertexIndex].x;
    //   let y = yVertexDistance + frame.vertexes[endFrameVertexIndex].y;
    //   console.log(`${i}, group: ${group}, side: ${side} pos: ${x},${y}`);
    //   // console.log(i, "lenth of border", xBorderVector, yBorderVector);
    //   // console.log(i, "vertex distance", xVertexDistance, yVertexDistance);
    //   // console.log(i, "startCornerIndex", startCornerIndex);
    //   // console.log(i, "end corner index", endCornerIndex);
    //   // console.log(i, "modulo ratio", moduloOfRatio);
    // }
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
    for (var i = 1; i < vertexes.length; i++) {
        var firstArmLength = void 0, secondArmLength = void 0;
        firstArmLength = secondArmLength =
            (4 / 3) * Math.tan(Math.PI / (2 * numOfPoints));
        firstArmLength *= groups[vertexes[i - 1].group].rounding;
        secondArmLength *= groups[vertexes[i].group].rounding;
        var firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
        var firstArmAngle = radToAngle(firstArmRadians);
        var secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
        var secondArmAngle = radToAngle(secondArmRadians);
        var cosx1 = round(Math.cos(firstArmRadians));
        var cosx2 = round(Math.cos(secondArmRadians));
        var siny1 = round(Math.sin(firstArmRadians));
        var siny2 = round(Math.sin(secondArmRadians));
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
var setCenter = function (frameParams, path) {
    var factorX = 1 - frameParams.centerX / (frameParams.width / 2);
    var factorY = 1 - frameParams.centerY / (frameParams.height / 2);
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
    var vertexes = path.vertexes, groups = path.groups;
    path.vertexes = path.vertexes.map(function (vertex, i) {
        vertex.x *= groups[vertex.group].distanceFromCenter;
        vertex.y *= groups[vertex.group].distanceFromCenter;
        if (vertex.type === "C") {
            vertex.x1 *= groups[vertexes[i - 1].group].distanceFromCenter;
            vertex.y1 *= groups[vertexes[i - 1].group].distanceFromCenter;
            vertex.x2 *= groups[vertex.group].distanceFromCenter;
            vertex.y2 *= groups[vertex.group].distanceFromCenter;
        }
        return vertex;
    });
    return path;
};
var setPosition = function (frameParams, path) {
    var factorX = frameParams.centerX / (frameParams.width / 2);
    var factorY = frameParams.centerY / (frameParams.height / 2);
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
var setScale = function (path, frameParams) {
    path.frame.vertexes = path.frame.vertexes.map(function (vertex) {
        vertex.x *= frameParams.width / 2;
        vertex.y *= frameParams.height / 2;
        return vertex;
    });
    path.vertexes = path.vertexes.map(function (vertex) {
        vertex.x *= frameParams.width / 2;
        vertex.y *= frameParams.height / 2;
        if (vertex.type === "C") {
            vertex.x1 *= frameParams.width / 2;
            vertex.y1 *= frameParams.height / 2;
            vertex.x2 *= frameParams.width / 2;
            vertex.y2 *= frameParams.height / 2;
        }
        return vertex;
    });
    return path;
};
var shift = function (path, frameParams) {
    var x = frameParams.x, y = frameParams.y;
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
var generateShape = function (frameParams, groups) {
    var frame = exports.generateFrame(frameParams);
    // frame.vertexes = scaleToOne(frame.vertexes);
    var vertexes = exports.generateVertexes(frame, groups);
    vertexes = remapVertexes(vertexes);
    vertexes = setControlPoints(vertexes, groups);
    var path = { frame: frame, vertexes: vertexes, groups: groups };
    path = scaleToOne(path);
    path = setCenter(frameParams, path);
    path = setDistance(path);
    path = setPosition(frameParams, path);
    path = setScale(path, frameParams);
    path = shift(path, frameParams);
    path = generateD(path);
    return path;
};
exports.default = generateShape;
