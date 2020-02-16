"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Loglevel setup
var log = require("loglevel");
log.setLevel("warn");
log.getLogger("path-log").setLevel("warn");
log.getLogger("phases-log").setLevel("warn");
log.getLogger("spacing-log").setLevel("warn");
// Layers
var index_1 = require("./path/index");
exports.path = index_1.default;
var index_2 = require("./morphing/index");
exports.morphing = index_2.default;
var index_3 = require("./spacing/index");
exports.spacing = index_3.default;
var index_4 = require("./phases/index");
exports.phases = index_4.default;
// Misc functions
var index_5 = require("./misc/index");
exports.randomRange = index_5.randomRange;
exports.perVertex = index_5.perVertex;
exports.perArm = index_5.perArm;
