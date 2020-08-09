"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = __importDefault(require("./parser"));
var codeWriter_1 = __importDefault(require("./codeWriter"));
var constants_1 = require("./constants");
var vmTranslater = function () {
    var filePath = process.argv[2];
    var parser = new parser_1.default(filePath);
    var codeWriter = new codeWriter_1.default(filePath);
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
            default:
                throw new Error('invalid commandType');
        }
        parser.advance();
    }
};
vmTranslater();
