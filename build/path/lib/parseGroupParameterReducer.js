"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parseGroupParameterReducer = function (key, value, vertexIndex) {
    switch (key) {
        case "round":
            if (typeof value === "object" && value.length > 2)
                value = value[vertexIndex];
            if (typeof value === "number")
                value = [value, value];
            break;
        default:
            // code...
            break;
    }
    return value;
};
exports.default = parseGroupParameterReducer;
