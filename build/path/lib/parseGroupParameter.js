"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../misc/index");
var parseGroupParameter = function (parameter, vertexIndex) {
    /* Parse distance, round, or radius group parameters */
    // Number for all
    if (typeof parameter !== "object")
        return parameter;
    // Random for all
    if (typeof parameter === "object" && parameter.length === 2)
        return index_1.randomRange(parameter[0], parameter[1]);
    // Distance per vertex
    if (typeof parameter === "object") {
        parameter = parameter[vertexIndex];
        // Number
        if (typeof parameter !== "object")
            return parameter;
        // Random range
        if (typeof parameter === "object" && parameter.length === 2)
            return index_1.randomRange(parameter[0], parameter[1]);
    }
    return parameter;
};
exports.default = parseGroupParameter;
