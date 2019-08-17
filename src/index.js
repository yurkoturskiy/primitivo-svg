"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Layers
var index_1 = __importDefault(require("./path/index"));
var index_2 = __importDefault(require("./morphing/index"));
var index_3 = __importDefault(require("./spacing/index"));
exports.path = function (parameters) { return index_1.default(parameters); };
exports.morphing = function (animateParameters, keyPathsParameters) {
    return index_2.default(animateParameters, keyPathsParameters);
};
exports.spacing = function (parameters) { return index_3.default(parameters); };
