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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var parser_1 = __importDefault(require("./parser"));
var codeWriter_1 = __importDefault(require("./codeWriter"));
var constants_1 = require("./constants");
var vmTranslater = function () {
    var directoryPath = process.argv[2];
    var allFiles = fs.readdirSync(path.resolve(__dirname, directoryPath));
    var files = allFiles.filter(function (file) {
        return file.endsWith('.vm');
    });
    var index = directoryPath.lastIndexOf('/');
    var fileName = directoryPath.slice(index) + '.asm';
    var codeWriter = new codeWriter_1.default(directoryPath + fileName);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var filePath = directoryPath + '/' + file;
        translate(file, filePath, codeWriter);
    }
};
var translate = function (fileName, filePath, codeWriter) {
    var parser = new parser_1.default(filePath);
    codeWriter.setFileName(fileName);
    while (parser.hasMoreCommands()) {
        switch (parser.commandType()) {
            case constants_1.C_ARITHMETIC:
                var command = parser.arg1();
                if (command) {
                    codeWriter.writeArithmetic(command);
                }
                break;
            case constants_1.C_PUSH:
            case constants_1.C_POP:
                var segment = parser.arg1();
                var index = parser.arg2();
                if (index === null) {
                    throw new Error('invalid index');
                }
                if (segment) {
                    codeWriter.writePushPop(parser.commandType(), segment, index);
                }
                break;
            case constants_1.C_LABEL:
                var label = parser.arg1();
                if (label) {
                    codeWriter.writeLabel(label);
                }
                break;
            case constants_1.C_GOTO:
                var gotoLabel = parser.arg1();
                if (gotoLabel) {
                    codeWriter.writeGoto(gotoLabel);
                }
                break;
            case constants_1.C_IF:
                var ifLabel = parser.arg1();
                if (ifLabel) {
                    codeWriter.writeIf(ifLabel);
                }
                break;
            case constants_1.C_FUNCTION:
                var functionName = parser.arg1();
                var numLocals = Number(parser.arg2());
                if (functionName) {
                    codeWriter.writeFunction(functionName, numLocals);
                }
                break;
            case constants_1.C_RETURN:
                codeWriter.writeReturn();
                break;
            case constants_1.C_CALL:
                var callFunctionName = parser.arg1();
                var numArgs = Number(parser.arg2());
                if (callFunctionName) {
                    codeWriter.writeCall(callFunctionName, numArgs);
                }
                break;
            default:
                throw new Error('invalid commandType');
        }
        parser.advance();
    }
};
vmTranslater();
