"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var VMWriter = /** @class */ (function () {
    function VMWriter(filePath) {
        this.filePath = filePath;
        fs.writeFileSync(this.filePath, '');
    }
    VMWriter.prototype.writePush = function (segment, index) {
        fs.appendFileSync(this.filePath, "push " + segment + " " + index + '\n');
    };
    VMWriter.prototype.writePop = function (segment, index) {
        fs.appendFileSync(this.filePath, "pop " + segment + " " + index + '\n');
    };
    VMWriter.prototype.writeArithmetic = function (command) {
        fs.appendFileSync(this.filePath, command + '\n');
    };
    VMWriter.prototype.writeLabel = function (label) {
        fs.appendFileSync(this.filePath, "label " + label + '\n');
    };
    VMWriter.prototype.writeGoto = function (label) {
        fs.appendFileSync(this.filePath, "goto " + label + '\n');
    };
    VMWriter.prototype.writeIf = function (label) {
        fs.appendFileSync(this.filePath, "if-goto " + label + '\n');
    };
    VMWriter.prototype.writeCall = function (name, nArgs) {
        fs.appendFileSync(this.filePath, "call " + name + " " + nArgs + '\n');
    };
    VMWriter.prototype.writeFunction = function (name, nLocals) {
        fs.appendFileSync(this.filePath, "function " + name + " " + nLocals + '\n');
    };
    VMWriter.prototype.writeReturn = function () {
        fs.appendFileSync(this.filePath, 'return' + '\n');
    };
    return VMWriter;
}());
exports.default = VMWriter;
