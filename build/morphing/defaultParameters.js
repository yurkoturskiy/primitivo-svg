"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultParameters = {
    parameters: {
        loop: "circle",
        numOfKeyPaths: 3
    },
    keyPathsParameters: {
        numOfSegments: 3,
        depth: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        centerX: 100,
        centerY: 100,
        rotate: 0,
        groups: [
            {
                type: "radial",
                incircle: true,
                distance: [0.95, 1],
                round: 1
            },
            {
                type: "radial",
                incircle: true,
                distance: [1.3, 1.4],
                round: [0, 0.3]
            }
        ]
    }
};
exports.default = defaultParameters;
