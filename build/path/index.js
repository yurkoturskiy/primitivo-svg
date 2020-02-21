"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
// Methods
var initState_1 = __importDefault(require("./initState"));
var setFrame_1 = __importDefault(require("./setFrame"));
var initPoints_1 = __importDefault(require("./initPoints"));
var transformPoints_1 = __importDefault(require("./transformPoints"));
var generateD_1 = __importDefault(require("./lib/generateD"));
exports.default = (function (parameters) {
    return pipeable_1.pipe(initState_1.default(parameters), setFrame_1.default, initPoints_1.default, transformPoints_1.default, generateD_1.default);
});
