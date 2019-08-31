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
var numOfSegments = 4;
var x = 0;
var y = 0;
var width = window.innerWidth;
var height = window.innerHeight;
var centerX = 200;
var centerY = 100;
var rotate = 45;
var startPath = {
    numOfSegments: numOfSegments,
    x: x,
    y: y,
    width: width,
    height: height,
    centerX: centerX,
    centerY: centerY,
    rotate: rotate,
    incircle: true,
    groups: [
        {
            radius: 8,
            round: 1,
            adaptArms: true,
            smartRound: true
        },
        {
            type: "radial",
            radius: 8,
            round: 1,
            adaptArms: true,
            smartRound: true
        }
    ]
};
var endPath = {
    numOfSegments: numOfSegments,
    x: x,
    y: y,
    width: width,
    height: height,
    centerX: centerX,
    centerY: centerY,
    rotate: rotate,
    incircle: false,
    groups: [
        {
            distance: 1,
            round: 0,
            adaptArms: true
        },
        {
            type: "linear",
            distance: 1,
            round: 1,
            adaptArms: false
        }
    ]
};
///////////////
// Phase one //
///////////////
var phaseOne = {
    duration: 0,
    parameters: {
        numOfSegments: function () { return numOfSegments; },
        x: function () { return x; },
        y: function () { return y; },
        width: function () { return width; },
        height: function () { return height; },
        centerX: function () { return centerX; },
        centerY: function () { return centerY; },
        rotate: function () { return rotate; },
        incircle: function () { return true; },
        groups: function () { return [
            {
                type: function () { return "radial"; },
                radius: function () { return 10; },
                round: function () { return 0; }
            },
            {
                type: function () { return "linear"; },
                radius: function () { return 10; },
                round: function () { return 1; }
            }
        ]; }
    }
};
var phaseTwo = {
    duration: 0.1,
    parameters: {
        numOfSegments: function () { return numOfSegments; },
        x: function () { return x; },
        y: function () { return y; },
        width: function () { return width; },
        height: function () { return height; },
        centerX: function () { return centerX; },
        centerY: function () { return centerY; },
        rotate: function () { return rotate; },
        incircle: function () { return true; },
        groups: function () { return [
            {
                type: function () { return "radial"; },
                radius: function () { return 40; },
                round: function () { return 0; }
            },
            {
                type: function () { return "linear"; },
                radius: function () { return 40; },
                round: function () { return 1; }
            }
        ]; }
    }
};
var phaseThree = {
    duration: 0.6,
    parameters: {
        numOfSegments: function () { return numOfSegments; },
        x: function () { return x; },
        y: function () { return y; },
        width: function () { return width; },
        height: function () { return height; },
        centerX: function () { return centerX; },
        centerY: function () { return centerY; },
        rotate: function () { return rotate; },
        incircle: function () { return true; },
        groups: function () { return [
            {
                type: function () { return "radial"; },
                distance: function () { return 1; },
                round: function () { return 0; }
            },
            {
                type: function () { return "linear"; },
                distance: function () { return 1; },
                round: function () { return 1; }
            }
        ]; }
    }
};
exports.default = {
    startPath: startPath,
    endPath: endPath,
    phases: [__assign({}, phaseOne), __assign({}, phaseTwo), __assign({}, phaseThree)]
};
