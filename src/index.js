"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Layers
var index_1 = __importDefault(require("./pathLayer/index"));
var index_2 = __importDefault(require("./animateLayer/index"));
exports.pathLayer = function (parameters) {
    return index_1.default(parameters);
};
exports.animateLayer = function (animateParameters, keyPathsParameters) {
    return index_2.default(animateParameters, keyPathsParameters);
};
