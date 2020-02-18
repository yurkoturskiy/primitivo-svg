"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
var setPosition_1 = __importDefault(require("./lib/setPosition"));
var setScale_1 = __importDefault(require("./lib/setScale"));
var calcLength_1 = __importDefault(require("./lib/calcLength"));
var setLength_1 = __importDefault(require("./lib/setLength"));
var recalcRadians_1 = __importDefault(require("./lib/recalcRadians"));
var shift_1 = __importDefault(require("./lib/shift"));
var generateD_1 = __importDefault(require("./lib/generateD"));
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
    path = setPosition_1.default(path);
    path = setScale_1.default(path);
    path = calcLength_1.default(path);
    path = setLength_1.default(path);
    path = calcLength_1.default(path);
    path = recalcRadians_1.default(path);
    path = setArms_1.default("adapt", path);
    path = shift_1.default(path);
    path = generateD_1.default(path);
    return path;
};
exports.default = pathLayer;
