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
var startPath = {
    numOfSegments: 4,
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerWidth,
    centerX: 200,
    centerY: 100,
    rotate: 45,
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
    numOfSegments: 4,
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    centerX: 200,
    centerY: 100,
    rotate: 45,
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
var phaseOne = {
    duration: 0,
    parameters: {
        numOfSegments: function () { return 4; },
        x: function () { return 0; },
        y: function () { return 0; },
        width: function () { return 400; },
        height: function () { return 400; },
        centerX: function () { return 200; },
        centerY: function () { return 200; },
        rotate: function () { return 0; },
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
        numOfSegments: function () { return 4; },
        x: function () { return 0; },
        y: function () { return 0; },
        width: function () { return 400; },
        height: function () { return 400; },
        centerX: function () { return 200; },
        centerY: function () { return 200; },
        rotate: function () { return 0; },
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
        numOfSegments: function () { return 4; },
        x: function () { return 0; },
        y: function () { return 0; },
        width: function () { return 400; },
        height: function () { return 400; },
        centerX: function () { return 200; },
        centerY: function () { return 200; },
        rotate: function () { return 0; },
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
