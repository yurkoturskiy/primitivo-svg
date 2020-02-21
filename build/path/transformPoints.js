"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
// Methods
var setArms_1 = __importDefault(require("./lib/setArms"));
var scaleToOne_1 = __importDefault(require("./lib/scaleToOne"));
var setCenter_1 = __importDefault(require("./lib/setCenter"));
var setDistance_1 = __importDefault(require("./lib/setDistance"));
var setPosition_1 = __importDefault(require("./lib/setPosition"));
var setScale_1 = __importDefault(require("./lib/setScale"));
var setLength_1 = __importDefault(require("./lib/setLength"));
var recalcRadians_1 = __importDefault(require("./lib/recalcRadians"));
var shift_1 = __importDefault(require("./lib/shift"));
var transformPoints = function (path) {
    return pipeable_1.pipe(scaleToOne_1.default(path), setCenter_1.default, setDistance_1.default, setPosition_1.default, setScale_1.default, setLength_1.default, recalcRadians_1.default, setArms_1.default("adapt"), shift_1.default);
};
exports.default = transformPoints;
