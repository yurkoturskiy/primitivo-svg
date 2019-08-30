"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Layers
var index_1 = __importDefault(require("./path/index"));
var index_2 = __importDefault(require("./morphing/index"));
var index_3 = __importDefault(require("./spacing/index"));
var index_4 = __importDefault(require("./phases/index"));
var log = __importStar(require("loglevel"));
log.setLevel("warn");
exports.path = function (parameters) { return index_1.default(parameters); };
exports.morphing = function (animateParameters, keyPathsParameters) {
    return index_2.default(animateParameters, keyPathsParameters);
};
exports.spacing = function (parameters) { return index_3.default(parameters); };
exports.phases = function (parameters) { return index_4.default(parameters); };
