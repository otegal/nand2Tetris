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
var parser_1 = __importDefault(require("./parser"));
var code_1 = __importDefault(require("./code"));
var symbolTable_1 = __importDefault(require("./symbolTable"));
var constants_1 = require("./constants");
var INPUT_PATH = '../src/rect/Rect.asm';
var OUTPUT_PATH = __dirname + '/Rect.hack';
var assembler = function () {
    var parser = new parser_1.default(INPUT_PATH);
    var code = new code_1.default();
    var symbolTable = new symbolTable_1.default();
    var romAddress = 0;
    var ramAddress = 16;
    // シンボル追加
    while (parser.hasMoreCommands()) {
        var commandType = parser.commandType();
        if (commandType === constants_1.A_COMMAND || commandType === constants_1.C_COMMAND) {
            romAddress = romAddress + 1;
        }
        else if (commandType === constants_1.L_COMMAND) {
            var symbol = parser.symbol();
            if (!symbolTable.contains(symbol)) {
                var address = '0x' + ('0000' + romAddress.toString(16)).slice(-4);
                symbolTable.addEntry(symbol, address);
            }
        }
        else {
            throw new Error('invalid commandType');
        }
        parser.advance();
    }
    // シンボル判定で回した分を戻す
    parser.lineCounter = 0;
    parser.currentCommand = parser.instructions[0];
    var machineCode;
    var machineCodes = [];
    // 機械語に変換
    while (parser.hasMoreCommands()) {
        var commandType = parser.commandType();
        if (commandType === constants_1.C_COMMAND) {
            var destMnemonic = parser.dest();
            var compMnemonic = parser.comp();
            var jumpMnemonic = parser.jump();
            var dest = code.dest(destMnemonic);
            var comp = code.comp(compMnemonic);
            var jump = code.jump(jumpMnemonic);
            machineCodes.push('111' + comp + dest + jump);
        }
        if (commandType === constants_1.A_COMMAND) {
            var symbol = parser.symbol();
            if (isNaN(parseInt(symbol))) {
                var address = void 0;
                if (symbolTable.contains(symbol)) {
                    address = symbolTable.getAddress(symbol);
                }
                else {
                    address = '0x' + ('0000' + ramAddress.toString(16).slice(-4));
                    symbolTable.addEntry(symbol, address);
                    ramAddress = ramAddress + 1;
                }
                machineCode = ('0000000000000000' + parseInt(address, 16).toString(2)).slice(-16);
            }
            else {
                machineCode = ('0000000000000000' + parseInt(symbol).toString(2)).slice(-16);
            }
            machineCodes.push(machineCode);
        }
        parser.advance();
    }
    fs.writeFileSync(OUTPUT_PATH, machineCodes.join('\n'));
};
assembler();
