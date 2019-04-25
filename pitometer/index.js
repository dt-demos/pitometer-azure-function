"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
//pitometer modules required
var DynatraceSource = require('@pitometer/source-dynatrace').Source;
var ThresholdGrader = require('@pitometer/grader-threshold').Grader;
var Pitometer = require("@pitometer/pitometer").Pitometer;
var httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function () {
        var perfSpec, timeStart, timeEnd, pitometer, telemetryErr, telemetryResult, perfSpecString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context.log('HTTP trigger function processed a request.');
                    perfSpec = req.body.perfSpec;
                    timeStart = req.body.timeStart;
                    timeEnd = req.body.timeEnd;
                    pitometer = new Pitometer();
                    if (!perfSpec) {
                        context.res = {
                            status: 400,
                            body: ({ result: 'error', message: 'Missing perfSpec. Please check your request body and try again.' })
                        };
                    }
                    if (!timeStart) {
                        context.res = {
                            status: 400,
                            body: ({ result: 'error', message: 'Missing timeStart. Please check your request body and try again.' })
                        };
                    }
                    if (!timeEnd) {
                        context.res = {
                            status: 400,
                            body: ({ result: 'error', message: 'Missing timeEnd. Please check your request body and try again.' })
                        };
                    }
                    pitometer.addSource('Dynatrace', new DynatraceSource({
                        baseUrl: process.env.DYNATRACEURL,
                        apiToken: process.env.DYNATRACEKEY
                    }));
                    pitometer.addGrader('Threshold', new ThresholdGrader());
                    perfSpecString = JSON.stringify(perfSpec);
                    context.log("Passed in timeStart: " + timeStart + "  timeEnd: " + timeEnd);
                    context.log("Passed in perfSpecString: " + perfSpecString);
                    return [4 /*yield*/, pitometer.run(perfSpec, { timeStart: timeStart, timeEnd: timeEnd })
                            .then(function (results) { return telemetryResult = results; })["catch"](function (err) { return telemetryErr = err; })];
                case 1:
                    _a.sent();
                    if (telemetryErr) {
                        context.log("Result: " + telemetryErr.message);
                        context.res = {
                            status: 500,
                            body: ({ result: 'error', message: telemetryErr.message })
                        };
                    }
                    else {
                        context.log("Result: " + JSON.stringify(telemetryResult.result));
                        context.res = {
                            body: ({ telemetryResult: telemetryResult })
                        };
                    }
                    return [2 /*return*/];
            }
        });
    });
};
exports["default"] = httpTrigger;
