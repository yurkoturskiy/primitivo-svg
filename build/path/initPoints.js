"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
var generateVertexes_1 = __importDefault(require("./lib/generateVertexes"));
var remapVertexes_1 = __importDefault(require("./lib/remapVertexes"));
var setArms_1 = __importDefault(require("./lib/setArms"));
var initPoints = function (path) {
    return pipeable_1.pipe(generateVertexes_1.default(path), remapVertexes_1.default, setArms_1.default("init"));
};
exports.default = initPoints;
