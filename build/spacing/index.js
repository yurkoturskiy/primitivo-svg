"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
// misc functions
var prepareParameters_1 = __importDefault(require("./lib/prepareParameters"));
var calcKeySplines_1 = __importDefault(require("./lib/calcKeySplines"));
var transformSplines_1 = __importDefault(require("./lib/transformSplines"));
var spacingLayer = function (parameters) {
    return pipeable_1.pipe(prepareParameters_1.default(parameters), calcKeySplines_1.default, transformSplines_1.default);
};
exports.default = spacingLayer;
